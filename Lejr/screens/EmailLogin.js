import React, {Component} from 'react';
import {TouchableWithoutFeedback, Keyboard} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import * as yup from 'yup';
import {Layout, Button} from '@ui-kitten/components';
import {
  ButtonSpinner,
  onValidationError,
  InputField,
} from '../util/TextInputUI';
import {LocalData} from '../util/LocalData';
import FormStyles from '../util/FormStyles';
import {Screen} from '../util/Constants';
import {MergeState} from '../util/UtilityMethods';

export default class EmailLogin extends Component {
  constructor(props) {
    super();
    this.showConfirm = props.route.params.showConfirm;
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      isSubmitting: false,
    };
    this.emailRef = React.createRef();
    this.passwordRef = React.createRef();
    this.confirmPasswordRef = React.createRef();
    this.validationSchema = yup.object().shape({
      email: yup
        .string()
        .label('Email')
        .email()
        .required(),
      password: yup.lazy(() => {
        if (this.showConfirm) {
          return yup
            .string()
            .label('Password')
            .required()
            .min(8, 'Password too short')
            .test(
              'no-whitespace',
              'Do not use spaces in your password',
              function(value) {
                return !value.includes(' ');
              },
            );
        } else {
          return yup
            .string()
            .label('Password')
            .required();
        }
      }),
      confirmPassword: yup.lazy(() => {
        if (this.showConfirm) {
          return yup
            .string()
            .required()
            .label('Confirm password')
            .test(
              'passwords-match',
              'Passwords must match',
              function(value) {
                return this.state.password === value;
              }.bind(this),
            );
        } else {
          return yup.string();
        }
      }),
    });
  }

  componentDidMount() {
    console.log('Arrived at EmailLogin');
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={FormStyles.container}>
          <Layout style={FormStyles.buttonStyle}>
            <Button
              style={FormStyles.button}
              onPress={() => {
                if (this.showConfirm) {
                  this.props.navigation.navigate(Screen.CreateAccount);
                } else {
                  this.props.navigation.navigate(Screen.Login);
                }
              }}
              appearance="outline"
              disabled={this.state.isSubmitting}>
              Go back
            </Button>
            <Layout>
              {this.state.isSubmitting ? (
                <Button
                  style={FormStyles.button}
                  accessoryLeft={ButtonSpinner}
                  appearance="ghost"
                />
              ) : this.showConfirm ? (
                <Button
                  style={FormStyles.button}
                  onPress={() => {
                    console.log('Signing up with email');
                    this.validationSchema
                      .validate({
                        email: this.state.email,
                        password: this.state.password,
                        confirmPassword: this.state.confirmPassword,
                      })
                      .catch(error =>
                        onValidationError(error, [
                          [this.emailRef, this.state.email],
                          [this.passwordRef, this.state.password],
                          [this.confirmPasswordRef, this.state.confirmPassword],
                        ]),
                      )
                      .then(valid => {
                        if (valid) {
                          signUp(this.state.email, this.state.password, value =>
                            MergeState(this, {isSubmitting: value}),
                          );
                        }
                      });
                  }}>
                  Sign up
                </Button>
              ) : (
                <Button
                  style={FormStyles.button}
                  onPress={() => {
                    console.log('Signing in with email');
                    this.validationSchema
                      .validate({
                        email: this.state.email,
                        password: this.state.password,
                      })
                      .catch(error =>
                        onValidationError(error, [
                          [this.emailRef, this.state.email],
                          [this.passwordRef, this.state.password],
                        ]),
                      )
                      .then(valid => {
                        if (valid) {
                          signIn(this.state.email, this.state.password, value =>
                            MergeState(this, {isSubmitting: value}),
                          );
                        }
                      });
                  }}>
                  Sign in
                </Button>
              )}
            </Layout>
          </Layout>
          <Layout style={FormStyles.fieldStyle}>
            {this.showConfirm && (
              <InputField
                fieldError={this.state.confirmPasswordError}
                refToPass={this.confirmPasswordRef}
                validationSchema={this.validationSchema}
                fieldKey="confirmPassword"
                fieldParams={text => ({confirmPassword: text})}
                setField={value => MergeState(this, {confirmPassword: value})}
                setFieldError={value =>
                  MergeState(this, {confirmPasswordError: value})
                }
                placeholder="confirm password"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.confirmPassword}
                editable={!this.state.isSubmitting}
                secureTextEntry
              />
            )}
            <InputField
              fieldError={this.state.passwordError}
              refToPass={this.passwordRef}
              validationSchema={this.validationSchema}
              fieldKey="password"
              fieldParams={text => ({password: text})}
              setField={value => MergeState(this, {password: value})}
              setFieldError={value => MergeState(this, {passwordError: value})}
              placeholder="password"
              onSubmitEditing={() => {
                if (this.showConfirm) {
                  this.confirmPasswordRef.current.focus();
                } else {
                  Keyboard.dismiss();
                }
              }}
              value={this.state.password}
              editable={!this.state.isSubmitting}
              secureTextEntry
            />
            <InputField
              fieldError={this.state.emailError}
              refToPass={this.emailRef}
              validationSchema={this.validationSchema}
              fieldKey="email"
              fieldParams={text => ({email: text})}
              setField={value => MergeState(this, {email: value})}
              setFieldError={value => MergeState(this, {emailError: value})}
              placeholder="username@email.com"
              onSubmitEditing={() => {
                this.passwordRef.current.focus();
              }}
              value={this.state.email}
              editable={!this.state.isSubmitting}
              autoFocus
            />
          </Layout>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}

async function signUp(email, password, setIsSubmitting) {
  setIsSubmitting(true);
  email = email.trim();
  LocalData.user.email = email;

  return auth()
    .createUserWithEmailAndPassword(email, password)
    .then(
      () => {
        console.log('Signed up with email');
      },
      error => {
        onEmailLoginError(error);
        setIsSubmitting(false);
      },
    );
}

async function signIn(email, password, setIsSubmitting) {
  setIsSubmitting(true);
  email = email.trim();

  return auth()
    .signInWithEmailAndPassword(email, password)
    .then(
      () => {
        console.log('Signed in with email');
      },
      error => {
        onEmailLoginError(error);
        setIsSubmitting(false);
      },
    );
}

function onEmailLoginError(error) {
  console.warn(error);

  var code = error.userInfo.code;
  var message = error.userInfo.message;
  var alertTitle;

  switch (code) {
    case 'email-already-in-use':
      alertTitle = 'Email Already In Use';
      break;

    case 'invalid-email':
      alertTitle = 'Email Invalid';
      break;

    default:
      alertTitle = 'Email Login Error';
      break;
  }

  Alert.alert(alertTitle, message);
}
