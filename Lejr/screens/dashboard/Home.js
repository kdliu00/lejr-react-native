import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Button} from '@ui-kitten/components';

export default function Home({navigation}) {
  console.log('Arrived at Home!');

  return (
    <Layout style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
