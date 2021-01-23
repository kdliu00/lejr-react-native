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
  midpoint,
  pointDistance,
  pointToLineDistance,
  warnLog,
} from '../../util/UtilityMethods';
import {Item} from '../../util/DataObjects';
import {LocalData} from '../../util/LocalData';
import ImageCropPicker from 'react-native-image-crop-picker';
import {Image} from 'react-native';

const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 400;

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

  processImage(image) {
    console.log('Processing image: ' + image.path);
    vision()
      .textRecognizerProcessImage(image.path)
      .then(result => {
        //get text lines from blocks
        let blocks = result.blocks;
        let lines = [];
        for (let i = 0; i < blocks.length; i++) {
          let curBlock = blocks[i];
          let curLines = curBlock.lines;
          for (let j = 0; j < curLines.length; j++) {
            lines.push(curLines[j]);
          }
        }

        //sort the lines based on top left y coordinate
        let sortedLines = lines.sort((a, b) => {
          return a.cornerPoints[0][1] - b.cornerPoints[0][1];
        });

        //group lines together
        var groupedLines = [];
        let k = 0;
        while (k < sortedLines.length) {
          let refLine = sortedLines[k];

          let refCoordML = midpoint(
            refLine.cornerPoints[0],
            refLine.cornerPoints[3],
          ); //top left, bottom left

          let refCoordMR = midpoint(
            refLine.cornerPoints[1],
            refLine.cornerPoints[2],
          ); //top right, bottom right

          let threshold = pointDistance(
            refLine.cornerPoints[0],
            refLine.cornerPoints[3],
          ); //top left, bottom left

          let lineGroup = [];
          lineGroup.push(refLine);

          k += 1;
          for (let l = k; l < sortedLines.length; l++) {
            k = l;
            let candLine = sortedLines[l];

            let candCoordML = midpoint(
              candLine.cornerPoints[0],
              candLine.cornerPoints[3],
            ); //top left, bottom left

            let candCoordMR = midpoint(
              candLine.cornerPoints[1],
              candLine.cornerPoints[2],
            ); //top right, bottom right

            let lineDist0 = pointToLineDistance(
              candCoordML,
              refCoordML,
              refCoordMR,
            );
            let lineDist1 = pointToLineDistance(
              candCoordMR,
              refCoordML,
              refCoordMR,
            );

            if (lineDist0 <= threshold || lineDist1 <= threshold) {
              lineGroup.push(candLine);
            } else {
              groupedLines.push(lineGroup);
              break;
            }
          }
        }

        //sort text within lines horizontally
        var logText = [];
        for (let p = 0; p < groupedLines.length; p++) {
          groupedLines[p] = groupedLines[p].sort(
            (a, b) => a.cornerPoints[0][0] - b.cornerPoints[0][0],
          );
          var text = '';
          groupedLines[p].forEach(textObject => (text += textObject.text));
          logText.push(text);
        }

        console.log('Line-by-line reconstruction:\n' + logText.join('\n'));

        //calculate default split
        var itemList = [];
        let defaultSplit = {};
        let userIds = Object.keys(LocalData.currentGroup.members);
        userIds.forEach(userId => {
          defaultSplit[userId] = Math.round(10000 / userIds.length) / 100;
        });

        //filter for items
        var p1 = [null, null];
        var p2 = [null, null];
        var threshold = null;
        for (let m = 0; m < groupedLines.length; m++) {
          let line = groupedLines[m];
          let lineText = line.map(chunk => chunk.text).join('');
          console.log('Line: ' + lineText);

          if (
            lineText.toLowerCase().includes('total') &&
            !lineText.toLowerCase().includes('subtotal')
          ) {
            let totalString = lineText.replace(/[^0-9.]/g, '');
            let curList = itemList.concat(LocalData.items);
            let scanTotal = curList.reduce(
              (sumSoFar, nextItem) => sumSoFar + nextItem.itemCost,
              0,
            );
            let detectedTotal = parseFloat(totalString);
            let totalDifference = detectedTotal - scanTotal;
            if (isNaN(detectedTotal) || totalDifference === 0) {
              break;
            }
            console.log('Scan total: ' + scanTotal);
            console.log('Detected total: ' + detectedTotal);
            itemList.push(
              new Item(
                'UNSCANNED ITEMS',
                totalDifference,
                JSONCopy(defaultSplit),
                lineText,
              ),
            );
            break;
          }
          if (
            lineText.toLowerCase().includes('total') ||
            lineText.toLowerCase().includes('balance')
          ) {
            continue;
          }

          //scan line
          for (let n = 0; n < line.length; n++) {
            let index = line.length - n - 1;
            let word = line[index].text.replace(/[^0-9.]/g, '');
            console.log('Line ' + m + ' Word: ' + word);
            let p0 = midpoint(
              line[index].cornerPoints[0],
              line[index].cornerPoints[1],
            ); //top left, top right

            if (!isNaN(parseFloat(word)) && word.includes('.')) {
              if (p1[0] == null) {
                p1 = JSONCopy(p0);
                p2 = midpoint(
                  line[index].cornerPoints[3],
                  line[index].cornerPoints[2],
                ); //bottom left, bottom right
                threshold = pointDistance(p0, line[index].cornerPoints[1]);
              } else if (pointToLineDistance(p0, p1, p2) < threshold) {
                p2 = p0;
              } else {
                break;
              }

              line.splice(index, 1);

              console.log(word);
              let itemCost = parseFloat(word);
              console.log(itemCost);
              let itemName = '';
              line.forEach(chunk => (itemName += ' ' + chunk.text));
              itemName = itemName.replace(/[0-9]/g, '').trim();

              if (itemName.length > 3) {
                itemList.push(
                  new Item(
                    itemName,
                    itemCost,
                    JSONCopy(defaultSplit),
                    lineText,
                  ),
                );
              }
              break;
            }
          }
        }

        if (LocalData.items == null || LocalData.items.length === 0) {
          LocalData.items = itemList;
        } else {
          LocalData.items.push(...itemList);
        }

        if (LocalData.container != null) {
          LocalData.container.forceUpdate();
        }

        MergeState(this, {isProcessing: false});
        LocalData.isCamera = false;
        this.props.navigation.replace(Screen.Contribution);
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
            <Layout style={Styles.buttonRow}>
              <Button
                style={FormStyles.button}
                disabled={this.state.isProcessing}
                onPress={() => {
                  MergeState(this, {isProcessing: true});
                  LocalData.isCamera = true;
                  ImageCropPicker.openPicker({
                    mediaType: 'photo',
                    cropping: true,
                    freeStyleCropEnabled: true,
                    height: IMAGE_HEIGHT,
                    width: IMAGE_WIDTH,
                  }).then(
                    image => this.processImage(image),
                    error => {
                      LocalData.isCamera = false;
                      warnLog(error.message);
                      MergeState(this, {isProcessing: false});
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
                  LocalData.isCamera = true;
                  ImageCropPicker.openCamera({
                    mediaType: 'photo',
                    cropping: true,
                    freeStyleCropEnabled: true,
                    height: IMAGE_HEIGHT,
                    width: IMAGE_WIDTH,
                  }).then(
                    image => this.processImage(image),
                    error => {
                      LocalData.isCamera = false;
                      warnLog(error.message);
                      MergeState(this, {isProcessing: false});
                    },
                  );
                }}>
                Camera
              </Button>
            </Layout>
            <Text appearance="hint" style={Styles.placeholderText}>
              For best results, keep the receipt flat and crop out everything
              except the items and total.
            </Text>
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
                <Image
                  style={Styles.infographic}
                  source={require('./../../resources/from_image_info.png')}
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  placeholderText: {
    textAlign: 'center',
    marginVertical: 20,
    marginHorizontal: 30,
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
  infographic: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{scaleX: 0.7}, {scaleY: 0.7}],
  },
});
