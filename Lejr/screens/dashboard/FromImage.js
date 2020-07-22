import React from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';
import ImagePicker from 'react-native-image-crop-picker';

export default function FromImage({navigation}) {
  console.log('Arrived at FromImage');

  ImagePicker.openCamera({
    width: 300,
    height: 400,
    cropping: true,
  }).then(image => {
    console.log(image);
  });

  return (
    <SafeAreaView style={Styles.container}>
      <Text>FromImage</Text>
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
