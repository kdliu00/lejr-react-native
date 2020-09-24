import {
  User,
  Group,
  InviteInfo,
  GroupInfo,
  Item,
  VirtualReceipt,
} from './DataObjects';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collection, ErrorCode, Key} from './Constants';
import {Alert} from 'react-native';
import Contribution from '../screens/dashboard/Contribution/Contribution';
import {removeNullsFromList, StoreData} from './UtilityMethods';
import Home from '../screens/dashboard/Home/Home';

export {
  LocalData,
  deleteAllItems,
  filterItemCosts,
  getKeyForCurrentGroupItems,
  signOut,
  pushUserData,
  pushGroupData,
  safeGetListData,
  isPossibleObjectEmpty,
  uploadVirtualReceipt,
  loadGroupAsMain,
  getVirtualReceiptsForGroup,
  pushInvite,
  joinGroup,
};

class LocalData {
  static user: User = null;
  static currentGroup: Group = null;
  static items: Item[] = null;
  static container: Contribution = null;
  static userCopy: User = null;
  static virtualReceipts: VirtualReceipt[] = null;
  static currentVR: VirtualReceipt = null;
  static home: Home = null;
}

function deleteAllItems(forceUpdate: boolean = true) {
  console.log('Deleting all items');
  LocalData.currentVR = null;
  LocalData.items = [];
  StoreData(getKeyForCurrentGroupItems(), LocalData.items);
  if (forceUpdate && LocalData.container != null) {
    LocalData.container.forceUpdate();
  }
}

function filterItemCosts() {
  return LocalData.items.map(item => {
    return item ? item.itemCost : 0;
  });
}

function getKeyForCurrentGroupItems() {
  return LocalData.currentGroup
    ? Key.Items + LocalData.currentGroup.groupId
    : null;
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

async function uploadVirtualReceipt(vr: VirtualReceipt) {
  var docId = vr.virtualReceiptId
    ? vr.virtualReceiptId
    : firestore()
        .collection(Collection.Groups)
        .doc().id;

  vr.virtualReceiptId = docId;

  return firestore()
    .collection(Collection.Groups)
    .doc(LocalData.currentGroup.groupId)
    .collection(Key.VirtualReceipts)
    .doc(docId)
    .set(VirtualReceipt.firestoreConverter.toFirestore(vr))
    .then(
      () => console.log('Successfully uploaded virtual receipt'),
      error => {
        console.error('Virtual receipt upload failed: ' + error.message);
        Alert.alert(
          'Database Error',
          'We were not able to upload your purchase. Please reload the app and try again.',
        );
        throw new Error(ErrorCode.DatabaseError);
      },
    );
}

async function loadGroupAsMain(groupId: string) {
  return Promise.all([
    firestore()
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
      }),
    getVirtualReceiptsForGroup(groupId),
  ]);
}

async function getVirtualReceiptsForGroup(groupId: string) {
  console.log('Retrieving virtual receipts for group: ' + groupId);
  return firestore()
    .collection(Collection.Groups)
    .doc(groupId)
    .collection(Key.VirtualReceipts)
    .orderBy(Key.Timestamp, 'desc')
    .limit(20)
    .get()
    .then(querySnapshot => {
      LocalData.virtualReceipts = [];
      querySnapshot.forEach(doc => {
        LocalData.virtualReceipts.push(
          VirtualReceipt.firestoreConverter.fromFirestore(doc),
        );
      });
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
  if (data == null) {
    return true;
  }
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

function getUpdatedKeyValuesOnly(reference: any, compare: any) {
  var updated = {};
  if (reference != null && compare != null) {
    Object.keys(reference).forEach(key => {
      const compareValue = compare[key];
      if (JSON.stringify(reference[key]) != JSON.stringify(compareValue)) {
        updated[key] = compareValue;
      }
    });
  }
  return updated;
}

function pushUserData() {
  const updated = getUpdatedKeyValuesOnly(LocalData.userCopy, LocalData.user);
  if (LocalData.user && !isPossibleObjectEmpty(updated)) {
    firestore()
      .collection(Collection.Users)
      .doc(LocalData.user.userId)
      .set(User.firestoreConverter.toFirestore(LocalData.user))
      .then(
        () => console.log('Successfully pushed user data'),
        error => {
          console.error('Push user data failed: ' + error.message);
          if (error.code != 'firestore/permission-denied') {
            Alert.alert(
              'Database Error',
              'We were not able to save your group data. Please reload the app and try again.',
            );
          }
        },
      );
  } else {
    console.log('No changes in user data, user data not pushed');
  }
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
          console.error('Push group data failed: ' + error.message);
          Alert.alert(
            'Database Error',
            'We were not able to save your group data. Please reload the app and try again.',
          );
        },
      );
}
