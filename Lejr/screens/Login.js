import React, {Component} from 'react';
import {StyleSheet, Platform} from 'react-native';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-community/google-signin';
import {Alert} from 'react-native';
import {Layout, Button, Spinner} from '@ui-kitten/components';
import {iOSWebClientId, androidWebClientId, Screen} from '../util/Constants';
import {MergeState, warnLog} from '../util/UtilityMethods';
import {EmailIcon, GoogleIcon} from '../util/Icons';
import AppleLogo from '../resources/apple_sign_in.svg';
import {appleAuth} from '@invertase/react-native-apple-authentication';

GoogleSignin.configure({
  webClientId: Platform.OS === 'ios' ? iOSWebClientId : androidWebClientId,
});

const LOGO_WIDTH = 18;

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      isLoggingIn: false,
    };
  }

  componentDidMount() {
    console.log('Arrived at Login');
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <Layout style={Styles.loginItems}>
          <Layout style={Styles.buffer} />
          <Button
            style={Styles.button}
            onPress={() => {
              console.log('Going to create an account');
              this.props.navigation.navigate(Screen.CreateAccount, {
                showConfirm: true,
              });
            }}
            disabled={this.state.isLoggingIn}
            appearance="outline">
            Create an account
          </Button>
          <Layout style={Styles.buffer} />
          {Platform.OS === 'ios' && (
            <Button
              style={[
                Styles.button,
                Styles.login,
                {backgroundColor: 'black', borderColor: 'black'},
              ]}
              accessoryLeft={() => (
                <AppleLogo style={{marginHorizontal: 7, marginVertical: -12}} />
              )}
              onPress={() => {
                console.log('Going to Apple login');
                MergeState(this, {isLoggingIn: true});
                onAppleButtonPress()
                  .then(
                    () => console.log('Signed in with Apple'),
                    error => {
                      onLoginError(error);
                    },
                  )
                  .finally(() => MergeState(this, {isLoggingIn: false}));
              }}
              disabled={this.state.isLoggingIn}>
              Sign in with Apple
            </Button>
          )}
          <Button
            style={[
              Styles.button,
              Styles.login,
              {backgroundColor: 'blue', borderColor: 'blue'},
            ]}
            accessoryLeft={props => (
              <GoogleIcon {...props} width={LOGO_WIDTH} />
            )}
            onPress={() => {
              console.log('Going to Google login');
              MergeState(this, {isLoggingIn: true});
              onGoogleButtonPress()
                .then(
                  () => console.log('Signed in with Google'),
                  error => {
                    onLoginError(error);
                  },
                )
                .finally(() => MergeState(this, {isLoggingIn: false}));
            }}
            disabled={this.state.isLoggingIn}>
            Sign in with Google
          </Button>
          <Button
            style={[Styles.button, Styles.login]}
            accessoryLeft={props => <EmailIcon {...props} width={LOGO_WIDTH} />}
            onPress={() => {
              console.log('Going to email login');
              this.props.navigation.navigate(Screen.EmailLogin, {
                showConfirm: false,
              });
            }}
            disabled={this.state.isLoggingIn}>
            Sign in with email
          </Button>
          <Layout style={Styles.loadingIndicator}>
            {this.state.isLoggingIn && <Spinner size="large" />}
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

function onLoginError(error) {
  warnLog(error);

  const errorString = JSON.stringify(error).toLowerCase();
  if (
    errorString.includes('user canceled') ||
    errorString.includes('sign in action cancelled')
  ) {
    return;
  }

  var code = error.userInfo.code;
  var message = error.userInfo.message;
  var alertTitle;

  switch (code) {
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

async function onAppleButtonPress() {
  // Start the sign-in request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  // Ensure Apple returned a user identityToken
  if (!appleAuthRequestResponse.identityToken) {
    throw 'Apple Sign-In failed - no identify token returned';
  }

  // Create a Firebase credential from the response
  const {identityToken, nonce} = appleAuthRequestResponse;
  const appleCredential = auth.AppleAuthProvider.credential(
    identityToken,
    nonce,
  );

  // Sign the user in with the credential
  return auth().signInWithCredential(appleCredential);
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingIndicator: {
    marginBottom: 40,
  },
  buffer: {
    margin: 25,
  },
  loginItems: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
    marginBottom: 40,
  },
  button: {
    margin: 10,
  },
  login: {
    width: 200,
    justifyContent: 'flex-start',
  },
});
