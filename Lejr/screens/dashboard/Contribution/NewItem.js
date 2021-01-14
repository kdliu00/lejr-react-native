import React, {Component, Fragment} from 'react';
import {
  StyleSheet,
  Keyboard,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import {
  ButtonSpinner,
  InputField,
  onValidationError,
} from '../../../util/TextInputUI';
import FormStyles from '../../../util/FormStyles';
import {Item} from '../../../util/DataObjects';
import * as yup from 'yup';
import {
  getTotal,
  JSONCopy,
  MergeState,
  nearestHundredth,
  StoreData,
} from '../../../util/UtilityMethods';
import {
  getKeyForCurrentGroupItems,
  isPossibleObjectEmpty,
  LocalData,
} from '../../../util/LocalData';
import {AnimDefaultDuration} from '../../../util/Constants';
import {TwoColCheck} from '../../../util/ContributionUI';

export default class NewItem extends Component {
  constructor(props) {
    super();
    this.passedItem = props.route.params.item;
    this.vrIndex = props.route.params.vrIndex;
    this.state = {
      itemCost: !isNaN(parseFloat(this.passedItem.itemCost))
        ? this.passedItem.itemCost.toString()
        : '',
      itemCostError: '',
      itemName: this.passedItem.itemName,
      itemNameError: '',
      isSubmitting: false,
    };
    this.itemNameRef = React.createRef();
    this.itemCostRef = React.createRef();
    this.validationSchema = yup.object().shape({
      itemCost: yup
        .string()
        .test('is-number', 'Cost must be a number', function(value) {
          return !isNaN(value);
        })
        .label('Cost')
        .required(),
      itemName: yup
        .string()
        .label('Item')
        .required(),
    });

    this.itemSplitPercent =
      this.passedItem == null ? {} : JSONCopy(this.passedItem.itemSplit);
    this.itemSplitCheck = {};

    this.groupMemberIds = Object.keys(LocalData.currentGroup.members);

    this.groupMemberIds.forEach(userId => {
      this.itemSplitPercent[userId] = isPossibleObjectEmpty(
        this.passedItem.itemSplit,
      )
        ? Math.round(10000 / this.groupMemberIds.length) / 100
        : this.passedItem.itemSplit[userId] == null
        ? 0
        : this.passedItem.itemSplit[userId];
      this.itemSplitCheck[userId] = isPossibleObjectEmpty(
        this.passedItem.itemSplit,
      )
        ? 1
        : this.itemSplitPercent[userId] === 0
        ? 0
        : 1;
    });
  }

  componentDidMount() {
    console.log('Arrived at NewItem!');
  }

  checkboxCallback(nextChecked, checkedUserId) {
    this.itemSplitCheck[checkedUserId] = nextChecked ? 1 : 0;
    var splitValue =
      Math.round(10000 / getTotal(Object.values(this.itemSplitCheck))) / 100;
    Object.keys(this.itemSplitPercent).forEach(userId => {
      this.itemSplitPercent[userId] = this.itemSplitCheck[userId] * splitValue;
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <SafeAreaView style={Styles.container}>
            <Layout>
              <Text style={Styles.titleText} category="h4">
                Item Editor
              </Text>
            </Layout>
            <Layout>
              <InputField
                fieldError={this.state.itemNameError}
                refToPass={this.itemNameRef}
                validationSchema={this.validationSchema}
                fieldKey="itemName"
                fieldParams={text => ({itemName: text})}
                setField={value => MergeState(this, {itemName: value})}
                setFieldError={value =>
                  MergeState(this, {itemNameError: value})
                }
                placeholder="item"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.itemName}
                autoFocus={this.vrIndex == null}
              />
              <InputField
                fieldError={this.state.itemCostError}
                refToPass={this.itemCostRef}
                validationSchema={this.validationSchema}
                fieldKey="itemCost"
                fieldParams={text => ({itemCost: text})}
                setField={value => MergeState(this, {itemCost: value})}
                setFieldError={value =>
                  MergeState(this, {itemCostError: value})
                }
                placeholder="cost"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.itemCost}
                keyboardType="numeric"
              />
            </Layout>
            <Text style={Styles.subtitle} category="h6">
              Item Split
            </Text>
            <ScrollView style={Styles.scrollView}>
              {this.groupMemberIds.map(userId => {
                return (
                  <Fragment key={userId}>
                    <TwoColCheck
                      isChecked={this.itemSplitCheck[userId] === 1}
                      callback={nextChecked =>
                        this.checkboxCallback(nextChecked, userId)
                      }
                      text={LocalData.currentGroup.members[userId].name}
                    />
                  </Fragment>
                );
              })}
            </ScrollView>
            <Layout style={FormStyles.buttonStyle}>
              <Button
                style={FormStyles.button}
                onPress={() => this.props.navigation.goBack()}
                appearance="outline">
                Go back
              </Button>
              {this.state.isSubmitting ? (
                <Button
                  style={FormStyles.button}
                  accessoryLeft={ButtonSpinner}
                  appearance="ghost"
                />
              ) : (
                <Button
                  style={FormStyles.button}
                  onPress={() => {
                    MergeState(this, {isSubmitting: true});
                    this.validationSchema
                      .validate({
                        itemName: this.state.itemName,
                        itemCost: this.state.itemCost,
                      })
                      .catch(error =>
                        onValidationError(error, [
                          [this.itemNameRef, this.state.itemName],
                          [this.itemCostRef, this.state.itemCost],
                        ]),
                      )
                      .then(valid => {
                        const total = Math.round(
                          Object.values(this.itemSplitPercent).reduce(
                            (a, b) => a + b,
                            0,
                          ),
                        );
                        if (valid) {
                          if (total !== 100) {
                            MergeState(this, {isSubmitting: false});
                            Alert.alert(
                              'Percentage Error',
                              'These percentages add up to ' +
                                total +
                                '%. Please make sure they add up to 100%.',
                            );
                          } else {
                            const UpdatedItem = new Item(
                              this.state.itemName,
                              nearestHundredth(Number(this.state.itemCost)),
                              this.itemSplitPercent,
                              this.passedItem ? this.passedItem.rawText : null,
                            );
                            if (this.vrIndex != null) {
                              LocalData.items[this.vrIndex] = UpdatedItem;
                            } else {
                              LocalData.items.push(UpdatedItem);
                            }
                            // LocalData.items = removeNullsFromList(
                            //   LocalData.items,
                            // );
                            StoreData(
                              getKeyForCurrentGroupItems(),
                              LocalData.items,
                            );
                            LocalData.container.forceUpdate();
                            setTimeout(
                              () => this.props.navigation.goBack(),
                              AnimDefaultDuration,
                            );
                          }
                        } else {
                          MergeState(this, {isSubmitting: false});
                        }
                      });
                  }}>
                  Save
                </Button>
              )}
            </Layout>
          </SafeAreaView>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
    width: Dimensions.get('window').width,
    marginTop: 15,
    marginBottom: 10,
  },
  titleText: {
    marginTop: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 25,
    textDecorationLine: 'underline',
  },
});
