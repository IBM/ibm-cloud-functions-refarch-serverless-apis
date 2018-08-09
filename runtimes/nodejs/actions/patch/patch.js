// Load the Cloudant library.
var common = require('./common/utils.js')
var content_type_header = {'Content-Type': 'application/json'}

var todo_db_name = "todos"

function patchHandler(params) {
  var api_root_url = params.base_url;
  cloudant = common.getDb(params)

  return new Promise(function(resolve, reject) {
    common.asyncSafeDbCreate(cloudant.db, todo_db_name)
    .then(function() {
      todo_db = cloudant.db.use(todo_db_name)
      // ID is mandatory
      todo_id = common.getToDoID(params)
      if (! todo_id) {
        reject({
          statusCode: 400,
          headers: content_type_header,
          body: {
            error: "ID in the path of the todo to patch is mandatory."
          }
        })
      } else {
        return common.asyncToDoPatch(todo_db, api_root_url, todo_id, params)
      }
    })
    .then(common.resolveSuccessFunction(resolve))
    .catch(common.rejectErrorsFunction(reject))
  })
}

exports.main = patchHandler;
