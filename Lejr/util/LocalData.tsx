import {User, Group} from './DataObjects';
import firestore from '@react-native-firebase/firestore';
import {Collections} from './Constants';

export {LocalData, PushUserData, PushGroupData};

class LocalData {
  static userObject: User = null;
  static groupObject: Group = null;
}

async function PushUserData() {
  return firestore()
    .collection(Collections.Users)
    .doc(LocalData.userObject.userId)
    .set(User.firestoreConverter.toFirestore(LocalData.userObject))
    .catch(error => console.warn(error.message));
}

async function PushGroupData() {
  return firestore()
    .collection(Collections.Groups)
    .doc(LocalData.groupObject.groupId)
    .set(Group.firestoreConverter.toFirestore(LocalData.groupObject))
    .catch(error => console.warn(error.message));
}
