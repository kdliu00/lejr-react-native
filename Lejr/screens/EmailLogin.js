import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import * as yup from 'yup';

var isSubmitting = false;

var fieldErrorMessages = {
  email: '',
  password: '',
  confirmPassword: '',
};

export default function EmailLogin({route, navigation}) {
  console.log('Arrived at EmailLogin!');

  const {showConfirm} = route.params;

  const [email, onEditEmail] = React.useState();
  const [password, onEditPassword] = React.useState();
  const [confirmPassword, onEditConfirmPassword] = React.useState();

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
    confirmPassword: yup
      .string()
      .required()
      .label('Confirm password')
      .test('passwords-match', 'Passwords must match', function(value) {
        return this.parent.password === value;
      }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.bottom}>
        <Button
          title="Go Back"
          color="darkgray"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
      <View style={styles.loginButtons}>
        {isSubmitting ? (
          <ActivityIndicator />
        ) : showConfirm ? (
          <View style={styles.button}>
            <Button
              title="Sign Up"
              onPress={() => {
                console.log('Signing up with email!');
                isSubmitting = true;
                validatedSignUp(
                  validationSchema,
                  email,
                  password,
                  confirmPassword,
                );
              }}
            />
          </View>
        ) : (
          <View style={styles.button}>
            <Button
              title="Sign In"
              onPress={() => {
                console.log('Signing in with email!');
                isSubmitting = true;
                validatedSignIn(validationSchema, email, password);
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.loginFields}>
        <InputField
          fieldKey="email"
          placeholder="username@email.com"
          onChangeText={text => {
            onEditEmail(text);
            validationSchema
              .validateAt('email', {email: email})
              .catch(error => {
                fieldErrorMessages.email = error.message;
              });
          }}
          value={email}
          autoFocus
        />
        <InputField
          fieldKey="password"
          placeholder="password"
          onChangeText={text => {
            onEditPassword(text);
            validationSchema
              .validateAt('password', {password: password})
              .catch(error => {
                fieldErrorMessages.password = error.message;
              });
          }}
          value={password}
          secureTextEntry
        />
        {showConfirm && (
          <InputField
            fieldKey="confirmPassword"
            placeholder="confirm password"
            onChangeText={text => {
              onEditConfirmPassword(text);
              validationSchema
                .validateAt('confirmPassword', {
                  confirmPassword: confirmPassword,
                })
                .catch(error => {
                  fieldErrorMessages.confirmPassword = error.message;
                });
            }}
            value={confirmPassword}
            secureTextEntry
          />
        )}
      </View>
    </View>
  );
}

function validatedSignUp(validationSchema, email, password, confirmPassword) {
  validationSchema
    .validate({
      email: email,
      password: password,
      confirmPassword: confirmPassword,
    })
    .then(valid => {
      if (valid) {
        signUp(email, password);
      } else {
        isSubmitting = false;
      }
    });
}

function validatedSignIn(validationSchema, email, password) {
  validationSchema
    .validate({
      email: email,
      password: password,
      confirmPassword: password,
    })
    .then(valid => {
      if (valid) {
        signIn(email, password);
      } else {
        isSubmitting = false;
      }
    });
}

function signUp(email, password) {
  auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(error => {
      onEmailLoginError(error);
    })
    .then(
      () => {
        console.log('Signed up with email!');
      },
      () => {
        console.warn('Sign up with email failed!');
      },
    );
}

function signIn(email, password) {
  auth()
    .signInWithEmailAndPassword(email, password)
    .catch(error => {
      onEmailLoginError(error);
    })
    .then(
      () => {
        console.log('Signed in with email!');
      },
      () => {
        console.warn('Sign in with email failed!');
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
  console.warn(errorCode);
  Alert.alert(alertTitle, message);

  isSubmitting = false;
}

const InputFieldWrapper = ({fieldKey, children}) => (
  <View style={styles.textInputWrapper}>
    <Text style={styles.errorText}>{fieldErrorMessages[fieldKey]}</Text>
    {children}
  </View>
);

const InputField = ({fieldKey, ...rest}) => {
  return (
    <InputFieldWrapper fieldKey={fieldKey}>
      <TextInput
        style={styles.textInput}
        clearButtonMode="always"
        autoCorrect={false}
        blurOnSubmit={false}
        returnKeyType="done"
        {...rest}
      />
    </InputFieldWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  loginFields: {
    alignItems: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'red',
    alignSelf: 'stretch',
    flexDirection: 'column',
  },
  textInput: {
    borderColor: 'gray',
    borderBottomWidth: 1,
    width: '100%',
    height: 36,
    marginTop: -10,
    paddingBottom: -5,
  },
  textInputWrapper: {
    width: '80%',
    marginTop: 20,
  },
  loginButtons: {
    height: '20%',
    alignItems: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'orange',
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    height: '15%',
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'blue',
  },
  errorText: {
    color: 'red',
  },
});
