import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
} from '@ui-kitten/components';

import Home from './dashboard/Home';
import Settings from './dashboard/Settings';
import Contribution from './dashboard/Contribution';
import FromImage from './dashboard/FromImage';
import {Screens} from '../util/Constants';

import InviteToGroup from './dashboard/InviteToGroup';
import Invitations from './dashboard/Invitations';

const MainStack = createBottomTabNavigator();
const RootStack = createStackNavigator();

const HomeIcon = props => <Icon name="home-outline" {...props} />;
const ContributionIcon = props => (
  <Icon name="shopping-cart-outline" {...props} />
);
const CameraIcon = props => <Icon name="camera-outline" {...props} />;
const SettingsIcon = props => <Icon name="settings-2-outline" {...props} />;

export default function Dashboard({navigation}) {
  console.log('Arrived at Dashboard');

  return <DashboardScreen />;
}

const DashboardScreen = () => (
  <RootStack.Navigator mode="modal" screenOptions={{headerShown: false}}>
    <RootStack.Screen
      name="DashboardMain"
      component={TabNavigatorComponent}
      options={{headerShown: false}}
    />
    <RootStack.Screen name={Screens.InviteToGroup} component={InviteToGroup} />
    <RootStack.Screen name={Screens.Invitations} component={Invitations} />
  </RootStack.Navigator>
);

const TabNavigatorComponent = () => (
  <TabNavigator
    initialRouteName={Screens.Home}
    screenOptions={{headerShown: false}}
  />
);

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
  <MainStack.Navigator tabBar={props => <BottomTabBar {...props} />}>
    <MainStack.Screen name={Screens.Home} component={Home} />
    <MainStack.Screen name={Screens.Contribution} component={Contribution} />
    <MainStack.Screen name={Screens.FromImage} component={FromImage} />
    <MainStack.Screen name={Screens.Settings} component={Settings} />
  </MainStack.Navigator>
);
