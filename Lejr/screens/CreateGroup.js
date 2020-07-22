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

export default function CreateGroup({navigation}) {
  console.log('Arrived at CreateGroup');

  const [IsCreating, SetIsCreating] = React.useState(false);

  const [GroupName, SetGroupName] = React.useState('');
  const [GroupNameError, SetGroupNameError] = React.useState('');
  const GroupNameRef = React.useRef();

  const ValidationSchema = yup.object().shape({
    groupName: yup
      .string()
      .label('Group name')
      .required(),
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Layout style={Styles.container}>
        <Layout style={Styles.textContainer}>
          <Layout style={Styles.textSubContainer}>
            <Text style={Styles.text} category="h6">
              It looks like you're not in a group yet!
            </Text>
            <Text style={Styles.text}>
              Sign in with the same email you were invited with to join a group.
            </Text>
          </Layout>
        </Layout>
        <Layout style={Styles.buttonContainer}>
          <InputField
            fieldError={GroupNameError}
            refToPass={GroupNameRef}
            validationSchema={ValidationSchema}
            fieldKey="groupName"
            fieldParams={text => ({groupName: text})}
            setField={SetGroupName}
            setFieldError={SetGroupNameError}
            placeholder="group name"
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            value={GroupName}
          />
          <Layout style={FormStyles.dynamicButton}>
            {IsCreating ? (
              <Button
                style={FormStyles.button}
                accessoryLeft={ButtonSpinner}
                appearance="ghost"
              />
            ) : (
              <Button
                onPress={() => {
                  SetIsCreating(true);
                  ValidationSchema.validate({groupName: GroupName})
                    .catch(error =>
                      onValidationError(error, [[GroupNameRef, GroupName]]),
                    )
                    .then(valid => {
                      if (valid) {
                        Promise.all(CreateNewGroup(GroupName)).then(
                          () => {
                            console.log('Succesfully created group');
                            navigation.navigate(Screen.Dashboard);
                          },
                          error =>
                            console.warn(
                              'Group creation failed: ' + error.message,
                            ),
                        );
                      }
                    })
                    .finally(() => {
                      SetIsCreating(false);
                    });
                }}>
                Create group
              </Button>
            )}
          </Layout>
          <Button
            style={Styles.button}
            appearance="outline"
            disabled={IsCreating}
            onPress={() => signOut()}>
            Sign out
          </Button>
        </Layout>
      </Layout>
    </TouchableWithoutFeedback>
  );
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
    alignItems: 'flex-start',
  },
  textSubContainer: {
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
