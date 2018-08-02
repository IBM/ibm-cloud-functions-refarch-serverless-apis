// Load the Cloudant library.
var Cloudant = require('@cloudant/cloudant');

var todo_db_name = "todos"
var content_type_header = {'Content-Type': 'application/json'}

function main(params) {
  // Initialize Cloudant from inputs
  var api_root_url = params.base_url;
  var username = params.username;
  var password = params.password;
  var cloudant = new Cloudant({account:username, password:password, plugins: 'promises'});

  return new Promise(function(resolve, reject) {
    asyncSafeDbCreate(cloudant.db)
    .then(function() {
      todo_db = cloudant.db.use(todo_db_name)
      item_path = params.__ow_path.replace(/^\/+/g, '')
      if (item_path == "") {
        return asyncToDoList(todo_db, api_root_url)
      } else {
        return asyncToDoGet(todo_db, api_root_url, item_path)
      }
    })
    .then(function(response_body) {
      resolve({
        headers: content_type_header,
        statusCode: 200,
        body: response_body
      })
    })
    .catch(function(err) {
      // If not found, we send a nicer error
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
            error: err
          }
        })
      }
    })
  })
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

function asyncSafeDbCreate(cloudant_db) {
  return new Promise(function(resolve, reject) {
    cloudant_db.create(todo_db_name)
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
