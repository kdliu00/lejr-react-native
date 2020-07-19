import {User, Group} from './DataObjects';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collections, Screens} from './Constants';
import {Alert} from 'react-native';

export {
  LocalData,
  signOut,
  pushUserData,
  pushGroupData,
  getGroupsLength,
  loadGroupAsMain,
};

class LocalData {
  static user: User = null;
  static currentGroup: Group = null;
}

function signOut() {
  auth()
    .signOut()
    .then(() => {
      console.log('User signed out!');
      LocalData.user = null;
    });
}

async function loadGroupAsMain(groupId: string) {
  return firestore()
    .collection(Collections.Groups)
    .doc(groupId)
    .get()
    .then(doc => {
      if (doc.exists) {
        console.log('Group document found!');
        LocalData.currentGroup = Group.firestoreConverter.fromFirestore(doc);
      } else {
        throw new Error('Invalid group id!');
      }
    });
}

function getGroupsLength() {
  return LocalData.user.groups.length;
}

function pushUserData() {
  if (LocalData.user)
    firestore()
      .collection(Collections.Users)
      .doc(LocalData.user.userId)
      .set(User.firestoreConverter.toFirestore(LocalData.user))
      .catch(error => {
        console.warn(error.message);
        Alert.alert(
          'Database Error',
          'We were not able to save your user data. Please reload the app and try again.',
        );
      })
      .then(
        () => console.log('Successfully pushed user data!'),
        () => console.log('Push user data failed!'),
      );
}

function pushGroupData() {
  if (LocalData.currentGroup)
    firestore()
      .collection(Collections.Groups)
      .doc(LocalData.currentGroup.groupId)
      .set(Group.firestoreConverter.toFirestore(LocalData.currentGroup))
      .catch(error => {
        console.warn(error.message);
        Alert.alert(
          'Database Error',
          'We were not able to save your group data. Please reload the app and try again.',
        );
      })
      .then(
        () => console.log('Successfully pushed group data!'),
        () => console.log('Push group data failed!'),
      );
}
