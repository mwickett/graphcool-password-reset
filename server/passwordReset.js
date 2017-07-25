const fromEvent = require('graphcool-lib').fromEvent
const bcrypt = require('bcrypt')

module.exports = function (event) {
  const token = event.data.resetToken
  const newPassword = event.data.password
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
  const saltRounds = 10

  function getTokenExpiration (token) {
    return api.request(`
      query ResetToken($resetToken: String!) {
        allUsers(filter: {
          resetToken: ${token}
        }) {
          id
      }
  }
    }`)
      .then(userQueryResult => {
        if (userQueryResult.error) {
          return Promise.reject(userQueryResult.error)
        } else {
          return userQueryResult.data.allUsers[0].id
        }
      })
  }

  function updateGraphcoolUser (id, newPasswordHash) {
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

  return getTokenExpiration(token)
    .then(graphcoolUser => {
      console.log(graphcoolUser)
      const userId = graphcoolUser
      if (graphcoolUser === null) {
        return Promise.reject("Invalid credentials")
      } else if (new Date() > new Date(graphcoolUser.resetExpires)) {
        return Promise.reject("Token expired")
      } else {
        return bcrypt.hash(newPassword, saltRounds)
          .then(hash => updateGraphcoolUser(userId, hash))
          .then(id => ({ data: { id } }))
          .catch(error => ({ error: error.toString() }))
      }
    })
}
