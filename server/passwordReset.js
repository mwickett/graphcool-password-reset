const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')

module.exports = function(event) {
  const userId = event.data.id
  const newPassword = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const saltRounds = 10

  function getTokenExpiration(id) {
    return api.request(`
    query {
      User(id: "${id}"){
        id
        resetExpires
      }
    }`)
      .then(userQueryResult => {
        if (userQueryResult.error) {
          return Promise.reject(userQueryResult.error)
        } else {
          return userQueryResult.User
        }
      })
  }

  function updateGraphcoolUser(id, newPasswordHash) {
    return api.request(`
      mutation {
        updateUser(
          id: "${id}",
          password: "${newPasswordHash}",
          resetToken: "",
          resetExpires: ""
        ) {
          id
        }
      }`)
      .then(userMutationResult => (userMutationResult.updateUser.id))
  }

  return getTokenExpiration(userId)
    .then(graphcoolUser => {
      if (graphcoolUser === null) {
        return Promise.reject("Invalid credentials")
      } else if(new Date() > new Date(graphcoolUser.resetExpires)) {
        return Promise.reject("Token expired")
      } else {
        return bcrypt.hash(newPassword, saltRounds)
          .then(hash => updateGraphcoolUser(userId, hash))
          .then(id => ({ data: { id } }))
          .catch(error => ({ error: error.toString() }))
      }
    })
}
