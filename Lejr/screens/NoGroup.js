import React from 'react';
import {TouchableWithoutFeedback, StyleSheet, Keyboard} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import {signOut} from '../util/LocalData';
import {Screen} from '../util/Constants';
import FormStyles from '../util/FormStyles';
import {Component} from 'react';

export default class NoGroup extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    console.log('Arrived at NoGroup');
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <Layout style={Styles.textContainer}>
            <Text style={Styles.text} category="h6">
              It looks like you're not in a group yet!
            </Text>
            <Text style={Styles.text}>
              You can either create a group or join one by scanning its QR code.
            </Text>
            <Layout style={Styles.buttonRow}>
              <Button
                style={Styles.button}
                appearance="outline"
                onPress={() =>
                  this.props.navigation.navigate(Screen.CreateGroup)
                }>
                Create group
              </Button>
              <Button
                style={Styles.button}
                appearance="outline"
                onPress={() =>
                  this.props.navigation.navigate(Screen.QRScanner)
                }>
                Scan QR Code
              </Button>
            </Layout>
          </Layout>
          <Layout style={FormStyles.buttonStyle}>
            <Button
              style={FormStyles.button}
              appearance="filled"
              onPress={() => signOut()}>
              Sign out
            </Button>
          </Layout>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
    alignItems: 'center',
  },
  buttonRow: {
    marginVertical: 10,
    flexDirection: 'row',
  },
  button: {
    margin: 10,
    width: 140,
  },
  textContainer: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    marginVertical: 10,
  },
});
