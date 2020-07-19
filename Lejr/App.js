import React from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  AppState,
} from 'react-native';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import firebase from '@react-native-firebase/app';
import * as eva from '@eva-design/eva';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';

import Loading from './screens/Loading';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import EmailLogin from './screens/EmailLogin';
import CreateAccount from './screens/CreateAccount';
import CreateGroup from './screens/CreateGroup';

import {default as theme} from './eva-theme.json';
import {Screens} from './util/Constants';
import {pushGroupData, pushUserData} from './util/LocalData';
import {BackHandler} from 'react-native';
import {Alert} from 'react-native';

console.disableYellowBox = true;

if (firebase.apps.length === 0) {
  firebase.initializeApp();
}

firebase.apps.forEach(app => {
  console.log('App name: ', app.name);
});

const Stack = createStackNavigator();

AppState.addEventListener('change', () => {
  pushUserData();
  pushGroupData();
});

BackHandler.addEventListener('hardwareBackPress', () => {
  Alert.alert(
    'Exit Lejr',
    'Are you sure you want to exit Lejr?',
    [
      {
        text: 'Yes',
        onPress: () => {
          console.log('Exiting Lejr');
          BackHandler.exitApp();
        },
        style: 'cancel',
      },
      {text: 'No', onPress: () => console.log('Not exiting Lejr')},
    ],
    {cancelable: false},
  );
  return true;
});

export default function App() {
  console.log('Arrived at App');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={Styles.container}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={Screens.Loading}
            screenOptions={{headerShown: false, gestureEnabled: false}}>
            <Stack.Screen name={Screens.Loading} component={Loading} />
            <Stack.Screen name={Screens.Login} component={Login} />
            <Stack.Screen name={Screens.EmailLogin} component={EmailLogin} />
            <Stack.Screen
              name={Screens.CreateAccount}
              component={CreateAccount}
            />
            <Stack.Screen name={Screens.CreateGroup} component={CreateGroup} />
            <Stack.Screen name={Screens.Dashboard} component={Dashboard} />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </KeyboardAvoidingView>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
});
