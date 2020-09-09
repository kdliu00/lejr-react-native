import React, {Component} from 'react';
import {
  StyleSheet,
  Keyboard,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {InputField} from '../../../util/TextInputUI';
import FormStyles from '../../../util/FormStyles';
import {Screen} from '../../../util/Constants';
import {Item} from '../../../util/DataObjects';
import * as yup from 'yup';
import {MergeState} from '../../../util/UtilityMethods';
import {SplitSlider} from '../../../util/ComponentUtil';
import {LocalData} from '../../../util/LocalData';

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
    this.keyboardOpen = false;

    this.itemSplitPercent = {};
    this.groupMemberIds = Object.keys(LocalData.currentGroup.members);
  }

  componentDidMount() {
    console.log('Arrived at NewItem!');
    this.keyboardOpenListener = Keyboard.addListener('keyboardDidShow', () => {
      this.keyboardOpen = true;
      this.forceUpdate();
    });
    this.keyboardClosedListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        this.keyboardOpen = false;
        this.forceUpdate();
      },
    );
  }

  componentWillUnmount() {
    this.keyboardOpenListener.remove();
    this.keyboardClosedListener.remove();
  }

  render() {
    this.splitSliders = this.groupMemberIds.map(userId => {
      return (
        <SplitSlider
          sliderContainerStyle={Styles.sliderContainer}
          sliderStyle={Styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={Math.round(100 / this.groupMemberIds.length)}
          step={1}
          userId={userId}
          objectInstance={this}
        />
      );
    });
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <SafeAreaView style={Styles.container}>
            <Layout style={Styles.titleContainer}>
              <Text style={Styles.titleText} category="h4">
                Item Editor
              </Text>
            </Layout>
            <Layout style={(FormStyles.loginFields, Styles.container)}>
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
                placeholder="item"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
                value={this.state.itemName}
              />
            </Layout>
            <ScrollView style={Styles.scrollView}>
              {!this.keyboardOpen && this.splitSliders}
            </ScrollView>
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
          </SafeAreaView>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  sliderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scrollView: {
    margin: 30,
  },
  titleText: {
    marginVertical: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
  },
  slider: {
    width: Dimensions.get('window').width * 0.6,
    height: 40,
  },
});
