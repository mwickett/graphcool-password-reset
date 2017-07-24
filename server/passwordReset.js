const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')

module.exports = function(event) {
  const userId = event.data.id
  const newPassword = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const saltRounds = 10

  function updateGraphcoolUser(id, newPasswordHash) {
    return api.request(`
      mutation {
        updateUser(
          id: "${id}",
          password: "${newPasswordHash}"
        ) {
          id
        }
      }`)
      .then(userMutationResult => (userMutationResult.updateUser.id))
  }

  return bcrypt.hash(newPassword, saltRounds)
    .then(hash => updateGraphcoolUser(userId, hash))
    .then(id => ({ data: { id } }))
    .catch(error => ({ error: error.toString() }))
}
