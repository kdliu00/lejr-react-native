import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function LoadingScreen() {
  const navigation = useNavigation();

  auth().onAuthStateChanged(user => {
    if (user) {
      navigation.navigate('DashboardScreen');
    } else {
      navigation.navigate('LoginScreen');
    }
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
