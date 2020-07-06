import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Spinner} from '@ui-kitten/components';

export default function Loading({navigation}) {
  console.log('Arrived at Loading!');

  auth().onAuthStateChanged(user => {
    if (user) {
      navigation.navigate('Dashboard');
    } else {
      navigation.navigate('Login');
    }
  });

  return (
    <Layout style={Styles.container}>
      <Spinner size="large" />
    </Layout>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
