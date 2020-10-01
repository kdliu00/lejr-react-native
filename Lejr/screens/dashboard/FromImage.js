import React from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Layout, Spinner, Text} from '@ui-kitten/components';
import ImagePicker from 'react-native-image-crop-picker';
import {Component} from 'react';
import FormStyles from '../../util/FormStyles';
import {ErrorCode} from '../../util/Constants';
import vision from '@react-native-firebase/ml-vision';
import {MergeState} from '../../util/UtilityMethods';

export default class FromImage extends Component {
  constructor() {
    super();
    this.state = {
      isProcessing: false,
    };
  }

  componentDidMount() {
    console.log('Arrived at FromImage');
  }

  processImage(image) {
    console.log('Processing image: ' + image.path);
    vision()
      .textRecognizerProcessImage(image.path)
      .then(result => {
        console.log('Found text in document: ', result.text);

        console.log(
          'Found blocks in document: ',
          result.blocks.map(block => block.text),
        );

        MergeState(this, {isProcessing: false});
      });
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Layout style={Styles.spinnerContainer}>
            {this.state.isProcessing && <Spinner size="large" />}
          </Layout>
          <Layout style={Styles.container}>
            <Text appearance="hint" style={Styles.placeholderText}>
              Use your Camera to take a receipt photo or select one from your
              Gallery. Make sure to allow camera permissions for Lejr in your
              device settings
            </Text>
            <Layout style={[FormStyles.buttonStyle]}>
              <Button
                style={FormStyles.button}
                disabled={this.state.isProcessing}
                onPress={() => {
                  MergeState(this, {isProcessing: true});
                  ImagePicker.openPicker({
                    mediaType: 'photo',
                  }).then(
                    image => this.processImage(image),
                    error => {
                      console.warn(error.message);
                      if (!error.message.includes('cancelled')) {
                        throw new Error(ErrorCode.ImagePickerError);
                      }
                    },
                  );
                }}>
                Gallery
              </Button>
              <Button
                style={FormStyles.button}
                disabled={this.state.isProcessing}
                onPress={() => {
                  MergeState(this, {isProcessing: true});
                  ImagePicker.openCamera({
                    mediaType: 'photo',
                  }).then(
                    image => this.processImage(image),
                    error => {
                      console.warn(error.message);
                      if (!error.message.includes('cancelled')) {
                        throw new Error(ErrorCode.ImagePickerError);
                      }
                    },
                  );
                }}>
                Camera
              </Button>
            </Layout>
          </Layout>
        </SafeAreaView>
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  spinnerContainer: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
});
