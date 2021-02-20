import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Button, Layout, Spinner} from '@ui-kitten/components';
import {QRScannerView} from 'react-native-qrcode-scanner-view';
import {AnimDefaultDuration, ErrorCode, Screen} from '../util/Constants';
import {Fragment} from 'react';
import {joinGroup, swapGroup} from '../util/LocalData';
import {warnLog} from '../util/UtilityMethods';
import {Alert} from 'react-native';

export default class QRScanner extends Component {
  constructor() {
    super();
    this.state = {
      isProcessing: false,
      ready: false,
    };
  }

  componentDidMount() {
    console.log('Arrived at QRScanner');
    setTimeout(() => this.setState({ready: true}), AnimDefaultDuration);
  }

  onReadQR(result) {
    this.setState({isProcessing: true});
    joinGroup(result.data).then(
      () => {
        swapGroup(result.data, () =>
          this.props.navigation.navigate(Screen.Loading),
        );
      },
      error => {
        warnLog(error.message);
        if (error.message !== ErrorCode.DoesNotExist) {
          Alert.alert('Group Error', 'Failed to join group. Please try again.');
        }
        this.props.navigation.goBack();
      },
    );
  }

  render() {
    return (
      <Layout style={Styles.container}>
        {this.state.isProcessing ? (
          <Layout style={Styles.loading}>
            <Spinner size="large" />
          </Layout>
        ) : (
          <Fragment>
            <QRScannerView
              onScanResult={this.onReadQR.bind(this)}
              renderFooterView={() => (
                <Layout
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    flexDirection: 'column-reverse',
                    backgroundColor: 'rgba(0,0,0,0)',
                  }}>
                  <Button
                    disabled={this.state.isProcessing}
                    style={Styles.bottomButton}
                    appearance="filled"
                    onPress={() => this.props.navigation.goBack()}>
                    Back
                  </Button>
                </Layout>
              )}
              cornerStyle={{
                height: 32,
                width: 32,
                borderWidth: 4,
                borderColor: '#7D70F0',
              }}
              hintText=""
              maskColor="rgba(0,0,0,0)"
              isShowScanBar={false}
            />
            {!this.state.ready && <Layout style={Styles.overlay} />}
          </Fragment>
        )}
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
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
  overlay: {
    flex: 1,
    backgroundColor: 'black',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
