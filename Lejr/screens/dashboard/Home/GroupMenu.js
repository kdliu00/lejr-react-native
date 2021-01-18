import {Button, Layout, Text} from '@ui-kitten/components';
import React, {Component} from 'react';
import {Fragment} from 'react';
import {Alert} from 'react-native';
import {SafeAreaView, StyleSheet} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {IconButton} from '../../../util/ComponentUtil';
import {Screen} from '../../../util/Constants';
import {Balance, TwoColText} from '../../../util/ContributionUI';
import {LeaveIcon, RemoveIcon} from '../../../util/Icons';
import {
  disengageSettleLocks,
  engageSettleLocks,
  leaveCurrentGroup,
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
          <Layout style={Styles.textContainer}>
            <Text style={[Styles.text, Styles.underlineText]} category="h6">
              Group Stats
            </Text>
            <TwoColText text1="Total Expenses" text2={getTotalExpenses()} />
            <Text style={[Styles.text, Styles.underlineText]} category="h6">
              Member Balances
            </Text>
            <ScrollView>
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
            </ScrollView>
          </Layout>
          <Layout style={Styles.buttonContainer}>
            <Layout style={Styles.rowFlex}>
              <IconButton
                status="danger"
                style={Styles.button}
                icon={LeaveIcon}
                onPress={() =>
                  handleLeaveGroup(() =>
                    this.props.navigation.navigate(Screen.Loading),
                  )
                }
              />
              {/* <Button
                style={Styles.button}
                accessoryLeft={RemoveIcon}
                appearance="ghost"
                size="large"
                onPress={() => handleRemoveMember()}
              /> */}
            </Layout>
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
                  Back
                </Button>
              </Fragment>
            )}
          </Layout>
        </SafeAreaView>
      </Layout>
    );
  }
}

function handleLeaveGroup(callback) {
  if (LocalData.currentGroup.members[LocalData.user.userId].balance === 0) {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave ' +
        LocalData.currentGroup.groupName +
        '?',
      [
        {
          text: 'Yes',
          onPress: () => {
            console.log('Submitted intent to leave group');
            leaveCurrentGroup(callback);
          },
        },
        {
          text: 'No',
          onPress: () => console.log('Cancelled intent to leave group'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  } else {
    Alert.alert(
      'Unable to Leave Group',
      'Your balance in the group must be zero in order to leave.',
      [
        {
          text: 'Okay',
          onPress: () => {
            console.log('Cancelled intent to leave group');
          },
        },
      ],
    );
  }
}

function handleRemoveMember() {}

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
    flex: 1,
  },
  text: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginVertical: 5,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45,
  },
  button: {
    marginBottom: 20,
  },
  underlineText: {
    textDecorationLine: 'underline',
    marginVertical: 10,
  },
  rowFlex: {
    flexDirection: 'row',
  },
});
