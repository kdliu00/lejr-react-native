import React from 'react';
import {TouchableWithoutFeedback, StyleSheet, Keyboard} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import {LocalData, signOut, CreateNewGroup} from '../util/LocalData';
import {AnimKeyboardDuration, Screen} from '../util/Constants';
import * as yup from 'yup';
import {
  ButtonSpinner,
  onValidationError,
  InputField,
} from '../util/TextInputUI';
import FormStyles from '../util/FormStyles';
import {warnLog} from '../util/UtilityMethods';
import {Component} from 'react';
import {SeeInvitations} from '../util/ContributionUI';

export default class CreateGroup extends Component {
  constructor(props) {
    super();
    this.state = {
      isCreating: false,
      groupName: '',
      groupNameError: '',
    };
    this.groupNameRef = React.createRef();
    this.validationSchema = yup.object().shape({
      groupName: yup
        .string()
        .label('Group name')
        .max(18, 'Group name too long')
        .required(),
    });
  }

  componentDidMount() {
    console.log('Arrived at CreateGroup');
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <Layout style={Styles.textContainer}>
            <Text style={Styles.text} category="h6">
              Create a group
            </Text>
            <Text style={[Styles.text, {marginTop: 20}]}>
              Please enter a name for your group.
            </Text>
            <InputField
              fieldError={this.state.groupNameError}
              refToPass={this.groupNameRef}
              validationSchema={this.validationSchema}
              fieldKey="groupName"
              fieldParams={text => ({groupName: text})}
              setField={value => this.setState({groupName: value})}
              setFieldError={value => this.setState({groupNameError: value})}
              placeholder="group name"
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
              value={this.state.groupName}
            />
          </Layout>
          <Layout style={FormStyles.buttonStyle}>
            <Button
              style={FormStyles.button}
              appearance="outline"
              disabled={this.state.isCreating}
              onPress={() => this.props.navigation.goBack()}>
              Cancel
            </Button>
            <Layout>
              {this.state.isCreating ? (
                <Button
                  style={FormStyles.button}
                  accessoryLeft={ButtonSpinner}
                  appearance="ghost"
                />
              ) : (
                <Button
                  style={FormStyles.button}
                  onPress={() => {
                    this.setState({isCreating: true});
                    this.validationSchema
                      .validate({groupName: this.state.groupName})
                      .catch(error =>
                        onValidationError(error, [
                          [this.groupNameRef, this.state.groupName],
                        ]),
                      )
                      .then(valid => {
                        if (valid) {
                          Promise.all(
                            CreateNewGroup(this.state.groupName),
                          ).then(
                            () => {
                              console.log('Successfully created group');
                              setTimeout(
                                () => this.props.navigation.popToTop(),
                                AnimKeyboardDuration,
                              );
                            },
                            error => {
                              warnLog(
                                'Group creation failed: ' + error.message,
                              );
                              this.setState({isCreating: false});
                            },
                          );
                        } else {
                          this.setState({isCreating: false});
                        }
                      });
                  }}>
                  Create
                </Button>
              )}
            </Layout>
          </Layout>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  text: {
    textAlign: 'center',
  },
});
