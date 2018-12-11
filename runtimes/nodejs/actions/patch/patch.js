// Load the Cloudant library.
var common = require('./common/utils.js')
var content_type_header = {'Content-Type': 'application/json'}

function patchHandler(params) {
  var headers = params.__ow_headers
  var api_root_url = '<undefined>'
  if (headers) {
    var api_root_url = headers['x-forwarded-url'];
  }
  cloudant = common.getDb(params)

  return new Promise(function(resolve, reject) {
    todo_db_name = common.getDbName(params)
    common.asyncSafeDbCreate(cloudant.db, todo_db_name)
    .then(function() {
      todo_db = cloudant.db.use(todo_db_name)
      // ID is mandatory
      todo_id = common.getToDoID(params)
      // In case of PATH we need to strip the TODO ID out of the x-forwarded-url
      api_root_url = api_root_url.replace(todo_id, '')
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
