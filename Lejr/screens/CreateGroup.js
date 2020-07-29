import React from 'react';
import {TouchableWithoutFeedback, StyleSheet, Keyboard} from 'react-native';
import {Layout, Text, Button} from '@ui-kitten/components';
import firestore from '@react-native-firebase/firestore';
import {
  LocalData,
  signOut,
  pushUserData,
  pushGroupData,
  isPossibleObjectEmpty,
} from '../util/LocalData';
import {Collection, Screen} from '../util/Constants';
import {GroupInfo, Group} from '../util/DataObjects';
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
  constructor() {
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
  }

  componentDidMount() {
    console.log('Arrived at CreateGroup');
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Layout style={Styles.container}>
          <Layout style={Styles.textContainer}>
            <Layout style={Styles.textSubContainer}>
              <Text style={Styles.text} category="h6">
                It looks like you're not in a group yet!
              </Text>
              <Text style={Styles.text}>
                You can create one here or accept an invitation to another
                group.
              </Text>
            </Layout>
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
            <Layout style={FormStyles.dynamicButton}>
              {this.state.isCreating ? (
                <Button
                  style={FormStyles.button}
                  accessoryLeft={ButtonSpinner}
                  appearance="ghost"
                />
              ) : (
                <Button
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
                              this.props.navigation.navigate(Screen.Dashboard);
                            },
                            error =>
                              console.warn(
                                'Group creation failed: ' + error.message,
                              ),
                          );
                        }
                      })
                      .finally(() => {
                        MergeState(this, {isCreating: false});
                      });
                  }}>
                  Create group
                </Button>
              )}
            </Layout>
            <Button
              style={Styles.button}
              appearance="outline"
              disabled={this.state.isCreating}
              onPress={() => signOut()}>
              Sign out
            </Button>
          </Layout>
        </Layout>
      </TouchableWithoutFeedback>
    );
  }
}

async function CreateNewGroup(newGroupName) {
  var newGroupId = firestore()
    .collection(Collection.Groups)
    .doc().id;

  var newGroupObject = new Group(newGroupId, newGroupName, new Map(), [], []);
  newGroupObject.members[LocalData.user.userId] = 0.0;

  LocalData.currentGroup = newGroupObject;

  var newGroupInfo = new GroupInfo(newGroupId, newGroupName);

  if (isPossibleObjectEmpty(LocalData.user.groups)) {
    LocalData.user.groups = [newGroupInfo];
  } else {
    LocalData.user.groups.push(newGroupInfo);
  }

  return [pushUserData(), pushGroupData()];
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
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
    marginTop: 5,
  },
});
