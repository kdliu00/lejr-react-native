import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';

import LoginScreen from './screens/LoginScreen';
import LoadingScreen from './screens/LoadingScreen';
import DashboardScreen from './screens/DashboardScreen';

export default class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <View style={styles.container}>
          <Text>Hello world!</Text>
        </View>
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
