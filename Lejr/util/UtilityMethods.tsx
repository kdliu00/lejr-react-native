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
  JSONCopy,
  pointToLineDistance,
  pointDistance,
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
  var returnString = nearestHundredth(amount).toString();
  const h = Math.round(amount * 100);
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

/**
 * Copies an object using JSON
 * @param obj object to copy
 */
function JSONCopy(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Computes distance between point (x0,y0) to line defined by (x1,y1) and (x2,y2)
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
function pointToLineDistance(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  return (
    Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) /
    Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2))
  );
}

/**
 * Computes distance between points (x0,y0) and (x1,y1)
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 */
function pointDistance(x0: number, y0: number, x1: number, y1: number) {
  return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
}
