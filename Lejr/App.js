import React from 'react';
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
import EmailLoginScreen from './screens/EmailLogin';

import {default as theme} from './eva-theme.json';

console.disableYellowBox = true;

if (firebase.apps.length === 0) {
  firebase.initializeApp();
}

firebase.apps.forEach(app => {
  console.log('App name: ', app.name);
});

const Stack = createStackNavigator();

export default function App() {
  console.log('Arrived at App!');

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Loading"
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="Loading" component={Loading} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="EmailLogin" component={EmailLoginScreen} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </>
  );
}
