import React from 'react';
import {SafeAreaView, StyleSheet, ActivityIndicator} from 'react-native';
import auth from '@react-native-firebase/auth';

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
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
