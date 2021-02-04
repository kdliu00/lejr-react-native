import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Layout, Spinner} from '@ui-kitten/components';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';

export default class QRScanner extends Component {
  constructor() {
    super();
    this.state = {
      isProcessing: false,
    };
  }

  componentDidMount() {
    console.log('Arrived at QRScanner');
  }

  onReadQR(result) {
    this.setState({isProcessing: true});
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Button
            disabled={this.state.isProcessing}
            style={Styles.bottomButton}
            appearance="outline"
            onPress={() => this.props.navigation.goBack()}>
            Back
          </Button>
          {this.state.isProcessing ? (
            <Layout style={Styles.loading}>
              <Spinner size="large" />
            </Layout>
          ) : (
            <QRCodeScanner
              onRead={this.onReadQR}
              flashMode={RNCamera.Constants.FlashMode.off}
            />
          )}
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
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButton: {
    marginBottom: 60,
    marginTop: 80,
  },
});
