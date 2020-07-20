import {User, Group, InviteInfo, GroupInfo} from './DataObjects';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collections} from './Constants';
import {Alert} from 'react-native';
import {StackActions} from '@react-navigation/native';

export {
  LocalData,
  signOut,
  pushUserData,
  pushGroupData,
  isUserGroupsEmpty,
  loadGroupAsMain,
  pushInvite,
  joinGroup,
};

class LocalData {
  static user: User = null;
  static currentGroup: Group = null;
}

function signOut() {
  auth()
    .signOut()
    .then(() => {
      console.log('User signed out');
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
        console.log('Group document found');
        LocalData.currentGroup = Group.firestoreConverter.fromFirestore(doc);
      } else {
        throw new Error('Invalid group id!');
      }
    });
}

function isUserGroupsEmpty() {
  return Object.keys(LocalData.user.groups).length === 0;
}

async function pushInvite(fromName: string, email: string) {
  var newInviteInfo = new InviteInfo(
    fromName,
    LocalData.currentGroup.groupId,
    LocalData.currentGroup.groupName,
  );
  return firestore()
    .collection(Collections.Users)
    .where('email', '==', email)
    .get()
    .then(query => {
      if (query.size == 1) {
        var docRef = query.docs[0];
        var recipientInvites = docRef.data().invites;
        if (Object.keys(recipientInvites).length === 0) {
          recipientInvites = [newInviteInfo];
        } else {
          recipientInvites.push(newInviteInfo);
        }
        firestore()
          .collection(Collections.Users)
          .doc(docRef.id)
          .update({invites: recipientInvites});
      } else if (query.size == 0) {
        throw new Error('Could not find user with email: ' + email);
      } else {
        console.error(
          'There should not be multiple users with the same email!',
        );
        throw new Error('One account per email violation!');
      }
    });
}

/**
 * This does not call pushUserData()
 * @param groupId
 */
function joinGroup(groupId: string) {
  firestore()
    .collection(Collections.Groups)
    .doc(groupId)
    .get()
    .then(doc => {
      if (doc.exists) {
        var groupToJoin: Group = Group.firestoreConverter.fromFirestore(doc);
        var newGroupInfo: GroupInfo = new GroupInfo(
          groupToJoin.groupId,
          groupToJoin.groupName,
        );
        if (isUserGroupsEmpty()) {
          LocalData.user.groups = [newGroupInfo];
        } else {
          LocalData.user.groups.push(newGroupInfo);
        }
      } else {
        Alert.alert('Group Error', 'This group no longer exists.');
      }
    })
    .catch(error => console.warn(error.message));
}

function pushUserData() {
  if (LocalData.user)
    firestore()
      .collection(Collections.Users)
      .doc(LocalData.user.userId)
      .set(User.firestoreConverter.toFirestore(LocalData.user))
      .then(
        () => console.log('Successfully pushed user data'),
        error => {
          console.warn('Push user data failed: ' + error.message);
          if (error.code != 'firestore/permission-denied') {
            Alert.alert(
              'Database Error',
              'We were not able to save your group data. Please reload the app and try again.',
            );
          }
        },
      );
}

function pushGroupData() {
  if (LocalData.currentGroup)
    firestore()
      .collection(Collections.Groups)
      .doc(LocalData.currentGroup.groupId)
      .set(Group.firestoreConverter.toFirestore(LocalData.currentGroup))
      .then(
        () => console.log('Successfully pushed group data'),
        error => {
          console.warn('Push group data failed: ' + error.message);
          if (error.code != 'firestore/permission-denied') {
            Alert.alert(
              'Database Error',
              'We were not able to save your group data. Please reload the app and try again.',
            );
          }
        },
      );
}
