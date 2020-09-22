import React, {Component} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {Alert} from 'react-native';

export {
  MergeState,
  StoreData,
  RetrieveData,
  nearestHundredth,
  getTotal,
  getMoneyFormatString,
  removeNullsFromList,
};

/**
 * Non-destructive wrapper for setState() method.
 * @param component component to set state for (this)
 * @param value object containing new values ({key: value})
 */
function MergeState(component: Component, value: Object) {
  component.setState({...component.state, ...value});
}

/**
 * Stores and persists data locally.
 * Passing in null for value deletes the data at key.
 * @param key storage key
 * @param value storage value
 */
async function StoreData(key: string, value: any) {
  if (key == null) {
    console.log('Storage key was null, value not saved: ' + value);
    return;
  }
  console.log('Storing data for key ' + key);
  try {
    if (value == null) {
      await AsyncStorage.removeItem(key);
    } else {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    }
  } catch (e) {
    Alert.alert('Error', 'Could not save data.');
  }
}

/**
 * Retrieves data that was stored locally. Returns null if no data for key.
 * @param key storage key
 */
async function RetrieveData(key: string) {
  console.log('Retrieving data for key ' + key);
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue == null ? null : JSON.parse(jsonValue);
  } catch (e) {
    Alert.alert('Error', 'Could not load data.');
  }
}

/**
 * Sums a list of numbers
 * @param list list of numbers
 */
function getTotal(list: number[]) {
  return list.reduce((a, b) => a + b, 0);
}

/**
 * Converts to nearest hundredth
 * @param num number to round
 */
function nearestHundredth(num: number) {
  return Math.round(100 * num) / 100;
}

/**
 * Rounds and formats string to include zeros down to hundredths
 * @param amount money amount
 */
function getMoneyFormatString(amount: number) {
  var returnString = amount.toString();
  const h = amount * 100;
  if (h % 100 != 0) {
    if (h % 10 == 0) {
      returnString += '0';
    }
  }
  return returnString;
}

/**
 * Filters out nulls and returns filtered list
 * @param list list to filter
 */
function removeNullsFromList(list: any[]) {
  return list.filter(item => item != null);
}
