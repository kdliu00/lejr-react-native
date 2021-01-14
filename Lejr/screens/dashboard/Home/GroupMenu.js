import {Button, Layout, Text} from '@ui-kitten/components';
import React, {Component} from 'react';
import {Fragment} from 'react';
import {Alert} from 'react-native';
import {SafeAreaView, StyleSheet} from 'react-native';
import {Balance, TwoColText} from '../../../util/ContributionUI';
import {
  disengageSettleLocks,
  engageSettleLocks,
  LocalData,
  pushGroupData,
} from '../../../util/LocalData';
import {ButtonSpinner} from '../../../util/TextInputUI';
import {getMoneyFormatString, MergeState} from '../../../util/UtilityMethods';

export default class GroupMenu extends Component {
  constructor() {
    super();
    this.state = {
      isSubmitting: false,
    };

    this.entryCallbacks = {};
  }

  componentDidMount() {
    console.log('Arrived at GroupMenu');
    LocalData.groupMenu = this;
  }

  componentWillUnmount() {
    LocalData.groupMenu = null;
  }

  submitSettle() {
    Alert.alert(
      'Settle Balances',
      'Once all members of the group tap this button, member balances will be reset to zero and all previous purchases will be unavailable. Would you like to continue?',
      [
        {
          text: 'Yes',
          onPress: () => {
            console.log('Submitted intent to settle');
            MergeState(this, {isSubmitting: true});
            engageSettleLocks();
          },
        },
        {
          text: 'No',
          onPress: () => console.log('Cancelled intent to settle'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  }

  cancelSettle() {
    disengageSettleLocks();
    MergeState(this, {isSubmitting: false});
  }

  settle() {
    console.log('Attempting to settle balances');
    Object.keys(LocalData.currentGroup.members).forEach(userId => {
      LocalData.currentGroup.members[userId].balance = 0.0;
      LocalData.currentGroup.settleLocks[userId] = false;
    });
    LocalData.currentGroup.lastSettleDate = Date.now();
    LocalData.currentGroup.settler = null;
    pushGroupData();
    console.log('Settle balances success');
    MergeState(this, {isSubmitting: false});
    this.props.navigation.popToTop();
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Text style={Styles.titleText} category="h4">
            {LocalData.currentGroup.groupName}
          </Text>
          <Text style={Styles.text} appearance="hint">
            Here is an overview of your group. You can also settle balances by
            tapping the button below.
          </Text>
          <Layout style={Styles.textContainer}>
            <Text style={[Styles.text, Styles.underlineText]} category="h6">
              Member Balances
            </Text>
            {Object.keys(LocalData.currentGroup.members).map(userId => {
              return (
                <Fragment key={userId}>
                  <Balance
                    groupMenuInstance={this}
                    isChecked={LocalData.currentGroup.settleLocks[userId]}
                    userName={LocalData.currentGroup.members[userId].name}
                    userId={userId}
                  />
                </Fragment>
              );
            })}
            <Text style={[Styles.text, Styles.underlineText]} category="h6">
              Group Stats
            </Text>
            <TwoColText text1="Total Expenses" text2={getTotalExpenses()} />
          </Layout>
          <Layout style={Styles.buttonContainer}>
            {this.state.isSubmitting ? (
              <Fragment>
                <Button
                  style={Styles.button}
                  accessoryLeft={ButtonSpinner}
                  appearance="ghost"
                />
                <Button
                  style={Styles.button}
                  onPress={() => this.cancelSettle()}
                  appearance="outline">
                  Cancel
                </Button>
              </Fragment>
            ) : (
              <Fragment>
                <Button
                  style={Styles.button}
                  onPress={() => this.submitSettle()}
                  appearance="filled">
                  Settle balances
                </Button>
                <Button
                  style={Styles.button}
                  onPress={() => this.props.navigation.goBack()}
                  appearance="outline">
                  Go back
                </Button>
              </Fragment>
            )}
          </Layout>
        </SafeAreaView>
      </Layout>
    );
  }
}

function getTotalExpenses() {
  var total = 0;
  Object.keys(LocalData.currentGroup.members).forEach(userId => {
    total += Math.abs(LocalData.currentGroup.members[userId].balance);
  });
  return '$' + getMoneyFormatString(total.toString());
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 4,
    marginVertical: 10,
    marginHorizontal: 15,
  },
  text: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginVertical: 5,
  },
  buttonContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 15,
  },
  underlineText: {
    textDecorationLine: 'underline',
    marginVertical: 10,
  },
});
