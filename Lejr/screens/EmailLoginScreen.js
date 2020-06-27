import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export default function EmailLoginScreen() {
  const navigation = useNavigation();

  navigation.navigate('LoginScreen');

  return (
    <View style={styles.container}>
      <Text>EmailLoginScreen</Text>
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
