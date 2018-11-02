// Load the Cloudant library.
var common = require('./common/utils.js')

function getHandler(params) {
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
      todo_id = common.getToDoID(params)
      console.log("Looking for todo_id: ", todo_id)
      if (todo_id == "") {
        return common.asyncToDoList(todo_db, api_root_url)
      } else {
        return common.asyncToDoGet(todo_db, api_root_url, todo_id)
      }
    })
    .then(common.resolveSuccessFunction(resolve))
    .catch(common.rejectErrorsFunction(reject))
  })
}

exports.main = getHandler;
