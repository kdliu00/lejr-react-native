import React from 'react';
import {StyleSheet, TouchableWithoutFeedback, Keyboard} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import * as yup from 'yup';
import {Layout, Text, Button, Input, Spinner} from '@ui-kitten/components';

export default function EmailLogin({route, navigation}) {
  const {showConfirm} = route.params;

  const [email, setEmail] = React.useState();
  const [password, setPassword] = React.useState();
  const [confirmPassword, setConfirmPassword] = React.useState();

  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .label('Email')
      .email()
      .required(),
    password: yup.lazy(() => {
      if (showConfirm) {
        return yup
          .string()
          .label('Password')
          .required()
          .min(8, 'Password too short');
      } else {
        return yup
          .string()
          .label('Password')
          .required();
      }
    }),
    confirmPassword: yup.lazy(() => {
      if (showConfirm) {
        return yup
          .string()
          .required()
          .label('Confirm password')
          .test('passwords-match', 'Passwords must match', function(value) {
            return password === value;
          });
      } else {
        return yup.string();
      }
    }),
  });

  const [emailError, setEmailError] = React.useState();
  const [passwordError, setPasswordError] = React.useState();
  const [confirmPasswordError, setConfirmPasswordError] = React.useState();

  const [isSubmitting, setIsSubmitting] = React.useState();

  const emailRef = React.createRef();
  const passwordRef = React.createRef();
  const confirmPasswordRef = React.createRef();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Layout style={styles.container}>
        <Layout style={styles.bottomContainer}>
          <Button
            color="darkgray"
            onPress={() => navigation.navigate('Login')}
            appearance="outline"
            disabled={isSubmitting}>
            Go Back
          </Button>
          {isSubmitting ? (
            <Spinner size="small" />
          ) : showConfirm ? (
            <Button
              onPress={() => {
                console.log('Signing up with email!');
                validationSchema
                  .validate({
                    email: email,
                    password: password,
                    confirmPassword: confirmPassword,
                  })
                  .catch(error =>
                    onValidationError(
                      error.message,
                      setIsSubmitting,
                      validationSchema,
                      email,
                      setEmailError,
                      password,
                      setPasswordError,
                      confirmPassword,
                      setConfirmPasswordError,
                    ),
                  )
                  .then(valid => {
                    if (valid) {
                      signUp(email, password, setIsSubmitting);
                    }
                  });
              }}>
              Sign Up
            </Button>
          ) : (
            <Button
              onPress={() => {
                console.log('Signing in with email!');
                validationSchema
                  .validate({
                    email: email,
                    password: password,
                  })
                  .catch(error =>
                    onValidationError(
                      error.message,
                      setIsSubmitting,
                      validationSchema,
                      email,
                      setEmailError,
                      password,
                      setPasswordError,
                      confirmPassword,
                      setConfirmPasswordError,
                    ),
                  )
                  .then(valid => {
                    if (valid) {
                      signIn(email, password, setIsSubmitting);
                    }
                  });
              }}>
              Sign In
            </Button>
          )}
        </Layout>
        <Layout style={styles.loginFields}>
          <InputField
            fieldError={emailError}
            isSubmitting={isSubmitting}
            refToPass={emailRef}
            placeholder="username@email.com"
            onChangeText={text => {
              setEmail(text);
              validateEmail(validationSchema, text, setEmailError);
            }}
            onSubmitEditing={() => {
              passwordRef.current.focus();
            }}
            value={email}
            autoFocus
          />
          <InputField
            fieldError={passwordError}
            isSubmitting={isSubmitting}
            refToPass={passwordRef}
            placeholder="password"
            onChangeText={text => {
              setPassword(text);
              validatePassword(validationSchema, text, setPasswordError);
            }}
            onSubmitEditing={() => {
              if (showConfirm) {
                confirmPasswordRef.current.focus();
              } else {
                Keyboard.dismiss();
              }
            }}
            value={password}
            secureTextEntry
          />
          {showConfirm && (
            <InputField
              fieldError={confirmPasswordError}
              isSubmitting={isSubmitting}
              refToPass={confirmPasswordRef}
              placeholder="confirm password"
              onChangeText={text => {
                setConfirmPassword(text);
                validateConfirmPassword(
                  validationSchema,
                  text,
                  setConfirmPasswordError,
                );
              }}
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
              value={confirmPassword}
              secureTextEntry
            />
          )}
        </Layout>
      </Layout>
    </TouchableWithoutFeedback>
  );
}

function signUp(email, password, setIsSubmitting) {
  setIsSubmitting(true);
  auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(error => {
      onEmailLoginError(error, setIsSubmitting);
    })
    .then(
      () => {
        console.log('Signed up with email!');
      },
      () => {
        console.warn('Sign up with email failed!');
        setIsSubmitting(false);
      },
    );
}

function signIn(email, password, setIsSubmitting) {
  setIsSubmitting(true);
  auth()
    .signInWithEmailAndPassword(email, password)
    .catch(error => {
      onEmailLoginError(error, setIsSubmitting);
    })
    .then(
      () => {
        console.log('Signed in with email!');
      },
      () => {
        console.warn('Sign in with email failed!');
        setIsSubmitting(false);
      },
    );
}

function onEmailLoginError(error, setIsSubmitting) {
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
  console.warn(errorCode);
  Alert.alert(alertTitle, message);

  setIsSubmitting(false);
}

function onValidationError(
  message,
  setIsSubmitting,
  validationSchema,
  email,
  setEmailError,
  password,
  setPasswordError,
  confirmPassword,
  setConfirmPasswordError,
) {
  console.warn(message);
  validateEmail(validationSchema, email, setEmailError);
  validatePassword(validationSchema, password, setPasswordError);
  validateConfirmPassword(
    validationSchema,
    confirmPassword,
    setConfirmPasswordError,
  );
  setIsSubmitting(false);
}

function validateEmail(validationSchema, text, setEmailError) {
  validationSchema
    .validateAt('email', {email: text})
    .catch(error => {
      setEmailError(error.message);
    })
    .then(valid => {
      if (valid) {
        setEmailError('');
      }
    });
}

function validatePassword(validationSchema, text, setPasswordError) {
  validationSchema
    .validateAt('password', {password: text})
    .catch(error => {
      setPasswordError(error.message);
    })
    .then(valid => {
      if (valid) {
        setPasswordError('');
      }
    });
}

function validateConfirmPassword(
  validationSchema,
  text,
  setConfirmPasswordError,
) {
  validationSchema
    .validateAt('confirmPassword', {confirmPassword: text})
    .catch(error => {
      setConfirmPasswordError(error.message);
    })
    .then(valid => {
      if (valid) {
        setConfirmPasswordError('');
      }
    });
}

const InputFieldWrapper = ({fieldError, children}) => (
  <Layout style={styles.textInputWrapper}>
    <Text style={styles.errorText}>{fieldError}</Text>
    {children}
  </Layout>
);

const InputField = ({refToPass, isSubmitting, fieldError, value, ...rest}) => {
  return (
    <InputFieldWrapper fieldError={fieldError}>
      <Input
        ref={refToPass}
        style={styles.textInput}
        clearButtonMode="always"
        autoCorrect={false}
        autoCapitalize="none"
        enablesReturnKeyAutomatically={true}
        blurOnSubmit={false}
        returnKeyType="done"
        editable={!isSubmitting}
        status={fieldError ? 'danger' : value ? 'success' : 'basic'}
        {...rest}
      />
    </InputFieldWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  loginFields: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  textInput: {
    width: '100%',
    height: 36,
    marginTop: 3,
  },
  textInputWrapper: {
    width: '65%',
    marginTop: 15,
  },
  bottomContainer: {
    height: '25%',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column-reverse',
    margin: 30,
  },
  errorText: {
    color: 'red',
  },
});
