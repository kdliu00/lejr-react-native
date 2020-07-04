import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
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
    <SafeAreaView style={Styles.container}>
      <Layout style={Styles.container}>
        <Spinner size="large" />
      </Layout>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
