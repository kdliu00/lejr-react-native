import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Layout} from '@ui-kitten/components';

export default class Settings extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    console.log('Arrived at Settings');
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Button
            style={Styles.bottomButton}
            appearance="outline"
            onPress={() => this.props.navigation.goBack()}>
            Back
          </Button>
        </SafeAreaView>
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  bottomButton: {
    marginBottom: 60,
    marginTop: 80,
  },
});
