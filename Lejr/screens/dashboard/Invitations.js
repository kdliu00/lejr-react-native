import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';

export default function Invitations({navigation}) {
  console.log('Arrived at Invitations!');

  return (
    <Layout style={Styles.container}>
      <Text>Invitations</Text>
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
