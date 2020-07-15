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
  checkGroups,
  pullGroup,
};

class LocalData {
  static user: User = null;
  static currentGroup: Group = null;
  static groupMap: Map<string, string> = null;
}

function signOut() {
  auth()
    .signOut()
    .then(() => {
      console.log('User signed out!');
      LocalData.user = null;
    });
}

function checkGroups(navigation) {
  if (getGroupsLength() === 0) {
    navigation.navigate(Screens.SelectGroup);
  } else {
    var promiseList = [];
    LocalData.groupMap = new Map();
    for (var i = 0; i < LocalData.user.groups.length; i++) {
      promiseList.push(pullGroup(LocalData.user.groups[i], i === 0));
    }
    Promise.all(promiseList)
      .catch(error => {
        console.warn(error.message);
        Alert.alert(
          'Login Error',
          'Unable to fetch user. Please reload the app.',
        );
      })
      .then(() => navigation.navigate(Screens.Dashboard));
  }
}

async function pullGroup(groupId, isMain) {
  return firestore()
    .collection(Collections.Groups)
    .doc(groupId)
    .get()
    .then(doc => {
      if (doc.exists) {
        console.log('Group document found!');
        var groupObject = Group.firestoreConverter.fromFirestore(doc);
        if (isMain) {
          LocalData.currentGroup = groupObject;
        }
        LocalData.groupMap[groupId] = groupObject.groupName;
      } else {
        throw new Error('Invalid group id!');
      }
    });
}

function getGroupsLength() {
  return Object.keys(LocalData.user.groups).length;
}

async function pushUserData() {
  return firestore()
    .collection(Collections.Users)
    .doc(LocalData.user.userId)
    .set(User.firestoreConverter.toFirestore(LocalData.user))
    .catch(error => console.warn(error.message))
    .then(
      () => console.log('Successfully pushed user data!'),
      () => console.log('Push user data failed!'),
    );
}

async function pushGroupData() {
  return firestore()
    .collection(Collections.Groups)
    .doc(LocalData.currentGroup.groupId)
    .set(Group.firestoreConverter.toFirestore(LocalData.currentGroup))
    .catch(error => console.warn(error.message))
    .then(
      () => console.log('Successfully pushed group data!'),
      () => console.log('Push group data failed!'),
    );
}
