// Load the Cloudant library.
var common = require('./common/utils.js')

function deleteHandler(params) {
  var api_root_url = params.__ow_headers['x-forwarded-url'];
  cloudant = common.getDb(params)

  return new Promise(function(resolve, reject) {
    todo_db_name = common.getDbName(params)
    common.asyncSafeDbCreate(cloudant.db, todo_db_name)
    .then(function() {
      todo_db = cloudant.db.use(todo_db_name)
      todo_id = common.getToDoID(params)
      if (todo_id == "") {
        return common.asyncToDoDeleteAll(todo_db)
      } else {
        return common.asyncToDoDelete(todo_db, todo_id)
      }
    })
    .then(common.resolveSuccessFunction(resolve))
    .catch(common.rejectErrorsFunction(reject))
  })
}

exports.main = deleteHandler;
