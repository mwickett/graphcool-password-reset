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
			this.props.updatePassword({ variables: { userId: this.props.data.allUsers[0].id, password }})
		}
	}

	render() {
		if (this.props.data.loading) {
			return <div>Loading...</div>
		}
		const { lang } = this.props.state
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

const tokenQuery = gql`
	query($userFilter: UserFilter) {
		allUsers(filter: $userFilter) {
			id
			resetToken
		}
	}
`

// Still need correct updatePassword mutation
const resetPasswordMutation = gql`
	mutation($userId: ID!, $password: String!) {
		updatePassword: updateUser(id: $userId, password: $password) {
			id
		}
	}
`

export default graphql(tokenQuery, {
	options: () => ({
		variables: { userFilter: { resetToken: window.location.pathname.split('/reset/').pop() } }
	})
})(
	graphql(resetPasswordMutation, { name: 'updatePassword' })(PasswordReset)
)
