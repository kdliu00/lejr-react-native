import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function Home({navigation}) {
  console.log('Arrived at Home!');

  return (
    <View style={styles.container}>
      <Text>Home</Text>
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
