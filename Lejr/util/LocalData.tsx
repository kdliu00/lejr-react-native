import {User, Group, InviteInfo, GroupInfo, Item} from './DataObjects';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collection, ErrorCode, ItemsKey} from './Constants';
import {Alert} from 'react-native';
import Contribution from '../screens/dashboard/Contribution/Contribution';

export {
  LocalData,
  getKeyForCurrentGroupItems,
  signOut,
  pushUserData,
  pushGroupData,
  safeGetListData,
  isPossibleObjectEmpty,
  loadGroupAsMain,
  pushInvite,
  joinGroup,
};

class LocalData {
  static user: User = null;
  static currentGroup: Group = null;
  static items: Item[] = null;
  static container: Contribution = null;
}

function getKeyForCurrentGroupItems() {
  return (
    ItemsKey + (LocalData.currentGroup ? LocalData.currentGroup.groupId : null)
  );
}

function signOut() {
  auth()
    .signOut()
    .then(() => {
      console.log('User signed out');
      LocalData.user = null;
      LocalData.currentGroup = null;
    });
}

async function loadGroupAsMain(groupId: string) {
  return firestore()
    .collection(Collection.Groups)
    .doc(groupId)
    .get()
    .then(doc => {
      if (doc.exists) {
        console.log('Group document found');
        LocalData.currentGroup = Group.firestoreConverter.fromFirestore(doc);
      } else {
        throw new Error(ErrorCode.InvalidId);
      }
    });
}

/**
 * Empty arrays on firestore are retrieved as empty objects.
 * This returns an empty array if data was an empty object.
 * @param data the list of data to retrieve
 */
function safeGetListData(data: any): Array<any> {
  return isPossibleObjectEmpty(data) ? [] : data;
}

function isPossibleObjectEmpty(data: any) {
  return Object.keys(data).length === 0;
}

async function pushInvite(fromName: string, email: string) {
  var newInviteInfo = new InviteInfo(
    fromName,
    LocalData.currentGroup.groupId,
    LocalData.currentGroup.groupName,
  );
  return firestore()
    .collection(Collection.Users)
    .where('email', '==', email)
    .get()
    .then(query => {
      if (query.size == 1) {
        //Retrieve user object
        var userObject: User = User.firestoreConverter.fromFirestore(
          query.docs[0],
        );

        //Check if user is already in group
        safeGetListData(userObject.groups).forEach(groupInfo => {
          if (groupInfo.groupId === newInviteInfo.groupId) {
            throw new Error(ErrorCode.UserDuplicate);
          }
        });

        //Add invite
        var recipientInvites = userObject.invites;
        if (Object.keys(recipientInvites).length === 0) {
          recipientInvites = [newInviteInfo];
        } else {
          recipientInvites.push(newInviteInfo);
        }
        firestore()
          .collection(Collection.Users)
          .doc(userObject.userId)
          .update({invites: recipientInvites});
      } else if (query.size == 0) {
        console.warn('Could not find user with email: ' + email);
        throw new Error(ErrorCode.UserNotFound);
      } else {
        console.error(
          'There should not be multiple users with the same email!',
        );
        throw new Error(ErrorCode.UserDuplicate);
      }
    });
}

/**
 * This does not push data to firestore and does not catch errors.
 * @param groupId
 */
async function joinGroup(groupId: string) {
  console.log('Attempting to join group');
  return firestore()
    .collection(Collection.Groups)
    .doc(groupId)
    .get()
    .then(doc => {
      if (doc.exists) {
        //Retrieve the group object
        var groupToJoin: Group = Group.firestoreConverter.fromFirestore(doc);

        //Create new group info entry to add to user object
        var newGroupInfo: GroupInfo = new GroupInfo(
          groupToJoin.groupId,
          groupToJoin.groupName,
        );
        if (isPossibleObjectEmpty(LocalData.user.groups)) {
          LocalData.user.groups = [newGroupInfo];
        } else {
          LocalData.user.groups.push(newGroupInfo);
        }

        //Create new mapping in group members
        groupToJoin.members[LocalData.user.userId] = 0.0;
        groupToJoin.memberNames[LocalData.user.userId] = LocalData.user.name;
        firestore()
          .collection(Collection.Groups)
          .doc(groupId)
          .update({
            members: groupToJoin.members,
            memberNames: groupToJoin.memberNames,
          })
          .then(
            () => console.log('Successfully updated group'),
            error => console.warn(error.message),
          );
      } else {
        Alert.alert('Group Error', 'This group no longer exists.');
        throw new Error(ErrorCode.DoesNotExist);
      }
    });
}

function pushUserData() {
  if (LocalData.user)
    firestore()
      .collection(Collection.Users)
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
  if (LocalData.currentGroup && LocalData.user)
    firestore()
      .collection(Collection.Groups)
      .doc(LocalData.currentGroup.groupId)
      .set(Group.firestoreConverter.toFirestore(LocalData.currentGroup))
      .then(
        () => console.log('Successfully pushed group data'),
        error => {
          console.warn('Push group data failed: ' + error.message);
          Alert.alert(
            'Database Error',
            'We were not able to save your group data. Please reload the app and try again.',
          );
        },
      );
}
