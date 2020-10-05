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
        //get text lines from blocks
        const blocks = result.blocks;
        const lines = [];
        for (let i = 0; i < blocks.length; i++) {
          const curBlock = blocks[i];
          const curLines = curBlock.lines;
          for (let j = 0; j < curLines.length; j++) {
            lines.push(curLines[j]);
          }
        }

        //sort the lines based on top left y coordinate
        const sortedLines = lines.sort((a, b) => {
          return a.cornerPoints[0][1] - b.cornerPoints[0][1];
        });

        //group lines together, text only
        const groupedLines = [];
        var k = 0;
        while (k < sortedLines.length) {
          const refLine = sortedLines[k];
          const refCoordTL = refLine.cornerPoints[0]; //top left
          const x1 = refCoordTL[0];
          const y1 = refCoordTL[1];
          const refCoordTR = refLine.cornerPoints[1]; //top right
          const x2 = refCoordTR[0];
          const y2 = refCoordTR[1];
          const refCoordBL = refLine.cornerPoints[3]; //bottom left
          const x3 = refCoordBL[0];
          const y3 = refCoordBL[1];

          const threshold =
            0.9 * Math.sqrt(Math.pow(x3 - x1, 2) + Math.pow(y3 - y1, 2));

          var lineGroup = '';
          lineGroup += refLine.text;

          k += 1;
          for (let l = k; l < sortedLines.length; l++) {
            k = l;
            const candLine = sortedLines[l];
            const candCoord = candLine.cornerPoints[0]; //top left
            const x0 = candCoord[0];
            const y0 = candCoord[1];
            const lineDist =
              Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) /
              Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

            if (lineDist <= threshold) {
              lineGroup += ' ' + candLine.text;
            } else {
              groupedLines.push(lineGroup);
              break;
            }
          }
        }

        console.log('Line-by-line reconstruction:\n' + groupedLines.join('\n'));

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
