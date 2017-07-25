// React
import React from 'react'
// GraphQL
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

class PasswordReset extends React.Component {

  constructor(props) {
    super(props)
    this.state = { password: '', passwordAgain: '' }
    this.handleInput = this.handleInput.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
  }

  handleInput(name, value) {
    this.setState({ [name]: value })
  }

  resetPassword() {
    const { password, passwordAgain } = this.state
    if (password === passwordAgain && password.length > 0) {
      this.props.resetPassword({ variables: { resetToken: window.location.pathname.split('/reset/').pop(), password } })
    }
  }

  render() {
    const { password, passwordAgain } = this.state
    return (
      <div>
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
