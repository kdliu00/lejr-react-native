import {User, Group} from './DataObjects';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collections} from './Constants';

export {LocalData, signOut, pushUserData, pushGroupData, getGroupsLength};

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
