import React, {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  midpoint,
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
 * Computes distance between point p0 to line defined by p1 and p2
 * @param p0
 * @param p1
 * @param p2
 */
function pointToLineDistance(p0: number[], p1: number[], p2: number[]) {
  return (
    Math.abs(
      (p2[1] - p1[1]) * p0[0] -
        (p2[0] - p1[0]) * p0[1] +
        p2[0] * p1[1] -
        p2[1] * p1[0],
    ) / Math.sqrt(Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[0] - p1[0], 2))
  );
}

/**
 * Computes distance between points p0 and p1
 * @param p0
 * @param p1
 */
function pointDistance(p0: number[], p1: number[]) {
  return Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2));
}

/**
 * Computes the midpoint of two points
 * @param p0
 * @param p1
 */
function midpoint(p0: number[], p1: number[]) {
  return [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
}
