import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Home from './dashboard/Home/Home';
import Settings from './dashboard/Settings';
import Contribution from './dashboard/Contribution/Contribution';
import FromImage from './dashboard/FromImage';
import {Screen} from '../util/Constants';

import InviteToGroup from './dashboard/Home/InviteToGroup';

import NewItem from './dashboard/Contribution/NewItem';

import {Component} from 'react';
import ContribDetails from './dashboard/Contribution/ContribDetails';
import GroupMenu from './dashboard/Home/GroupMenu';
import QuickAdd from './dashboard/Contribution/QuickAdd';
import QRScanner from './dashboard/QRScanner';

const ModalStack = createStackNavigator();

export default class Dashboard extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    console.log('Arrived at Dashboard');
  }

  render() {
    return <DashboardScreen />;
  }
}

const DashboardScreen = () => (
  <ModalStack.Navigator mode="modal" screenOptions={{headerShown: false}}>
    <ModalStack.Screen name={Screen.Home} component={Home} />
    <ModalStack.Screen name={Screen.InviteToGroup} component={InviteToGroup} />
    <ModalStack.Screen name={Screen.GroupMenu} component={GroupMenu} />
    <ModalStack.Screen name={Screen.NewItem} component={NewItem} />
    <ModalStack.Screen name={Screen.Contribution} component={Contribution} />
    <ModalStack.Screen name={Screen.FromImage} component={FromImage} />
    <ModalStack.Screen name={Screen.Settings} component={Settings} />
    <ModalStack.Screen name={Screen.QRScanner} component={QRScanner} />
    <ModalStack.Screen
      name={Screen.ContribDetails}
      component={ContribDetails}
    />
    <ModalStack.Screen name={Screen.QuickAdd} component={QuickAdd} />
  </ModalStack.Navigator>
);
