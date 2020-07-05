import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
} from '@ui-kitten/components';

import Home from './dashboard/Home';
import Settings from './dashboard/Settings';
import Contribution from './dashboard/Contribution';
import FromImage from './dashboard/FromImage';

const {Navigator, Screen} = createBottomTabNavigator();

const HomeIcon = props => <Icon name="home-outline" {...props} />;
const ContributionIcon = props => <Icon name="plus-outline" {...props} />;
const CameraIcon = props => <Icon name="camera-outline" {...props} />;
const SettingsIcon = props => <Icon name="settings-2-outline" {...props} />;

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
    <BottomNavigationTab icon={HomeIcon} />
    <BottomNavigationTab icon={ContributionIcon} />
    <BottomNavigationTab icon={CameraIcon} />
    <BottomNavigationTab icon={SettingsIcon} />
  </BottomNavigation>
);

const TabNavigator = () => (
  <Navigator tabBar={props => <BottomTabBar {...props} />}>
    <Screen name="Home" component={Home} />
    <Screen name="Contribution" component={Contribution} />
    <Screen name="Camera" component={FromImage} />
    <Screen name="Settings" component={Settings} />
  </Navigator>
);
