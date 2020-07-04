import React from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BottomNavigation, BottomNavigationTab} from '@ui-kitten/components';

import Home from './dashboard/Home';
import Settings from './dashboard/Settings';

const {Navigator, Screen} = createBottomTabNavigator();

export default function Dashboard() {
  console.log('Arrived at Dashboard!');
  return (
    <TabNavigator initialRouteName="Home" screenOptions={{header: null}} />
  );
}

const BottomTabBar = ({navigation, state}) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={index => navigation.navigate(state.routeNames[index])}>
    <BottomNavigationTab title="Home" />
    <BottomNavigationTab title="Settings" />
  </BottomNavigation>
);

const TabNavigator = () => (
  <Navigator tabBar={props => <BottomTabBar {...props} />}>
    <Screen name="Home" component={Home} />
    <Screen name="Settings" component={Settings} />
  </Navigator>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
