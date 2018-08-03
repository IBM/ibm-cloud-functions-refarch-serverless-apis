// Common CRUD functions for the Cloudant backend
var Cloudant = require('@cloudant/cloudant');
var content_type_header = {'Content-Type': 'application/json'}

function getDb(params) {
  // Initialize Cloudant from inputs
  var username = params.username;
  var password = params.password;
  return new Cloudant({account:username, password:password, plugins: 'promises'});
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

function asyncToDoDelete(todo_db, api_root_url, item) {
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

module.exports = {
  getDb: getDb,
  getToDoID: getToDoID,
  asyncToDoGet: asyncToDoGet,
  asyncToDoList: asyncToDoList,
  asyncToDoDelete: asyncToDoDelete,
  asyncSafeDbCreate: asyncSafeDbCreate,
  resolveSuccessFunction: resolveSuccessFunction,
  rejectErrorsFunction:rejectErrorsFunction
}
