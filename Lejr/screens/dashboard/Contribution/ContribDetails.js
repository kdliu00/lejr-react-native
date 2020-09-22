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
  getMoneyFormatString,
  getTotal,
  MergeState,
  nearestHundredth,
} from '../../../util/UtilityMethods';
import FormStyles from '../../../util/FormStyles';
import * as yup from 'yup';
import {
  deleteAllItems,
  filterItemCosts,
  LocalData,
  uploadVirtualReceipt,
  getVirtualReceiptsForGroup,
} from '../../../util/LocalData';
import {PurchaseSplit} from '../../../util/ContributionUI';
import {AnimKeyboardDuration, Screen} from '../../../util/Constants';
import Animated, {Easing} from 'react-native-reanimated';
import {ScrollView} from 'react-native-gesture-handler';
import {VirtualReceipt} from '../../../util/DataObjects';

const SLIDER_SHOW = Dimensions.get('screen').height - 450;
const SLIDER_HIDE = Math.round(SLIDER_SHOW * 0.4);

export default class ContribDetails extends Component {
  constructor() {
    super();
    this.state = {
      memo: LocalData.currentVR ? LocalData.currentVR.memo : '',
      memoError: '',
      isSubmitting: false,
      renderHeight: new Animated.Value(SLIDER_SHOW),
    };
    this.memoRef = React.createRef();
    this.validationSchema = yup.object().shape({
      memo: yup
        .string()
        .label('Memo')
        .required(),
    });
    this.scrollExpanded = true;

    this.totalSplit = {};
    this.currentTotal = getTotal(filterItemCosts());
    this.purchaseSplit = Object.keys(LocalData.currentGroup.memberNames).map(
      userId => {
        const userName = LocalData.currentGroup.memberNames[userId];
        const perItemPay = LocalData.items.map(item => {
          const itemPercent = item.itemSplit[userId] / 100;
          return item.itemCost * itemPercent;
        });
        const userTotal = nearestHundredth(getTotal(perItemPay));
        const userTotalPercent = nearestHundredth(
          (100 * userTotal) / this.currentTotal,
        );
        this.totalSplit[userId] = userTotalPercent;
        return (
          <PurchaseSplit
            key={userId}
            userName={userName}
            userTotal={userTotal}
            userTotalPercent={Math.round(userTotalPercent)}
          />
        );
      },
    );
  }

  componentDidMount() {
    console.log('Arrived at ContribDetails!');
    this.keyboardDidShowSub = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow,
    );
    this.keyboardDidHideSub = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide,
    );
  }

  async componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();
  }

  keyboardDidShow = () => {
    this.toggleAnim();
  };

  keyboardDidHide = () => {
    this.toggleAnim();
  };

  toggleAnim() {
    const {renderHeight} = this.state;
    Animated.timing(renderHeight, {
      duration: AnimKeyboardDuration,
      toValue: this.scrollExpanded ? SLIDER_HIDE : SLIDER_SHOW,
      easing: Easing.inOut(Easing.linear),
    }).start();
    this.scrollExpanded = !this.scrollExpanded;
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <SafeAreaView style={Styles.container}>
            <Layout>
              <Text style={Styles.titleText} category="h4">
                Purchase Details
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
                  ? LocalData.currentGroup.memberNames[
                      LocalData.currentVR.buyerId
                    ]
                  : LocalData.currentGroup.memberNames[LocalData.user.userId]}
              </Text>
            </Layout>
            <Animated.View
              style={[
                Styles.scrollContainer,
                {height: this.state.renderHeight},
              ]}>
              <ScrollView style={Styles.scrollView}>
                {this.purchaseSplit}
              </ScrollView>
            </Animated.View>
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
                              LocalData.items,
                              this.currentTotal,
                              this.totalSplit,
                              '',
                            ),
                          ).then(
                            () => {
                              deleteAllItems();
                              LocalData.currentVR = null;
                              getVirtualReceiptsForGroup(
                                LocalData.currentGroup.groupId,
                              ).then(() => {
                                LocalData.home.forceUpdate();
                                setTimeout(
                                  () =>
                                    this.props.navigation.navigate(
                                      Screen.DashboardMain,
                                      {screen: Screen.Home},
                                    ),
                                  AnimKeyboardDuration,
                                );
                              });
                            },
                            error => {
                              console.warn('Received error: ' + error);
                              MergeState(this, {isSubmitting: false});
                            },
                          );
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
    paddingTop: 10,
  },
  scrollContainer: {
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
