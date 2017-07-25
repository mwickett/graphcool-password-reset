// React
import React from 'react'
// GraphQL
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

class PasswordReset extends React.Component {

  constructor(props) {
    super(props)
    this.state = { email: '', resetToken: '', password: '', passwordAgain: '', status: '' }
  }

  componentWillMount() {
    let query = Object.assign({}, ...window.location.search.slice(1).split('&').map(item => {
      const property = item.split('=')[0]
      return { [property]: item.split('=')[1] }
    }))
    this.setState({ email: query.email, resetToken: query.token })
  }

  handleInput = (name, value) => {
    this.setState({ [name]: value })
  }

  resetPassword = () => {
    const { resetToken, password, passwordAgain } = this.state
    if (password === passwordAgain && password.length > 0) {
      this.props.resetPassword({ variables: { resetToken, password } })
      .then(id => { console.log(`Password restored for user with id ${id}`) })
      .catch(err => {
        const errorMessage = err.toString().split(':')
        this.setState({ status: errorMessage[errorMessage.length-1] })
      })
    }
  }

  render() {
    const { email, password, passwordAgain, status } = this.state
    return (
      <div>
        {status === '' &&
        <div>
          Reset password for {email}
          <input
            autoFocus={true}
            placeholder='Password'
            name='password'
            onChange={(name, value) => this.handleInput(name, value)}
            type='password'
            value={password}
          />
          <input
            placeholder='Password (verify)'
            name='passwordAgain'
            onChange={(name, value) => this.handleInput(name, value)}
            type='password'
            value={passwordAgain}
          />
          <input
            onClick={() => this.resetPassword()}
            text='Reset password'
            type='button'
          />
        </div>}
        {status === 'success'
          ? <div>Password successfully reset.</div>
          : <div>{status}</div>}
      </div>
    )
  }
}

const resetPasswordMutation = gql`
  mutation($resetToken: String!, $password: String!) {
    resetPassword(resetToken: $resetToken, password: $password) {
      id
    }
  }
`

export default graphql(resetPasswordMutation, { name: 'resetPassword' })(PasswordReset)
