import React from 'react';
import {View, StyleSheet, Button, Platform} from 'react-native';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-community/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {Alert} from 'react-native';

GoogleSignin.configure({
  webClientId:
    '746843927000-1kd2tbmtr59ba41i9k4bk2gr8252jhau.apps.googleusercontent.com',
});

export default function Login({navigation}) {
  console.log('Arrived at Login!');

  return (
    <View style={styles.container}>
      <View style={styles.bottomPad} />
      <View style={styles.loginItems}>
        <View style={styles.button}>
          <Button
            title="Sign in with email"
            onPress={() => {
              console.log('Going to email login!');
              navigation.navigate('EmailLogin', {showConfirm: false});
            }}
            color="orange"
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Sign in with Google"
            onPress={() => {
              console.log('Going to Google login!');
              onGoogleButtonPress()
                .catch(error => onLoginError(error))
                .then(
                  () => console.log('Signed in with Google!'),
                  () => console.log('Sign in with Google failed!'),
                );
            }}
            color="dodgerblue"
          />
        </View>
        <View style={styles.button}>
          <Button
            title="Sign in with Facebook"
            onPress={() => {
              console.log('Going to Facebook login!');
              onFacebookButtonPress()
                .catch(error => onLoginError(error))
                .then(
                  () => console.log('Signed in with Facebook!'),
                  () => console.log('Sign in with Facebook failed!'),
                );
            }}
            color="blue"
          />
        </View>
        {Platform.OS === 'ios' && (
          <View style={styles.button}>
            <Button
              title="Sign in with Apple"
              onPress={() => {
                console.log('Going to Apple login!');
              }}
              color="silver"
            />
          </View>
        )}
        <View style={styles.button} />
        <View style={styles.button}>
          <Button
            title="Create an account"
            onPress={() => {
              console.log('Going to email login!');
              navigation.navigate('EmailLogin', {showConfirm: true});
            }}
            color="green"
          />
        </View>
      </View>
    </View>
  );
}

function onLoginError(error) {
  var errorCode = error.userInfo.code;
  var message = error.userInfo.message;

  console.warn(errorCode);

  if (errorCode === 'account-exists-with-different-credential') {
    Alert.alert('Login Error', message);
  }
}

async function onGoogleButtonPress() {
  // Get the users ID token
  const {idToken} = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(googleCredential);
}

async function onFacebookButtonPress() {
  // Attempt login with permissions
  const result = await LoginManager.logInWithPermissions([
    'public_profile',
    'email',
  ]);

  if (result.isCancelled) {
    throw 'User cancelled the login process';
  }

  // Once signed in, get the users AccesToken
  const data = await AccessToken.getCurrentAccessToken();

  if (!data) {
    throw 'Something went wrong obtaining access token';
  }

  // Create a Firebase credential with the AccessToken
  const facebookCredential = auth.FacebookAuthProvider.credential(
    data.accessToken,
  );

  // Sign-in the user with the credential
  return auth().signInWithCredential(facebookCredential);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  bottomPad: {
    height: '10%',
  },
  loginItems: {
    alignItems: 'center',
    height: '40%',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
