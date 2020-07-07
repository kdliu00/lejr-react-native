import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Text, Button} from '@ui-kitten/components';
import UserData from '../util/LocalData';

export default function JoinGroup({navigation}) {
  console.log('Arrived at JoinGroup!');

  return (
    <Layout style={Styles.container}>
      <Layout style={Styles.textContainer}>
        <Layout style={Styles.textSubContainer}>
          <Text style={Styles.text} category="h6">
            It looks like you're not in a group yet!
          </Text>
          <Text style={Styles.text}>
            Sign in with the same email you were invited with to join a group.
          </Text>
        </Layout>
      </Layout>
      <Layout style={Styles.buttonContainer}>
        <Button style={Styles.button}>Create group</Button>
        <Button
          style={Styles.button}
          appearance="outline"
          onPress={() => {
            auth()
              .signOut()
              .then(() => {
                console.log('User signed out!');
                UserData.userObject = null;
              });
          }}>
          Sign out
        </Button>
      </Layout>
    </Layout>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    marginTop: 56,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
  },
  textSubContainer: {
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
