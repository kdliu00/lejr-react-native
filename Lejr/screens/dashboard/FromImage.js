import React from 'react';
import {StyleSheet} from 'react-native';
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
  pointDistance,
  pointToLineDistance,
  errorLog,
  getItemFromTextLine,
} from '../../util/UtilityMethods';
import {Item} from '../../util/DataObjects';
import {
  isPossibleObjectEmpty,
  LocalData,
  updateComponent,
} from '../../util/LocalData';
import ImageResizer from 'react-native-image-resizer';
import DocumentScanner from '@woonivers/react-native-document-scanner';
import {Fragment} from 'react';
import {Alert} from 'react-native';

const MAX_DIM = 2400;

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

  processImage(data) {
    console.log('Processing image: ' + data.croppedImage);

    ImageResizer.createResizedImage(
      data.croppedImage,
      MAX_DIM,
      MAX_DIM,
      'PNG',
      100,
      0,
      null,
      false,
      {mode: 'cover'},
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
              for (let j = k; j < textLines.length; j++) {
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
            var scanError = false;
            var itemList = [];
            let defaultSplit = {};
            let userIds = Object.keys(LocalData.currentGroup.members);
            userIds.forEach(userId => {
              defaultSplit[userId] = Math.round(10000 / userIds.length) / 100;
            });

            //find items
            mergedTextLines.forEach(textLine => {
              let itemProps = getItemFromTextLine(textLine);
              if (itemProps != null) {
                if (
                  itemProps.itemName.toLowerCase().includes('total') ||
                  itemProps.itemName.toLowerCase().includes('balance')
                ) {
                  let scannedTotal =
                    itemList.reduce((a, b) => a + b.itemCost, 0) +
                    LocalData.tax;
                  scanError = scannedTotal != parseFloat(itemProps.itemCost);
                } else if (itemProps.itemName.toLowerCase().includes('tax')) {
                  LocalData.tax = itemProps.itemCost;
                } else {
                  let item = new Item(
                    itemProps.itemName,
                    parseFloat(itemProps.itemCost),
                    JSONCopy(defaultSplit),
                    textLine.text,
                  );
                  itemList.push(item);
                }
              }
            });

            LocalData.items = itemList;
            updateComponent(LocalData.container);

            if (scanError) {
              Alert.alert(
                'Possible Scan Error',
                'There may be a missing or extra item, or one of the scanned items was incorrect.',
                [
                  {
                    text: 'Okay',
                  },
                ],
              );
            }

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
      <Layout style={{flex: 1}}>
        <Layout style={Styles.scanner}>
          {this.state.isProcessing ? (
            <Layout style={Styles.center}>
              <Spinner size="large" />
            </Layout>
          ) : (
            <DocumentScanner
              style={Styles.scanner}
              onPictureTaken={data => {
                MergeState(this, {isProcessing: true});
                this.processImage(data);
              }}
              overlayColor="rgba(125,112,240,0.5)"
              enableTorch={false}
              detectionCountBeforeCapture={5}
              detectionRefreshRateInMS={50}
            />
          )}
        </Layout>
        <Layout style={Styles.marginBottom}>
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
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column-reverse',
  },
  marginBottom: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 50,
  },
  center: {
    alignItems: 'center',
  },
  boldText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginHorizontal: 30,
    marginBottom: 30,
  },
  scanner: {
    flex: 4,
    justifyContent: 'center',
  },
});
