import React from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import * as yup from 'yup';
import {Layout, Text, Button, Input, Spinner} from '@ui-kitten/components';

export default function EmailLogin({route, navigation}) {
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
          .min(8, 'Password too short');
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

  const [EmailError, SetEmailError] = React.useState();
  const [PasswordError, SetPasswordError] = React.useState();
  const [ConfirmPasswordError, SetConfirmPasswordError] = React.useState();

  const [IsSubmitting, SetIsSubmitting] = React.useState();

  const EmailRef = React.createRef();
  const PasswordRef = React.createRef();
  const ConfirmPasswordRef = React.createRef();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={Styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <Layout style={Styles.bottomContainer}>
            <Button
              color="darkgray"
              onPress={() => navigation.navigate('Login')}
              appearance="outline"
              disabled={IsSubmitting}>
              Go Back
            </Button>
            {IsSubmitting ? (
              <Spinner size="small" />
            ) : ShowConfirm ? (
              <Button
                onPress={() => {
                  console.log('Signing up with email!');
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
                Sign Up
              </Button>
            ) : (
              <Button
                onPress={() => {
                  console.log('Signing in with email!');
                  ValidationSchema.validate({
                    email: Email,
                    password: Password,
                  })
                    // .catch(error => onValidationError(error))
                    .then(valid => {
                      if (valid) {
                        signIn(Email, Password, SetIsSubmitting);
                      }
                    });
                }}>
                Sign In
              </Button>
            )}
          </Layout>
          <Layout style={Styles.loginFields}>
            <InputField
              fieldError={EmailError}
              isSubmitting={IsSubmitting}
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
              autoFocus
            />
            <InputField
              fieldError={PasswordError}
              isSubmitting={IsSubmitting}
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
              secureTextEntry
            />
            {ShowConfirm && (
              <InputField
                fieldError={ConfirmPasswordError}
                isSubmitting={IsSubmitting}
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
                secureTextEntry
              />
            )}
          </Layout>
        </Layout>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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

function onValidationError(error, fieldRefs) {
  console.warn(error.message);
  fieldRefs.forEach(ref => ref[0].current.props.onChangeText(ref[1]));
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

const InputFieldWrapper = ({fieldError, children}) => (
  <Layout style={Styles.textInputWrapper}>
    <Text style={Styles.errorText}>{fieldError}</Text>
    {children}
  </Layout>
);

const InputField = ({
  refToPass,
  isSubmitting,
  fieldError,
  validationSchema,
  fieldKey,
  fieldParams,
  setField,
  setFieldError,
  value,
  ...rest
}) => {
  function validateField(text) {
    setField(text);
    validationSchema
      .validateAt(fieldKey, fieldParams(text))
      .catch(error => {
        setFieldError(error.message);
      })
      .then(valid => {
        if (valid) {
          setFieldError('');
        }
      });
  }

  return (
    <InputFieldWrapper fieldError={fieldError}>
      <Input
        ref={refToPass}
        style={Styles.textInput}
        clearButtonMode="always"
        autoCorrect={false}
        autoCapitalize="none"
        enablesReturnKeyAutomatically={true}
        editable={!isSubmitting}
        status={fieldError ? 'danger' : value ? 'success' : 'basic'}
        onChangeText={text => validateField(text)}
        {...rest}
      />
    </InputFieldWrapper>
  );
};

const Styles = StyleSheet.create({
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
