import React from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Layout, Spinner, Text} from '@ui-kitten/components';
import {Component} from 'react';
import FormStyles from '../../util/FormStyles';
import {Screen} from '../../util/Constants';
import vision from '@react-native-firebase/ml-vision';
import {
  JSONCopy,
  MergeState,
  Bounds,
  TextLine,
  Point,
  warnLog,
  pointDistance,
  pointToLineDistance,
  errorLog,
} from '../../util/UtilityMethods';
import {Item} from '../../util/DataObjects';
import {
  isPossibleObjectEmpty,
  LocalData,
  updateComponent,
} from '../../util/LocalData';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Image} from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import DocumentScanner from '@woonivers/react-native-document-scanner';

const MAX_DIM = 2000;

export default class FromImage extends Component {
  constructor(props) {
    super();
    this.addMore = props.route.params.addMore;
    this.state = {
      isProcessing: false,
    };
  }

  componentDidMount() {
    console.log('Arrived at FromImage');
  }

  processImage(data) {
    console.log('Processing image: ' + image.path);
    var image = data.croppedImage;

    ImageResizer.createResizedImage(
      image.path,
      5 * image.width,
      5 * image.width,
      'PNG',
      100,
    )
      .then(response => {
        vision()
          .textRecognizerProcessImage(response.path)
          .then(result => {
            //format result into text lines
            let textLines = [];
            result.blocks.forEach(block => {
              block.lines.forEach(line => {
                let bounds = new Bounds(
                  new Point(line.cornerPoints[0][0], line.cornerPoints[0][1]),
                  new Point(line.cornerPoints[1][0], line.cornerPoints[1][1]),
                  new Point(line.cornerPoints[2][0], line.cornerPoints[2][1]),
                  new Point(line.cornerPoints[3][0], line.cornerPoints[3][1]),
                );
                let textLine = new TextLine(line.text, bounds);
                textLines.push(textLine);
              });
            });

            //sort by vertical
            textLines.sort((a, b) => a.bounds.center.y - b.bounds.center.y);

            //reformat by merging lines
            let mergedTextLines = [];
            var k = 0;
            while (k < textLines.length) {
              var refTextLine = JSONCopy(textLines[k]);
              k += 1;
              for (j = k; j < textLines.length; j++) {
                k = j;
                let candTextLine = JSONCopy(textLines[j]);
                let threshold =
                  0.5 *
                  pointDistance(
                    refTextLine.bounds.midUp,
                    refTextLine.bounds.midLow,
                  );
                var candRefDist = 0;
                if (
                  refTextLine.bounds.midLeft.x < candTextLine.bounds.midLeft.x
                ) {
                  candRefDist = pointToLineDistance(
                    candTextLine.bounds.midLeft,
                    refTextLine.bounds.midLeft,
                    refTextLine.bounds.midRight,
                  );
                } else {
                  candRefDist = pointToLineDistance(
                    candTextLine.bounds.midRight,
                    refTextLine.bounds.midLeft,
                    refTextLine.bounds.midRight,
                  );
                }
                if (candRefDist <= threshold) {
                  var newBounds = null;
                  var newText = null;
                  if (
                    refTextLine.bounds.midLeft.x < candTextLine.bounds.midLeft.x
                  ) {
                    newBounds = new Bounds(
                      refTextLine.bounds.upLeft,
                      candTextLine.bounds.upRight,
                      candTextLine.bounds.lowRight,
                      refTextLine.bounds.lowLeft,
                    );
                    newText = [refTextLine.text, candTextLine.text].join(' ');
                  } else {
                    newBounds = new Bounds(
                      candTextLine.bounds.upLeft,
                      refTextLine.bounds.upRight,
                      refTextLine.bounds.lowRight,
                      candTextLine.bounds.lowLeft,
                    );
                    newText = [candTextLine.text, refTextLine.text].join(' ');
                  }
                  refTextLine = new TextLine(newText, newBounds);
                } else {
                  break;
                }
              }
              mergedTextLines.push(refTextLine);
            }

            //log the lines
            let logText = [];
            mergedTextLines.forEach(textLine => {
              logText.push(textLine.text);
            });
            console.log('Parsed text:\n' + logText.join('\n'));

            //calculate default split
            var itemList = [];
            let defaultSplit = {};
            let userIds = Object.keys(LocalData.currentGroup.members);
            userIds.forEach(userId => {
              defaultSplit[userId] = Math.round(10000 / userIds.length) / 100;
            });

            if (isPossibleObjectEmpty(LocalData.items)) {
              LocalData.items = itemList;
            } else {
              LocalData.items.push(...itemList);
            }

            updateComponent(LocalData.container);

            MergeState(this, {isProcessing: false});
            LocalData.isCamera = false;
            this.props.navigation.replace(Screen.Contribution);
          })
          .catch(err => {
            errorLog(err);
          });
      })
      .catch(err => {
        errorLog(err);
      });
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={[Styles.container, Styles.reverseCenter]}>
          <Layout style={FormStyles.buttonStyle}>
            <Button
              style={FormStyles.button}
              appearance="outline"
              disabled={this.state.isProcessing}
              onPress={() => {
                this.props.navigation.goBack();
              }}>
              Cancel
            </Button>
          </Layout>
          <Layout style={Styles.reverseCenter}>
            <Text appearance="hint" style={Styles.boldText}>
              {this.addMore
                ? 'This will scan your receipt and add the scanned items to your current purchase.'
                : 'This will scan your receipt and create a new purchase using the scanned items.'}
            </Text>
          </Layout>
          <Layout style={Styles.spinnerContainer}>
            {this.state.isProcessing ? (
              <Spinner size="large" />
            ) : (
              <Layout style={Styles.container}>
                <DocumentScanner
                  style={Styles.scanner}
                  onPictureTaken={this.processImage}
                  overlayColor="rgba(125,112,240,0.7)"
                  enableTorch={false}
                  saturation={0}
                  detectionCountBeforeCapture={5}
                  detectionRefreshRateInMS={50}
                />
              </Layout>
            )}
          </Layout>
        </SafeAreaView>
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reverseCenter: {
    flexDirection: 'column-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginHorizontal: 30,
  },
  spinnerContainer: {
    flex: 1,
    flexDirection: 'column-reverse',
    marginBottom: 50,
  },
  scanner: {},
});
