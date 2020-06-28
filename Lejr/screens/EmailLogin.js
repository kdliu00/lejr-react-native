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

var isSubmitting = false;

export default function EmailLogin({route, navigation}) {
  console.log('Arrived at EmailLogin!');

  const {showConfirm} = route.params;

  const [email, onEditEmail] = React.useState();
  const [password, onEditPassword] = React.useState();
  const [confirmPassword, onEditConfirmPassword] = React.useState();

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
                onSignUp(email, password);
              }}
            />
          </View>
        ) : (
          <View style={styles.button}>
            <Button
              title="Sign In"
              onPress={() => {
                console.log('Signing in with email!');
                onSignIn(email, password);
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.loginFields}>
        <InputField
          placeholder="username@email.com"
          onChangeText={text => onEditEmail(text)}
          value={email}
          autoFocus
        />
        <InputField
          placeholder="password"
          onChangeText={text => onEditPassword(text)}
          value={password}
          secureTextEntry
        />
        {showConfirm && (
          <InputField
            placeholder="confirm password"
            onChangeText={text => onEditConfirmPassword(text)}
            value={confirmPassword}
            secureTextEntry
          />
        )}
      </View>
    </View>
  );
}

async function onSignUp(email, password) {
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
        console.log('Sign up with email failed!');
      },
    );
}

async function onSignIn(email, password) {
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
        console.log('Sign in with email failed!');
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
      alertTitle = 'Error';
      break;
  }
  console.warn(errorCode);
  Alert.alert(alertTitle, message);

  isSubmitting = false;
}

const InputFieldWrapper = ({children}) => (
  <View style={styles.textInputWrapper}>
    <Text style={styles.errorText}>This field is required</Text>
    {children}
  </View>
);

const InputField = ({...rest}) => {
  return (
    <InputFieldWrapper>
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
