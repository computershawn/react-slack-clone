import React, { Component } from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: 'Please fill in all fields.' };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state.password, this.state.passwordConfirmation)) {
      error = { message: 'Password is invalid.' };
      this.setState({ errors: errors.concat(error) });
      return false;
    }

    return true;
  }

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return !username.length || !email.length || !password.length || !passwordConfirmation.length;
  }

  isPasswordValid = (password, passwordConfirmation) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    }
    return true;
  }

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true })
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          console.log(createdUser);
          this.setState({ loading: false });
        })
        .catch(err => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false,
          });
        })
    }
  }

  handleInputError = (errors, inputName) => {
    return errors.some(error =>
      error.message.toLowerCase().includes(inputName)
    )
      ? 'error'
      : '';
  }

  render() {
    const { username, email, password, passwordConfirmation, errors, loading } = this.state;

    return (
      <Grid className="app" textAlign="center" verticalAlign="middle">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register for ConvoChat 9000
          </Header>

          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input className={this.handleInputError(errors, 'username')} value={username} fluid name="username" icon="user" iconPosition="left" placeholder="Username" onChange={this.handleChange} type="text" />
              <Form.Input className={this.handleInputError(errors, 'email')} value={email} fluid name="email" icon="mail" iconPosition="left" placeholder="Email Adress" onChange={this.handleChange} type="email" />
              <Form.Input className={this.handleInputError(errors, 'password')} value={password} fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} type="password" />
              <Form.Input className={this.handleInputError(errors, 'password')} value={passwordConfirmation} fluid name="passwordConfirmation" icon="repeat" iconPosition="left" placeholder="Password Confirmation" onChange={this.handleChange} type="password" />
              <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">Submit</Button>
            </Segment>
            <Message>Alread a user? <Link to="/login">Login</Link></Message>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
