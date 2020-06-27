import React from 'react';
import {SafeAreaView, View, StyleSheet, Button} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-community/google-signin';

GoogleSignin.configure({
  webClientId:
    '746843927000-1kd2tbmtr59ba41i9k4bk2gr8252jhau.apps.googleusercontent.com',
});

export default function LoginScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.button}>
        <Button
          title="Sign in with email"
          onPress={() => {
            console.log('Going to email login screen!');
            navigation.navigate('EmailLoginScreen');
          }}
          color="grey"
        />
      </View>
      <View style={styles.button}>
        <Button
          title="Sign in with Google"
          onPress={() => {
            console.log('Going to Google login!');
            onGoogleButtonPress().then(() =>
              console.log('Signed in with Google!'),
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

async function onGoogleButtonPress() {
  // Get the users ID token
  const {idToken} = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(googleCredential);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
