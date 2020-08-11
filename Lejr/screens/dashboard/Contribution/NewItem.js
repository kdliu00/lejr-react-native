import React, {Component} from 'react';
import {StyleSheet, Keyboard, SafeAreaView} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {InputField} from '../../../util/TextInputUI';
import FormStyles from '../../../util/FormStyles';
import {Screen} from '../../../util/Constants';
import {Item} from '../../../util/DataObjects';
import * as yup from 'yup';
import {MergeState} from '../../../util/UtilityMethods';
import {ThemedSlider} from '../../../util/ThemedComponents';

export default class NewItem extends Component {
  constructor(props) {
    super(props);
    const PassedItem = this.props.route.params.item;
    this.state = {
      itemCost: PassedItem.itemCost,
      itemCostError: '',
      itemName: PassedItem.itemName,
      itemNameError: '',
      itemSplit: PassedItem.itemSplit,
      itemSplitError: '',
      keyboard: false,
    };
    this.itemNameRef = React.createRef();
    this.itemCostRef = React.createRef();
    this.validationSchema = yup.object().shape({
      itemCost: yup
        .string()
        .label('Item Cost')
        .required(),
      itemName: yup
        .string()
        .label('Item Name')
        .required(),
    });
    this.keyboardOpen = this.keyboardOpen.bind(this);
    this.keyboardClosed = this.keyboardClosed.bind(this);
  }

  componentDidMount() {
    console.log('Arrived at NewItem!');
    this.keyboardOpenListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardOpen,
    );
    this.keyboardClosedListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardClosed,
    );
  }

  componentWillUnmount() {
    this.keyboardOpenListener.remove();
    this.keyboardClosedListener.remove();
  }

  keyboardOpen() {
    MergeState(this, {keyboard: true});
  }

  keyboardClosed() {
    MergeState(this, {keyboard: false});
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <SafeAreaView style={Styles.container}>
            <Layout style={FormStyles.loginButtons}>
              <Button
                style={FormStyles.button}
                onPress={() =>
                  this.props.navigation.navigate(Screen.Contribution)
                }
                appearance="outline">
                Go back
              </Button>
            </Layout>
            <Layout style={FormStyles.loginFields}>
              {!this.state.keyboard && (
                <ThemedSlider
                  style={Styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                />
              )}
              <InputField
                fieldError={this.state.itemCostError}
                refToPass={this.itemCostRef}
                validationSchema={this.validationSchema}
                fieldKey="itemCost"
                fieldParams={text => ({itemCost: text})}
                setField={value => MergeState(this, {itemCost: value})}
                setFieldError={value =>
                  MergeState(this, {itemCostError: value})
                }
                placeholder="cost"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.itemCost}
              />
              <InputField
                fieldError={this.state.itemNameError}
                refToPass={this.itemNameRef}
                validationSchema={this.validationSchema}
                fieldKey="itemName"
                fieldParams={text => ({itemName: text})}
                setField={value => MergeState(this, {itemName: value})}
                setFieldError={value =>
                  MergeState(this, {itemNameError: value})
                }
                placeholder="name"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.itemName}
                autoFocus
              />
            </Layout>
            <Layout style={Styles.titleContainer}>
              <Text style={Styles.titleText} category="h4">
                Item Editor
              </Text>
            </Layout>
          </SafeAreaView>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  titleText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  titleContainer: {
    marginVertical: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: 200,
    height: 60,
  },
});
