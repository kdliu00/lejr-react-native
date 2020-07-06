import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Button} from '@ui-kitten/components';

export default function Settings({navigation}) {
  console.log('Arrived at Settings!');

  return (
    <Layout style={Styles.container}>
      <Button
        appearance="outline"
        onPress={() => {
          auth()
            .signOut()
            .then(() => console.log('User signed out!'));
        }}>
        Sign Out
      </Button>
    </Layout>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
