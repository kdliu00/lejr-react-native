import React from 'react';
import {StyleSheet, TouchableWithoutFeedback, Keyboard} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import * as yup from 'yup';
import {Layout, Button, Spinner} from '@ui-kitten/components';
import {
  ButtonSpinner,
  onValidationError,
  InputField,
} from '../util/TextInputUI';
import {LocalData} from '../util/LocalData';
import FormStyles from '../util/FormStyles';
import {Screens} from '../util/Constants';

export default function EmailLogin({route, navigation}) {
  console.log('Arrived at EmailLogin');

  const {showConfirm: ShowConfirm} = route.params;

  const [Email, SetEmail] = React.useState('');
  const [Password, SetPassword] = React.useState('');
  const [ConfirmPassword, SetConfirmPassword] = React.useState('');

  const ValidationSchema = yup.object().shape({
    email: yup
      .string()
      .label('Email')
      .email()
      .required(),
    password: yup.lazy(() => {
      if (ShowConfirm) {
        return yup
          .string()
          .label('Password')
          .required()
          .min(8, 'Password too short')
          .test('no-whitespace', 'Do not use spaces in your password', function(
            value,
          ) {
            return !value.includes(' ');
          });
      } else {
        return yup
          .string()
          .label('Password')
          .required();
      }
    }),
    confirmPassword: yup.lazy(() => {
      if (ShowConfirm) {
        return yup
          .string()
          .required()
          .label('Confirm password')
          .test('passwords-match', 'Passwords must match', function(value) {
            return Password === value;
          });
      } else {
        return yup.string();
      }
    }),
  });

  const [EmailError, SetEmailError] = React.useState('');
  const [PasswordError, SetPasswordError] = React.useState('');
  const [ConfirmPasswordError, SetConfirmPasswordError] = React.useState('');

  const [IsSubmitting, SetIsSubmitting] = React.useState(false);

  const EmailRef = React.useRef();
  const PasswordRef = React.useRef();
  const ConfirmPasswordRef = React.useRef();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Layout style={FormStyles.container}>
        <Layout style={FormStyles.loginButtons}>
          <Layout style={FormStyles.dynamicButton}>
            {IsSubmitting ? (
              <Button
                style={FormStyles.button}
                accessoryLeft={ButtonSpinner}
                appearance="ghost"
              />
            ) : ShowConfirm ? (
              <Button
                style={FormStyles.button}
                onPress={() => {
                  console.log('Signing up with email');
                  ValidationSchema.validate({
                    email: Email,
                    password: Password,
                    confirmPassword: ConfirmPassword,
                  })
                    .catch(error =>
                      onValidationError(error, [
                        [EmailRef, Email],
                        [PasswordRef, Password],
                        [ConfirmPasswordRef, ConfirmPassword],
                      ]),
                    )
                    .then(valid => {
                      if (valid) {
                        signUp(Email, Password, SetIsSubmitting);
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
                  ValidationSchema.validate({
                    email: Email,
                    password: Password,
                  })
                    .catch(error =>
                      onValidationError(error, [
                        [EmailRef, Email],
                        [PasswordRef, Password],
                      ]),
                    )
                    .then(valid => {
                      if (valid) {
                        signIn(Email, Password, SetIsSubmitting);
                      }
                    });
                }}>
                Sign in
              </Button>
            )}
          </Layout>
          <Button
            style={FormStyles.button}
            onPress={() => {
              if (ShowConfirm) {
                navigation.navigate(Screens.CreateAccount);
              } else {
                navigation.navigate(Screens.Login);
              }
            }}
            appearance="outline"
            disabled={IsSubmitting}>
            Go back
          </Button>
        </Layout>
        <Layout style={FormStyles.loginFields}>
          {ShowConfirm && (
            <InputField
              fieldError={ConfirmPasswordError}
              refToPass={ConfirmPasswordRef}
              validationSchema={ValidationSchema}
              fieldKey="confirmPassword"
              fieldParams={text => ({confirmPassword: text})}
              setField={SetConfirmPassword}
              setFieldError={SetConfirmPasswordError}
              placeholder="confirm password"
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
              value={ConfirmPassword}
              editable={!IsSubmitting}
              secureTextEntry
            />
          )}
          <InputField
            fieldError={PasswordError}
            refToPass={PasswordRef}
            validationSchema={ValidationSchema}
            fieldKey="password"
            fieldParams={text => ({password: text})}
            setField={SetPassword}
            setFieldError={SetPasswordError}
            placeholder="password"
            onSubmitEditing={() => {
              if (ShowConfirm) {
                ConfirmPasswordRef.current.focus();
              } else {
                Keyboard.dismiss();
              }
            }}
            value={Password}
            editable={!IsSubmitting}
            secureTextEntry
          />
          <InputField
            fieldError={EmailError}
            refToPass={EmailRef}
            validationSchema={ValidationSchema}
            fieldKey="email"
            fieldParams={text => ({email: text})}
            setField={SetEmail}
            setFieldError={SetEmailError}
            placeholder="username@email.com"
            onSubmitEditing={() => {
              PasswordRef.current.focus();
            }}
            value={Email}
            editable={!IsSubmitting}
            autoFocus
          />
        </Layout>
      </Layout>
    </TouchableWithoutFeedback>
  );
}

async function signUp(email, password, setIsSubmitting) {
  setIsSubmitting(true);
  email = email.trim();
  LocalData.user.email = email;

  return auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(error => {
      onEmailLoginError(error);
    })
    .then(
      () => {
        console.log('Signed up with email');
      },
      error => {
        console.warn('Sign up with email failed: ' + error.message);
        setIsSubmitting(false);
      },
    );
}

async function signIn(email, password, setIsSubmitting) {
  setIsSubmitting(true);
  email = email.trim();

  return auth()
    .signInWithEmailAndPassword(email, password)
    .catch(error => {
      onEmailLoginError(error);
    })
    .then(
      () => {
        console.log('Signed in with email');
      },
      error => {
        console.warn('Sign in with email failed: ' + error.message);
        setIsSubmitting(false);
      },
    );
}

function onEmailLoginError(error) {
  var errorCode = error.userInfo.code;
  var message = error.userInfo.message;
  var alertTitle = '<INSERT ALERT TITLE>';

  switch (errorCode) {
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
