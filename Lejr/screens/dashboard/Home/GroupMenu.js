import {Button, Layout, Text} from '@ui-kitten/components';
import React, {Component} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {Balance, TwoColText} from '../../../util/ContributionUI';
import {LocalData} from '../../../util/LocalData';
import {getMoneyFormatString} from '../../../util/UtilityMethods';

export default class GroupMenu extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    console.log('Arrived at GroupMenu');
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Text style={Styles.titleText} category="h4">
            {LocalData.currentGroup.groupName}
          </Text>
          <Text style={Styles.text} appearance="hint">
            Here is an overview of your group. You can also initiate settling
            balances below.
          </Text>
          <Layout style={Styles.textContainer}>
            <Text style={[Styles.text, Styles.underlineText]} category="h6">
              Member Balances
            </Text>
            {Object.keys(LocalData.currentGroup.members).map(userId => {
              return (
                <Balance
                  userName={LocalData.currentGroup.members[userId].name}
                  userId={userId}
                />
              );
            })}
            <Text style={[Styles.text, Styles.underlineText]} category="h6">
              Group Stats
            </Text>
            <TwoColText text1="Total Expenses" text2={getTotalExpenses()} />
          </Layout>
          <Layout style={Styles.buttonContainer}>
            <Button
              style={Styles.button}
              onPress={() => this.props.navigation.goBack()}
              appearance="filled">
              Settle balances
            </Button>
            <Button
              style={Styles.button}
              onPress={() => this.props.navigation.goBack()}
              appearance="outline">
              Go back
            </Button>
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
    flex: 3,
    margin: 10,
  },
  text: {
    textAlign: 'center',
    marginHorizontal: 15,
    marginVertical: 5,
  },
  buttonContainer: {
    flex: 2,
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
