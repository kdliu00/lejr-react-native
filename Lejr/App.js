import React from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  AppState,
  StatusBar,
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
import Invitations from './screens/dashboard/Home/Invitations';

import {default as theme} from './eva-theme.json';
import {bugfenderAppId, Key, Screen, Theme} from './util/Constants';
import {
  detachListeners,
  getKeyForCurrentGroupItems,
  getUserInvitations,
  isPossibleObjectEmpty,
  loadGroupAsMain,
  LocalData,
  pushUserData,
} from './util/LocalData';
import {BackHandler} from 'react-native';
import {Alert} from 'react-native';
import {StoreData, warnLog} from './util/UtilityMethods';
import {LogBox} from 'react-native';
import Bugfender from '@bugfender/rn-bugfender';

LogBox.ignoreAllLogs();

if (firebase.apps.length === 0) {
  firebase.initializeApp();
}

firebase.apps.forEach(app => {
  console.log('Loading Firebase app: ', app.name);
});

Bugfender.init(bugfenderAppId);

const Stack = createStackNavigator();
const RootStack = createStackNavigator();

AppState.addEventListener('change', state => {
  console.log('App state has changed');
  switch (state) {
    case 'active':
      console.log('Attaching firestore listeners');
      if (
        LocalData.user != null &&
        LocalData.currentGroup != null &&
        !LocalData.isCamera
      ) {
        loadGroupAsMain(LocalData.currentGroup.groupId, () =>
          console.log('Attached group listener'),
        );
        getUserInvitations(LocalData.user.userId);
      }
      break;

    case 'background':
      if (!LocalData.isCamera) {
        detachListeners();
        if (!isPossibleObjectEmpty(LocalData.groupMenu)) {
          LocalData.groupMenu.cancelSettle();
        }
        StoreData(getKeyForCurrentGroupItems(), LocalData.items);
      }
      pushUserData();
      break;

    default:
      warnLog('App state unrecognized: ' + state);
      break;
  }
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
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{...eva.light, ...theme}}>
        <NavigationContainer>
          <RootStack.Navigator
            mode="modal"
            screenOptions={{headerShown: false, gestureEnabled: false}}>
            <RootStack.Screen
              name={Screen.Parent}
              component={ParentStack}
              options={{headerShown: false}}
            />
            <RootStack.Screen
              name={Screen.Invitations}
              component={Invitations}
            />
          </RootStack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </KeyboardAvoidingView>
  );
}

const ParentStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={Screen.Loading}
      screenOptions={{headerShown: false, gestureEnabled: false}}>
      <Stack.Screen name={Screen.Loading} component={Loading} />
      <Stack.Screen name={Screen.Login} component={Login} />
      <Stack.Screen name={Screen.EmailLogin} component={EmailLogin} />
      <Stack.Screen name={Screen.CreateAccount} component={CreateAccount} />
      <Stack.Screen name={Screen.CreateGroup} component={CreateGroup} />
      <Stack.Screen name={Screen.Dashboard} component={Dashboard} />
    </Stack.Navigator>
  );
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
