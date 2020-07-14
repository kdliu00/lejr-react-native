import React from 'react';
import {TouchableWithoutFeedback, StyleSheet, Keyboard} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Text, Button, Spinner} from '@ui-kitten/components';
import firestore from '@react-native-firebase/firestore';
import {LocalData, PushGroupData, PushUserData} from '../util/LocalData';
import {Collections, Screens} from '../util/Constants';
import {Group} from '../util/DataObjects';
import * as yup from 'yup';
import {onValidationError, InputField} from '../util/TextInputUI';

export default function SelectGroup({navigation}) {
  console.log('Arrived at JoinGroup!');

  const [IsCreating, SetIsCreating] = React.useState(false);

  const [GroupName, SetGroupName] = React.useState('');
  const [GroupNameError, SetGroupNameError] = React.useState('');
  const GroupNameRef = React.createRef();

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
            placeholder="Group name"
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
            value={GroupName}
          />
          {IsCreating ? (
            <Spinner size="small" />
          ) : (
            <Button
              onPress={() => {
                SetIsCreating(true);
                ValidationSchema.validate({groupName: GroupName}).catch(
                  validationError =>
                    onValidationError(validationError, [
                      [GroupNameRef, GroupName],
                    ]).then(valid => {
                      if (valid) {
                        Promise.all(CreateGroup(GroupName))
                          .catch(error => console.warn(error.message))
                          .then(
                            () => {
                              console.log('Succesfully created group!');
                              navigation.navigate(Screens.Dashboard);
                            },
                            () => console.log('Group creation failed!'),
                          )
                          .finally(() => {
                            SetIsCreating(false);
                          });
                      }
                    }),
                );
              }}>
              Create group
            </Button>
          )}
          <Button
            style={Styles.button}
            appearance="outline"
            disabled={IsCreating}
            onPress={() => {
              auth()
                .signOut()
                .then(() => {
                  console.log('User signed out!');
                  LocalData.userObject = null;
                });
            }}>
            Sign out
          </Button>
        </Layout>
      </Layout>
    </TouchableWithoutFeedback>
  );
}

async function CreateGroup(groupName) {
  var newGroupId = firestore()
    .collection(Collections.Groups)
    .doc().id;

  var newGroupObject = new Group(newGroupId, groupName, Map(), [], []);
  newGroupObject.members[LocalData.userObject.userId] = 0.0;

  LocalData.groupObject = newGroupObject;
  return [PushGroupData(), PushUserData()];
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
