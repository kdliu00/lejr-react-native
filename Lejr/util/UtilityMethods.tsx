import React, {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {Key, Minus} from './Constants';
import Bugfender from '@bugfender/rn-bugfender';

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
  TextLine,
  Bounds,
  Point,
  TextRef,
  getItemFromTextLine,
  warnLog,
  errorLog,
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
  console.log('Storing data for key: ' + key);
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
  console.log('Retrieving data for key: ' + key);
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
  if (isNaN(num)) {
    return 0;
  }
  return Math.round(100 * num) / 100;
}

/**
 * Rounds and formats string to include zeros down to hundredths
 * @param amount money amount
 */
function getMoneyFormatString(amount: number) {
  var absAmount = Math.abs(amount);
  var returnString = nearestHundredth(absAmount).toString();
  const h = Math.round(absAmount * 100);
  if (isNaN(absAmount)) {
    return '$0';
  }
  if (h % 100 != 0) {
    if (h % 10 == 0) {
      returnString += '0';
    }
  }
  return amount < 0 ? Minus + '$' + returnString : '$' + returnString;
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
  if (obj == null) {
    return {};
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Computes distance between point p0 to line defined by p1 and p2
 * @param p0
 * @param p1
 * @param p2
 */
function pointToLineDistance(p0: Point, p1: Point, p2: Point) {
  return (
    Math.abs(
      (p2.y - p1.y) * p0.x - (p2.x - p1.x) * p0.y + p2.x * p1.y - p2.y * p1.x,
    ) / Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2))
  );
}

/**
 * Computes distance between points p0 and p1
 * @param p0
 * @param p1
 */
function pointDistance(p0: Point, p1: Point) {
  return Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
}

/**
 * Computes the midpoint of two points
 * @param p0
 * @param p1
 */
function midpoint(p0: Point, p1: Point) {
  return new Point((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
}

class TextLine {
  text: string;
  bounds: Bounds;

  constructor(text: string, bounds: Bounds) {
    this.text = text;
    this.bounds = bounds;
  }
}

class Bounds {
  upLeft: Point;
  upRight: Point;
  lowRight: Point;
  lowLeft: Point;
  midLeft: Point;
  midRight: Point;
  midUp: Point;
  midLow: Point;
  center: Point;

  constructor(upLeft: Point, upRight: Point, lowRight: Point, lowLeft: Point) {
    this.upLeft = upLeft;
    this.upRight = upRight;
    this.lowRight = lowRight;
    this.lowLeft = lowLeft;
    this.midLeft = midpoint(upLeft, lowLeft);
    this.midRight = midpoint(upRight, lowRight);
    this.midUp = midpoint(upLeft, upRight);
    this.midLow = midpoint(lowLeft, lowRight);
    this.center = midpoint(this.midLeft, this.midRight);
  }
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class TextRef {
  x: number;
  text: string;

  constructor(x: number, text: string) {
    this.x = x;
    this.text = text;
  }
}

function getItemFromTextLine(textLine: TextLine, ref1: Point, ref2: Point) {
  let reversedString = [...textLine.text].reverse();
  var sawDecimal = false;
  var sawOnes = false;
  var sawCents = false;
  var numCents = 0;
  var done = false;
  var priceConstruct = '';
  var k = 0;
  //if not same column probably not item
  if (ref1 != null) {
    //height of line
    let threshold =
      3 * pointDistance(textLine.bounds.midUp, textLine.bounds.midLow);
    if (ref2 != null) {
      if (
        pointToLineDistance(textLine.bounds.midRight, ref1, ref2) > threshold
      ) {
        return null;
      }
    } else {
      if (Math.abs(ref1.x - textLine.bounds.midRight.x) > threshold) {
        return null;
      }
    }
  }
  while (k < reversedString.length) {
    k += 1;
    let curChar = reversedString[k - 1];
    if ((k > 8 && !sawDecimal) || numCents > 2) {
      //if we haven't seen a decimal point by now, probably not an item
      return null;
    } else {
      if (sawCents) {
        if (sawDecimal) {
          if (sawOnes) {
            //continue adding until non-numeral
            if (!isNaN(parseInt(curChar))) {
              priceConstruct = curChar + priceConstruct;
            } else {
              done = true;
              break;
            }
          } else {
            //look for ones, disregard spaces/decimals, return null on else
            if (!isNaN(parseInt(curChar))) {
              priceConstruct = curChar + priceConstruct;
              sawOnes = true;
              if (ref1 == null) {
                ref1 = textLine.bounds.midRight;
              } else {
                ref2 = textLine.bounds.midRight;
              }
            } else if (curChar != ' ' && curChar != '.') {
              return null;
            }
          }
        } else {
          //look for more cents or decimal, return null on else if not space
          if (!isNaN(parseInt(curChar))) {
            priceConstruct = curChar + priceConstruct;
            numCents += 1;
          } else if (curChar === '.' || curChar === ',') {
            priceConstruct = '.' + priceConstruct;
            sawDecimal = true;
          } else if (curChar !== ' ') {
            return null;
          }
        }
      } else {
        //look for cents, discard non-numerals
        if (!isNaN(parseInt(curChar))) {
          priceConstruct = curChar + priceConstruct;
          numCents += 1;
          sawCents = true;
        }
      }
    }
  }
  if (!done) {
    return null;
  }
  let name = reversedString
    .reverse()
    .slice(0, -k + 1)
    .join('')
    .replace(/[0-9\$\.]/g, '')
    .trim();
  return {
    itemName: name,
    itemCost: priceConstruct,
    newRef1: ref1,
    newRef2: ref2,
  };
}

function warnLog(message: any) {
  console.warn(message);
  Bugfender.w(Key.Warn, message);
}

function errorLog(message: any) {
  console.error(message);
  Bugfender.e(Key.Error, message);
}
