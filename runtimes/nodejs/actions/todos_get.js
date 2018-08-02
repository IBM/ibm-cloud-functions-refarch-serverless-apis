// Load the Cloudant library.
var Cloudant = require('@cloudant/cloudant');

// Initialize Cloudant with settings
// TODO Hardcoded service creds, need to come from local.env eventually
// andreaf_serverless, in US South
var username = "696015ef-b9c9-4dad-b578-cc3e5b3544e5-bluemix";
var password = "9a182bfc4a7ca3dd805b759b3603aeb1d803d8046158f5951ffa63b877a37a87";
var cloudant = new Cloudant({account:username, password:password, plugins: 'promises'});
var todo_db_name = "todos"
var content_type_header = {'Content-Type': 'application/json'}
var api_root_url = 'https://mycoolapi.me/todo'

function main(params) {
  return new Promise(function(resolve, reject) {
    asyncSafeDbCreate()
    .then(function() {
      todo_db = cloudant.db.use(todo_db_name)
      item_path = params.__ow_path.replace(/^\/+/g, '')
      if (item_path == "") {
        return asyncToDoList(todo_db)
      } else {
        return asyncToDoGet(todo_db, item_path)
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

function asyncToDoGet(todo_db, item) {
  return new Promise(function(resolve, reject) {
    found_todo = todo_db.get(item)
    .then(function(found_todo) {
      resolve(prepareToDo(found_todo))
    })
    .catch(function(err) {
        reject(err)
    })
  })
}

function asyncToDoList(todo_db) {
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
        return prepareToDo(row.doc)
      })
      resolve(response_body)
    })
    .catch(function(err) {
      reject(err)
    })
  })
}

function asyncSafeDbCreate() {
  return new Promise(function(resolve, reject) {
    cloudant.db.create(todo_db_name)
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

function prepareToDo(todo) {
  // Prepare the body for the response
  delete todo._rev
  id = todo._id
  delete todo._id
  todo.url = api_root_url + '/' + id
  return todo
}
