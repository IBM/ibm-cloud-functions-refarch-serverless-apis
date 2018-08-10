// Common CRUD functions for the Cloudant backend
var Cloudant = require('@cloudant/cloudant');
const content_type_header = {'Content-Type': 'application/json'}
const valid_fields = ['title', 'order', 'completed']

function getDb(params) {
  // Initialize Cloudant from inputs
  console.log("Call params: ", params)
  var username = params.username;
  var password = params.password;
  return new Cloudant({account:username, password:password, plugins: 'promises'});
}

function getDbName(params) {
  auth_header = params.__ow_headers.authorization
  if (auth_header) {
    // The request is authenticated via AppID with a JWT token
    jwt_token = auth_header.split(' ')[1]
    b64_payload = jwt_token.split('.')[1]
    payload = new Buffer(b64_payload, 'base64').toString('ascii')
    subject = JSON.parse(payload)['sub']
    console.log("subject:", subject)
    return "todos_" + subject
  } else {
    return "todos"
  }
}

function getToDoID(params) {
  return params.__ow_path.replace(/^\/+/g, '')
}

function asyncToDoGet(todo_db, api_root_url, item) {
  return new Promise(function(resolve, reject) {
    found_todo = todo_db.get(item)
    .then(function(found_todo) {
      resolve(prepareToDo(found_todo, api_root_url))
    })
    .catch(function(err) {
        reject(err)
    })
  })
}

function asyncToDoList(todo_db, api_root_url) {
  return new Promise(function(resolve, reject) {
    found_todos = todo_db.list()
    .then(function(found_todos) {
      if (found_todos.total_rows == 0) {
        resolve([])
      } else {
        // Get the list of keys to fetch
        var keys = found_todos.rows.map(function(row) {
          return row.key
        })
        console.log("Found keys: ", keys)
        return todo_db.fetch({'keys': keys})
      }
    })
    .then(function(fetched_docs) {
      // Format the reponse body as a list
      var response_body = fetched_docs.rows.map(function(row) {
        return prepareToDo(row.doc, api_root_url)
      })
      resolve(response_body)
    })
    .catch(function(err) {
      reject(err)
    })
  })
}

function asyncToDoDelete(todo_db, item) {
  return new Promise(function(resolve, reject) {
    found_todo = todo_db.get(item)
    .then(function(found_todo) {
      return(todo_db.destroy(found_todo._id, found_todo._rev))
    })
    .then(function(destroyed) {
      // We return nothing on DELETE
      resolve({})
    })
    .catch(function(err) {
      reject(err)
    })
  })
}

function asyncToDoDeleteAll(todo_db) {
  return new Promise(function(resolve, reject) {
    found_todos = todo_db.list()
    .then(function(found_todos) {
      if (found_todos.total_rows == 0) {
        resolve([])
      } else {
        // Get the list of keys to fetch
        var bulk_delete_params = found_todos.rows.map(function(row) {
          return {
            '_id' : row.key,
            '_rev': row.value.rev,
            '_deleted': true
          }
        })
        return todo_db.bulk({'docs': bulk_delete_params})
      }
    })
    .then(function(destroyed) {
      // We return nothing on DELETE
      resolve([])
    })
    .catch(function(err) {
      reject(err)
    })
  })
}

function asyncToDoPost(todo_db, api_root_url, params) {
  return new Promise(function(resolve, reject) {
    new_document = getDocumentFromParams(params)
    return todo_db.insert(new_document)
    .then(function(created_todo) {
      return asyncToDoGet(todo_db, api_root_url, created_todo.id)
    })
    .then(function (retrieved_todo) {
      resolve(retrieved_todo)
    })
    .catch(function(err) {
        reject(err)
    })
  })
}

function asyncToDoPatch(todo_db, api_root_url, todo_id, params) {
  return new Promise(function(resolve, reject) {
    return todo_db.get(todo_id)
    .then(function(original) {
      if (! original) {
        reject({
          statusCode: 404,
          headers: content_type_header,
          body: {
            error: "Document to be patch could not be found."
          }
        })
      } else {
        patched_document = patchDocumentFromParams(original, params)
        // Patched document still includes _id and _rev.
        return todo_db.insert(patched_document)
      }
    })
    .then(function(patched_todo) {
      return asyncToDoGet(todo_db, api_root_url, patched_todo.id)
    })
    .then(function (retrieved_todo) {
      resolve(retrieved_todo)
    })
    .catch(function(err) {
        reject(err)
    })
  })
}

function asyncSafeDbCreate(cloudant_db, db_name) {
  return new Promise(function(resolve, reject) {
    cloudant_db.create(db_name)
    .catch(function(err) {
      if (err._data.error == 'file_exists') {
        console.log("DB already exists")
      } else {
        reject(err)
      }
    })
    .then(function(todo_db) {
      resolve(todo_db)
    })
  })
}

function prepareToDo(todo, api_root_url) {
  // Prepare the body for the response
  delete todo._rev
  id = todo._id
  delete todo._id
  todo.url = api_root_url + '/' + id
  return todo
}

function resolveSuccessFunction(resolve) {
  return function(response_body) {
    resolve({
      headers: content_type_header,
      statusCode: 200,
      body: response_body
    })
  }
}

function rejectErrorsFunction(reject) {
  return function(err) {
    console.log("Rejecting:", err)
    // If not found, we send a 404 error. In any case we don't let the
    // whole stack trace through to the API. We put it in the logs instead.
    if (err._data.error == 'not_found') {
      reject({
        statusCode: 404,
        headers: content_type_header,
        body: {
          error: err._data.error
        }
      })
    } else {
      reject({
        statusCode: 500,
        headers: content_type_header,
        body: {
          error: err._data.error
        }
      })
    }
  }
}

function getDocumentFromParams(params) {
  // ID and invalid parameters in general, if passed in the original request
  // are ignored.
  new_document = Object.keys(params).reduce(function(new_document, key) {
    if (valid_fields.includes(key)) new_document[key] = params[key]
    return new_document
  }, {})
  // Set a default value for completed
  if (! new_document.completed) new_document.completed = false
  return new_document
}

function patchDocumentFromParams(original, params) {
  updates = getDocumentFromParams(params)
  return Object.assign(original, updates)
}

module.exports = {
  getDb: getDb,
  getToDoID: getToDoID,
  getDbName: getDbName,
  asyncToDoGet: asyncToDoGet,
  asyncToDoList: asyncToDoList,
  asyncToDoPost: asyncToDoPost,
  asyncToDoPatch: asyncToDoPatch,
  asyncToDoDelete: asyncToDoDelete,
  asyncToDoDeleteAll: asyncToDoDeleteAll,
  asyncSafeDbCreate: asyncSafeDbCreate,
  resolveSuccessFunction: resolveSuccessFunction,
  rejectErrorsFunction:rejectErrorsFunction
}
