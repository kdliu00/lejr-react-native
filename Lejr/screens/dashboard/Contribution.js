import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';

export default function Contribution({navigation}) {
  console.log('Arrived at Contribution');

  return (
    <Layout style={Styles.container}>
      <Text>Contribution</Text>
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
