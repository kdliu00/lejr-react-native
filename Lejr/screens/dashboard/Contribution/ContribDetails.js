import React, {Component} from 'react';
import {
  Dimensions,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import {Button, Layout, Text} from '@ui-kitten/components';
import {
  ButtonSpinner,
  InputField,
  onValidationError,
} from '../../../util/TextInputUI';
import {
  errorLog,
  getMoneyFormatString,
  getTotal,
  MergeState,
  nearestHundredth,
  removeNullsFromList,
} from '../../../util/UtilityMethods';
import FormStyles from '../../../util/FormStyles';
import * as yup from 'yup';
import {
  filterItemCosts,
  getMemberName,
  LocalData,
  resetVR,
  uploadVirtualReceipt,
} from '../../../util/LocalData';
import {PurchaseSplit} from '../../../util/ContributionUI';
import {AnimKeyboardDuration} from '../../../util/Constants';
import {ScrollView} from 'react-native-gesture-handler';
import {VirtualReceipt} from '../../../util/DataObjects';

export default class ContribDetails extends Component {
  constructor() {
    super();
    this.state = {
      memo: LocalData.currentVR ? LocalData.currentVR.memo : '',
      memoError: '',
      isSubmitting: false,
    };
    this.memoRef = React.createRef();
    this.validationSchema = yup.object().shape({
      memo: yup
        .string()
        .label('Memo')
        .required(),
    });

    this.totalSplit = {};
    this.totalSplitAmount = {};
    LocalData.items = removeNullsFromList(LocalData.items);
    this.currentTotal = getTotal(filterItemCosts());
    this.purchaseSplit = this.getTotalPurchaseSplit();
  }

  componentDidMount() {
    console.log('Arrived at ContribDetails!');
  }

  getTotalPurchaseSplit() {
    return Object.keys(LocalData.currentGroup.members).map(userId => {
      var userTotal = 0;
      const userName = getMemberName(userId);
      LocalData.items.map(item => {
        userTotal += item.itemCost * (item.itemSplit[userId] / 100);
      });
      const userTotalPercent = nearestHundredth(
        (100 * userTotal) / this.currentTotal,
      );
      this.totalSplit[userId] = userTotalPercent;
      return (
        <PurchaseSplit
          key={userId}
          userName={userName}
          userTotal={nearestHundredth(userTotal)}
          userTotalPercent={Math.round(userTotalPercent)}
        />
      );
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <SafeAreaView style={Styles.container}>
            <Layout>
              <Text style={Styles.titleText} category="h4">
                {LocalData.currentVR ? 'Update Purchase' : 'Create Purchase'}
              </Text>
            </Layout>
            <Layout>
              <InputField
                fieldError={this.state.memoError}
                refToPass={this.memoRef}
                validationSchema={this.validationSchema}
                fieldKey="memo"
                fieldParams={text => ({memo: text})}
                setField={value => MergeState(this, {memo: value})}
                setFieldError={value => MergeState(this, {memoError: value})}
                placeholder="memo"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.memo}
                autoCorrect={true}
                autoFocus={!this.state.memo}
              />
            </Layout>
            <Layout style={Styles.infoContainer}>
              <Text style={Styles.centerText} category="h5">
                Total: $
                {getMoneyFormatString(
                  nearestHundredth(getTotal(filterItemCosts())),
                )}
              </Text>
              <Text style={Styles.centerText}>
                Purchased by{' '}
                {LocalData.currentVR
                  ? LocalData.currentGroup.members[LocalData.currentVR.buyerId]
                      .name
                  : LocalData.currentGroup.members[LocalData.user.userId].name}
              </Text>
            </Layout>
            <ScrollView style={Styles.scrollView}>
              {this.purchaseSplit}
            </ScrollView>
            <Layout style={FormStyles.buttonStyle}>
              <Button
                disabled={this.state.isSubmitting}
                style={FormStyles.button}
                onPress={() => this.props.navigation.goBack()}
                appearance="outline">
                Cancel
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
                        memo: this.state.memo,
                      })
                      .catch(error =>
                        onValidationError(error, [
                          [this.memoRef, this.state.memo],
                        ]),
                      )
                      .then(valid => {
                        if (valid) {
                          uploadVirtualReceipt(
                            new VirtualReceipt(
                              LocalData.currentVR
                                ? LocalData.currentVR.buyerId
                                : LocalData.user.userId,
                              LocalData.currentVR
                                ? LocalData.currentVR.virtualReceiptId
                                : '',
                              this.state.memo,
                              LocalData.currentVR
                                ? LocalData.currentVR.timestamp
                                : Date.now(),
                              removeNullsFromList(LocalData.items),
                              this.currentTotal,
                              this.totalSplit,
                              '',
                            ),
                            () => {
                              resetVR();
                              setTimeout(
                                () => this.props.navigation.popToTop(),
                                AnimKeyboardDuration,
                              );
                            },
                            error => {
                              errorLog('Received error: ' + error);
                              MergeState(this, {isSubmitting: false});
                            },
                          );
                        } else {
                          MergeState(this, {isSubmitting: false});
                        }
                      });
                  }}>
                  {LocalData.currentVR ? 'Update' : 'Save'}
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
    paddingTop: 10,
    width: Dimensions.get('window').width,
    marginTop: 10,
  },
  titleText: {
    marginTop: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  centerText: {
    textAlign: 'center',
    marginVertical: 2,
  },
  infoContainer: {
    marginTop: 20,
  },
});
