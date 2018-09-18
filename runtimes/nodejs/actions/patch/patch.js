// Load the Cloudant library.
var common = require('./common/utils.js')
var content_type_header = {'Content-Type': 'application/json'}

function patchHandler(params) {
  var api_root_url = params.__ow_headers['x-forwarded-url'];
  cloudant = common.getDb(params)

  return new Promise(function(resolve, reject) {
    todo_db_name = common.getDbName(params)
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
