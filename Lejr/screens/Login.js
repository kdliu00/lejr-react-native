import React from 'react';
import {StyleSheet, Platform} from 'react-native';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-community/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {Alert} from 'react-native';
import {Layout, Button, Spinner, Icon} from '@ui-kitten/components';
import {iOSWebClientId, androidWebClientId} from '../util/Constants';

GoogleSignin.configure({
  webClientId: Platform.OS === 'ios' ? iOSWebClientId : androidWebClientId,
});

const FacebookIcon = props => <Icon name="facebook" {...props} />;
const GoogleIcon = props => <Icon name="google" {...props} />;
const EmailIcon = props => <Icon name="email" {...props} />;

export default function Login({navigation}) {
  console.log('Arrived at Login!');

  const [IsLoggingIn, SetIsLoggingIn] = React.useState(false);

  return (
    <Layout style={Styles.container}>
      <Layout style={Styles.marginOnly} />
      <Layout style={Styles.loginItems}>
        <Layout style={Styles.button}>
          <Button
            accessoryLeft={EmailIcon}
            onPress={() => {
              console.log('Going to email login!');
              navigation.navigate('EmailLogin', {showConfirm: false});
            }}
            disabled={IsLoggingIn}>
            Sign in with email
          </Button>
        </Layout>
        <Layout style={Styles.button}>
          <Button
            accessoryLeft={GoogleIcon}
            onPress={() => {
              console.log('Going to Google login!');
              SetIsLoggingIn(true);
              onGoogleButtonPress()
                .catch(error => {
                  onLoginError(error);
                  SetIsLoggingIn(false);
                })
                .then(
                  () => console.log('Signed in with Google!'),
                  () => console.warn('Sign in with Google failed!'),
                )
                .finally(() => SetIsLoggingIn(false));
            }}
            disabled={IsLoggingIn}>
            Sign in with Google
          </Button>
        </Layout>
        <Layout style={Styles.button}>
          <Button
            accessoryLeft={FacebookIcon}
            onPress={() => {
              console.log('Going to Facebook login!');
              SetIsLoggingIn(true);
              onFacebookButtonPress()
                .catch(error => {
                  onLoginError(error);
                  SetIsLoggingIn(false);
                })
                .then(
                  () => console.log('Signed in with Facebook!'),
                  () => console.warn('Sign in with Facebook failed!'),
                )
                .finally(() => SetIsLoggingIn(false));
            }}
            disabled={IsLoggingIn}>
            Sign in with Facebook
          </Button>
        </Layout>
        {Platform.OS === 'ios' && (
          <Layout style={Styles.button}>
            <Button
              onPress={() => {
                console.log('Going to Apple login!');
              }}
              disabled={IsLoggingIn}>
              Sign in with Apple
            </Button>
          </Layout>
        )}
        <Layout style={Styles.button} />
        <Layout style={Styles.button}>
          <Button
            onPress={() => {
              console.log('Going to create an account!');
              navigation.navigate('CreateAccount');
            }}
            disabled={IsLoggingIn}
            appearance="outline">
            Create an account
          </Button>
        </Layout>
      </Layout>
      <Layout style={Styles.marginOnly}>
        {IsLoggingIn && <Spinner size="large" />}
      </Layout>
    </Layout>
  );
}

function onLoginError(error) {
  var errorCode = error.userInfo.code;
  var message = error.userInfo.message;
  var alertTitle = '<INSERT ALERT TITLE>';

  console.warn(errorCode);

  switch (errorCode) {
    case 'account-exists-with-different-credential':
      alertTitle = 'Account Already Exists';
      break;

    default:
      alertTitle = 'Login Error';
      break;
  }

  Alert.alert(alertTitle, message);
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

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  marginOnly: {
    margin: 40,
  },
  loginItems: {
    alignItems: 'center',
    height: '40%',
  },
  button: {
    flex: 1,
    alignItems: 'center',
  },
});
