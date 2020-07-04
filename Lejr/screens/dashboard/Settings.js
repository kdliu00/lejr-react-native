import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';

export default function Settings({navigation}) {
  console.log('Arrived at Settings!');

  return (
    <Layout style={Styles.container}>
      <Text>Settings</Text>
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
