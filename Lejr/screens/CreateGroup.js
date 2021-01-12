import React from 'react';
import {TouchableWithoutFeedback, StyleSheet, Keyboard} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import {
  LocalData,
  signOut,
  isPossibleObjectEmpty,
  CreateNewGroup,
  swapGroup,
} from '../util/LocalData';
import {AnimKeyboardDuration, Screen} from '../util/Constants';
import * as yup from 'yup';
import {
  ButtonSpinner,
  onValidationError,
  InputField,
} from '../util/TextInputUI';
import FormStyles from '../util/FormStyles';
import {MergeState} from '../util/UtilityMethods';
import {Component} from 'react';

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
        .required(),
    });

    this.welcome = props.route.params ? props.route.params.welcome : false;
  }

  componentDidMount() {
    console.log('Arrived at CreateGroup');
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <Layout style={Styles.textContainer}>
            {LocalData.user.groups.length === 0 ? (
              <Layout>
                <Layout style={Styles.textSubContainer}>
                  <Text style={Styles.text} category="h6">
                    It looks like you're not in a group yet!
                  </Text>
                  <Text style={Styles.text}>
                    You can create a group here by entering a group name and
                    pressing Create. You can also accept an invitation to an
                    existing group.
                  </Text>
                </Layout>
                <Text
                  style={[Styles.text, Styles.boldText]}
                  category="h6"
                  status="primary"
                  onPress={() =>
                    this.props.navigation.navigate(Screen.Invitations)
                  }>
                  See invitations{' '}
                  {'(' +
                    (isPossibleObjectEmpty(LocalData.invitations)
                      ? 0
                      : LocalData.invitations.length) +
                    ')'}
                </Text>
              </Layout>
            ) : (
              <Layout style={Styles.textSubContainer}>
                <Text style={Styles.text} category="h6">
                  Create a group
                </Text>
                <Text style={Styles.text}>
                  You can create a group here by entering a group name and
                  pressing Create.
                </Text>
              </Layout>
            )}
          </Layout>
          <Layout style={Styles.buttonContainer}>
            <InputField
              fieldError={this.state.groupNameError}
              refToPass={this.groupNameRef}
              validationSchema={this.validationSchema}
              fieldKey="groupName"
              fieldParams={text => ({groupName: text})}
              setField={value => MergeState(this, {groupName: value})}
              setFieldError={value => MergeState(this, {groupNameError: value})}
              placeholder="group name"
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
              value={this.state.groupName}
            />
            <Layout style={FormStyles.buttonStyle}>
              {this.welcome ? (
                <Button
                  style={FormStyles.button}
                  appearance="outline"
                  disabled={this.state.isCreating}
                  onPress={() => signOut()}>
                  Sign out
                </Button>
              ) : (
                <Button
                  style={FormStyles.button}
                  appearance="outline"
                  disabled={this.state.isCreating}
                  onPress={() => this.props.navigation.pop()}>
                  Go back
                </Button>
              )}
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
                      MergeState(this, {isCreating: true});
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
                                console.log('Succesfully created group');
                                setTimeout(
                                  () => this.props.navigation.popToTop(),
                                  AnimKeyboardDuration,
                                );
                              },
                              error => {
                                console.warn(
                                  'Group creation failed: ' + error.message,
                                );
                                MergeState(this, {isCreating: false});
                              },
                            );
                          } else {
                            MergeState(this, {isCreating: false});
                          }
                        });
                    }}>
                    Create
                  </Button>
                )}
              </Layout>
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
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 54,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column-reverse',
    alignItems: 'center',
  },
  textSubContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    marginTop: 15,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
