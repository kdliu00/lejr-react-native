import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Layout, Spinner} from '@ui-kitten/components';
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
  TextRef,
} from '../../util/UtilityMethods';
import {Item} from '../../util/DataObjects';
import {LocalData, updateComponent} from '../../util/LocalData';
import ImageResizer from 'react-native-image-resizer';
import DocumentScanner from '@woonivers/react-native-document-scanner';
import {Alert} from 'react-native';
import {IconButton} from '../../util/ComponentUtil';
import {CloseIcon, ConfirmIcon} from '../../util/Icons';
import {Image} from 'react-native';

export default class FromImage extends Component {
  constructor() {
    super();
    this.state = {
      isProcessing: false,
      isConfirm: false,
    };
    this.croppedImage = null;
  }

  componentDidMount() {
    console.log('Arrived at FromImage');
  }

  processImage(croppedImage) {
    console.log('Processing image: ' + croppedImage);

    Image.getSize(croppedImage, (width, height) =>
      ImageResizer.createResizedImage(
        croppedImage,
        Math.round(width < 2048 ? 2.5 * width : width),
        Math.round(width < 2048 ? 2.5 * height : height),
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
              console.log('Processing text');

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
                var textRefs = [];
                var refTextLine = JSONCopy(textLines[k]);
                textRefs.push(
                  new TextRef(
                    refTextLine.bounds.center.x,
                    refTextLine.text.trim(),
                  ),
                );
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
                    if (
                      refTextLine.bounds.midLeft.x <
                      candTextLine.bounds.midLeft.x
                    ) {
                      if (
                        refTextLine.bounds.midRight.x >
                        candTextLine.bounds.midRight.x
                      ) {
                        newBounds = refTextLine.bounds;
                      } else {
                        newBounds = new Bounds(
                          refTextLine.bounds.upLeft,
                          candTextLine.bounds.upRight,
                          candTextLine.bounds.lowRight,
                          refTextLine.bounds.lowLeft,
                        );
                      }
                    } else {
                      newBounds = new Bounds(
                        candTextLine.bounds.upLeft,
                        refTextLine.bounds.upRight,
                        refTextLine.bounds.lowRight,
                        candTextLine.bounds.lowLeft,
                      );
                    }
                    textRefs.push(
                      new TextRef(
                        candTextLine.bounds.center.x,
                        candTextLine.text.trim(),
                      ),
                    );
                    refTextLine = new TextLine('', newBounds);
                  } else {
                    break;
                  }
                }
                textRefs = textRefs
                  .sort((a, b) => a.x - b.x)
                  .map(textRef => textRef.text);
                mergedTextLines.push(
                  new TextLine(textRefs.join(' '), refTextLine.bounds),
                );
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
              var ref1 = null;
              var ref2 = null;
              for (let i = 0; i < mergedTextLines.length; i++) {
                let textLine = mergedTextLines[i];
                let itemProps = getItemFromTextLine(textLine, ref1, ref2);
                if (itemProps != null) {
                  ref1 = itemProps.newRef1;
                  ref2 = itemProps.newRef2;
                }
                if (itemProps != null) {
                  if (!itemProps.itemName.toLowerCase().includes('subtotal')) {
                    if (
                      itemProps.itemName.toLowerCase().includes('total') ||
                      itemProps.itemName.toLowerCase().includes('balance')
                    ) {
                      let scannedTotal =
                        parseFloat(
                          itemList.reduce((a, b) => a + b.itemCost, 0),
                        ) + parseFloat(LocalData.tax);
                      let detectedTotal = parseFloat(itemProps.itemCost);
                      console.log('Scanned total: ' + scannedTotal);
                      console.log('Detected total: ' + detectedTotal);
                      scanError = scannedTotal !== detectedTotal;
                      break;
                    } else if (
                      itemProps.itemName.toLowerCase().includes('tax')
                    ) {
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
                }
              }

              LocalData.items = itemList;
              updateComponent(LocalData.container);

              if (scanError) {
                Alert.alert(
                  'Possible Scan Error',
                  'You may need to edit incorrect items or rescan your receipt.',
                  [
                    {
                      text: 'Okay',
                    },
                  ],
                  {cancelable: false},
                );
              }

              MergeState(this, {isProcessing: false});
              LocalData.isCamera = false;
              console.log('Finished processing');
              this.props.navigation.replace(Screen.Contribution);
            })
            .catch(err => {
              errorLog(err);
            });
        })
        .catch(err => {
          errorLog(err);
        }),
    );
  }

  render() {
    return (
      <Layout style={Styles.flex1}>
        <Layout style={Styles.scanner}>
          {this.state.isConfirm ? (
            <Image
              style={Styles.flex1}
              resizeMode={'contain'}
              source={{uri: this.croppedImage}}
            />
          ) : this.state.isProcessing ? (
            <Layout style={Styles.center}>
              <Spinner size="large" />
            </Layout>
          ) : (
            <DocumentScanner
              style={Styles.scanner}
              onPictureTaken={data => {
                console.log('Picture taken');
                this.croppedImage = data.croppedImage;
                MergeState(this, {isConfirm: true});
              }}
              overlayColor="rgba(125,112,240,0.5)"
              enableTorch={false}
              quality={1}
              detectionCountBeforeCapture={3}
              detectionRefreshRateInMS={150}
            />
          )}
        </Layout>
        <Layout style={Styles.marginBottom}>
          {this.state.isConfirm ? (
            <Layout style={Styles.rowButtons}>
              <IconButton
                status="danger"
                icon={CloseIcon}
                onPress={() => {
                  this.croppedImage = null;
                  MergeState(this, {isConfirm: false});
                }}
              />
              <IconButton
                status="success"
                icon={ConfirmIcon}
                onPress={() => {
                  this.processImage(this.croppedImage);
                  MergeState(this, {isConfirm: false, isProcessing: true});
                }}
              />
            </Layout>
          ) : (
            !this.state.isProcessing && (
              <Button
                style={FormStyles.button}
                appearance="outline"
                disabled={this.state.isProcessing}
                onPress={() => {
                  this.props.navigation.goBack();
                }}>
                Cancel
              </Button>
            )
          )}
        </Layout>
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
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
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  scanner: {
    flex: 4,
    justifyContent: 'center',
  },
});
