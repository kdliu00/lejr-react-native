import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Spinner} from '@ui-kitten/components';
import {Component} from 'react';
import {Screen} from '../../util/Constants';
import vision from '@react-native-firebase/ml-vision';
import {
  JSONCopy,
  MergeState,
  Bounds,
  TextLine,
  Point,
  errorLog,
  getItemFromTextLine,
  TextRef,
  angleH,
  midpoint,
  getAverage,
} from '../../util/UtilityMethods';
import {Item} from '../../util/DataObjects';
import {LocalData, updateComponent} from '../../util/LocalData';
import ImageResizer from 'react-native-image-resizer';
import {Alert} from 'react-native';
import {IconButton} from '../../util/ComponentUtil';
import {CloseIcon, ConfirmIcon} from '../../util/Icons';
import {Image} from 'react-native';
import ImageRotate from 'react-native-image-rotate';
import {CropView} from 'react-native-image-crop-tools';

export default class FromImage extends Component {
  constructor(props) {
    super();
    this.state = {
      isProcessing: false,
    };
    this.image = props.route.params.image;
  }

  componentDidMount() {
    console.log('Arrived at FromImage');
    LocalData.isCamera = false;
  }

  processImage(uri) {
    console.log('Processing image: ' + uri);
    MergeState(this, {isProcessing: true});

    Image.getSize(uri, (width, height) => {
      let scalar = 2048 / width;
      ImageResizer.createResizedImage(
        uri,
        Math.round(scalar * width),
        Math.round(scalar * height),
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
            .then(firstResult => {
              //find text angle
              let angles = [];
              firstResult.blocks.forEach(block => {
                block.lines.forEach(line => {
                  let midLeft = midpoint(
                    new Point(line.cornerPoints[0][0], line.cornerPoints[0][1]),
                    new Point(line.cornerPoints[3][0], line.cornerPoints[3][1]),
                  );
                  let midRight = midpoint(
                    new Point(line.cornerPoints[1][0], line.cornerPoints[1][1]),
                    new Point(line.cornerPoints[2][0], line.cornerPoints[2][1]),
                  );
                  angles.push(angleH(midLeft, midRight));
                });
              });

              //find average angle and correct
              const avgAngle = getAverage(angles);
              console.log('Average angle: ' + avgAngle);
              ImageRotate.rotateImage(
                response.uri,
                -avgAngle,
                newUri => {
                  vision()
                    .textRecognizerProcessImage(newUri)
                    .then(result => {
                      //format result into text lines
                      let textLines = [];
                      let heights = [];
                      result.blocks.forEach(block => {
                        block.lines.forEach(line => {
                          let bounds = new Bounds(
                            new Point(
                              line.cornerPoints[0][0],
                              line.cornerPoints[0][1],
                            ),
                            new Point(
                              line.cornerPoints[1][0],
                              line.cornerPoints[1][1],
                            ),
                            new Point(
                              line.cornerPoints[2][0],
                              line.cornerPoints[2][1],
                            ),
                            new Point(
                              line.cornerPoints[3][0],
                              line.cornerPoints[3][1],
                            ),
                          );
                          let textLine = new TextLine(line.text, bounds);
                          textLines.push(textLine);
                          heights.push(
                            Math.abs(bounds.midUp.y - bounds.midLow.y),
                          );
                        });
                      });

                      //sort by vertical
                      textLines.sort(
                        (a, b) => a.bounds.center.y - b.bounds.center.y,
                      );

                      //determine threshold
                      const threshold = getAverage(heights);
                      console.log('Average height: ' + threshold);

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
                          let candRefDist = Math.abs(
                            refTextLine.bounds.midUp.y -
                              candTextLine.bounds.center.y,
                          );
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
                        defaultSplit[userId] =
                          Math.round(10000 / userIds.length) / 100;
                      });

                      //reset tax
                      LocalData.tax = 0;

                      //find items
                      var ref1 = null;
                      var ref2 = null;
                      for (let i = 0; i < mergedTextLines.length; i++) {
                        let textLine = mergedTextLines[i];
                        let itemProps = getItemFromTextLine(
                          textLine,
                          ref1,
                          ref2,
                        );
                        if (itemProps != null) {
                          ref1 = itemProps.newRef1;
                          ref2 = itemProps.newRef2;
                        }
                        if (itemProps != null) {
                          if (
                            !itemProps.itemName
                              .toLowerCase()
                              .includes('subtotal')
                          ) {
                            if (
                              itemProps.itemName
                                .toLowerCase()
                                .includes('total') ||
                              itemProps.itemName
                                .toLowerCase()
                                .includes('balance')
                            ) {
                              let scannedTotal =
                                parseFloat(
                                  itemList.reduce((a, b) => a + b.itemCost, 0),
                                ) + parseFloat(LocalData.tax);
                              let detectedTotal = parseFloat(
                                itemProps.itemCost,
                              );
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

                      if (LocalData.items.length === 0) {
                        Alert.alert(
                          'No Items Detected',
                          'Make sure the receipt is facing the camera directly. For best results, crop out everything except the items and total.',
                          [
                            {
                              text: 'Okay',
                            },
                          ],
                          {cancelable: false},
                        );
                      } else if (scanError) {
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
                    });
                },
                error => {
                  errorLog(error);
                },
              );
            });
        })
        .catch(err => {
          console.error('Resize error');
          errorLog(err);
        });
    });
  }

  render() {
    return (
      <Layout style={Styles.flex1}>
        <Layout style={Styles.scanner}>
          {this.state.isProcessing ? (
            <Layout style={Styles.center}>
              <Spinner size="large" />
            </Layout>
          ) : (
            <CropView
              style={Styles.scanner}
              sourceUrl={this.image}
              ref={ref => (this.cropViewRef = ref)}
              onImageCrop={cropped => {
                this.processImage(cropped.uri);
              }}
            />
          )}
        </Layout>
        <Layout style={Styles.marginBottom}>
          {!this.state.isProcessing && (
            <Layout style={Styles.rowButtons}>
              <IconButton
                status="danger"
                icon={CloseIcon}
                onPress={() => {
                  this.props.navigation.goBack();
                }}
              />
              <IconButton
                status="success"
                icon={ConfirmIcon}
                onPress={() => this.cropViewRef.saveImage(false, 100)}
              />
            </Layout>
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
