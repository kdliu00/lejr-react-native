import {
  User,
  Group,
  InviteInfo,
  GroupInfo,
  Item,
  VirtualReceipt,
  MemberInfo,
} from './DataObjects';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collection, ErrorCode, Key} from './Constants';
import {Alert} from 'react-native';
import {nearestHundredth, StoreData} from './UtilityMethods';
import Home from '../screens/dashboard/Home/Home';
import Contribution from '../screens/dashboard/Contribution/Contribution';
import Invitations from '../screens/dashboard/Home/Invitations';

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
  getUserInvitations,
  uploadVirtualReceipt,
  loadGroupAsMain,
  getVirtualReceiptsForGroup,
  pushInvite,
  joinGroup,
  detachListeners,
};

class LocalData {
  //user data
  static user: User = null;
  static userCopy: User = null;
  static invitations: InviteInfo[] = null;

  //group and purchase data
  static currentGroup: Group = null;
  static items: Item[] = null;
  static virtualReceipts: VirtualReceipt[] = null;
  static currentVR: VirtualReceipt = null;
  static currentVRCopy: VirtualReceipt = null;

  //screen references
  static container: Contribution = null;
  static home: Home = null;
  static invScreen: Invitations = null;
  static invShouldUpdate: boolean = true;

  //firestore listeners
  static groupListener = null;
  static vrListener = null;
  static invListener = null;

  //camera stuff
  static isCamera: boolean = false;
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

function getUserInvitations(userId: string) {
  console.log('Retrieving invitations for user: ' + userId);
  if (LocalData.invListener != null) {
    LocalData.invListener();
  }
  LocalData.invListener = firestore()
    .collection(Collection.Users)
    .doc(userId)
    .collection(Key.Invitations)
    .onSnapshot(
      querySnapshot => {
        LocalData.invitations = [];
        querySnapshot.forEach(doc => {
          LocalData.invitations.push(
            InviteInfo.firestoreConverter.fromFirestore(doc),
          );
        });
        console.log('User invitations updated');
        if (
          LocalData.invScreen != null &&
          LocalData.invScreen._mounted &&
          LocalData.invShouldUpdate
        ) {
          LocalData.invScreen.forceUpdate();
        } else {
          LocalData.invShouldUpdate = true;
        }
      },
      error => {
        console.error(error);
        throw new Error(ErrorCode.DatabaseError);
      },
    );
}

function uploadVirtualReceipt(
  vr: VirtualReceipt,
  callback: () => void,
  errorCallback: (error: any) => void,
) {
  console.log('Uploading virtual receipt');

  let isOld = Boolean(vr.virtualReceiptId);
  let docId = isOld
    ? vr.virtualReceiptId
    : firestore()
        .collection(Collection.Groups)
        .doc().id;

  vr.virtualReceiptId = docId;

  let groupRef = firestore()
    .collection(Collection.Groups)
    .doc(LocalData.currentGroup.groupId);

  groupRef
    .collection(Key.VirtualReceipts)
    .doc(docId)
    .set(VirtualReceipt.firestoreConverter.toFirestore(vr))
    .then(
      async () => {
        console.log('Updating group balances');
        await firestore()
          .runTransaction(async transaction => {
            const groupDoc = await transaction.get(groupRef);
            if (!groupDoc.exists) {
              throw new Error(ErrorCode.DoesNotExist);
            }

            //get group data
            let groupData = Group.firestoreConverter.fromFirestore(groupDoc);
            Object.keys(groupData.members).forEach(userId => {
              //calculate split value from percent and total
              let dBalance = -getSplitValue(userId, vr);

              //determine the change in balance
              if (vr.buyerId == userId) {
                dBalance += nearestHundredth(vr.total);
                if (isOld) {
                  dBalance -=
                    -getSplitValue(userId, LocalData.currentVRCopy) +
                    nearestHundredth(LocalData.currentVRCopy.total);
                }
              } else if (isOld) {
                dBalance -= -getSplitValue(userId, LocalData.currentVRCopy);
              }

              groupData.members[userId].balance += dBalance;
            });
            transaction.update(
              groupRef,
              Group.firestoreConverter.toFirestore(groupData),
            );
            console.log('Transaction end');
          })
          .then(
            () => {
              console.log('Update group balances complete');
              callback();
            },
            error => {
              console.error('Update group balances failed: ' + error.message);
              Alert.alert(
                'Database Error',
                'We were not able to update your group balances. Please reload the app and try again.',
              );
              errorCallback(error);
            },
          );
      },
      error => {
        console.error('Virtual receipt upload failed: ' + error.message);
        Alert.alert(
          'Database Error',
          'We were not able to upload your purchase. Please reload the app and try again.',
        );
        errorCallback(error);
      },
    );
}

function getSplitValue(userId: string, vr: VirtualReceipt) {
  return nearestHundredth((vr.total * vr.totalSplit[userId]) / 100);
}

function loadGroupAsMain(groupId: string, callback: () => void) {
  console.log('Loading group: ' + groupId);
  if (LocalData.groupListener != null) {
    LocalData.groupListener();
  }
  LocalData.groupListener = firestore()
    .collection(Collection.Groups)
    .doc(groupId)
    .onSnapshot(
      doc => {
        if (doc.exists) {
          console.log('Group document updated');
          LocalData.currentGroup = Group.firestoreConverter.fromFirestore(doc);
          getVirtualReceiptsForGroup(groupId, callback);
        } else {
          throw new Error(ErrorCode.InvalidId);
        }
      },
      error => {
        console.error(error);
        throw new Error(ErrorCode.DatabaseError);
      },
    );
}

function getVirtualReceiptsForGroup(groupId: string, callback: () => void) {
  console.log('Retrieving virtual receipts for group: ' + groupId);
  if (LocalData.vrListener != null) {
    LocalData.vrListener();
  }
  LocalData.vrListener = firestore()
    .collection(Collection.Groups)
    .doc(groupId)
    .collection(Key.VirtualReceipts)
    .orderBy(Key.Timestamp, 'desc')
    .limit(20)
    .onSnapshot(
      querySnapshot => {
        LocalData.virtualReceipts = [];
        querySnapshot.forEach(doc => {
          LocalData.virtualReceipts.push(
            VirtualReceipt.firestoreConverter.fromFirestore(doc),
          );
        });
        console.log('Virtual receipts updated');
        if (LocalData.home != null) {
          console.log('Updating home screen');
          if (LocalData.home != null && LocalData.home._mounted) {
            LocalData.home.forceUpdate();
            LocalData.home.balanceRef.current.forceUpdate();
          }
        }
        callback();
      },
      error => {
        console.error(error);
        throw new Error(ErrorCode.DatabaseError);
      },
    );
}

function detachListeners() {
  console.log('Detaching firestore listeners');
  if (LocalData.groupListener != null) {
    LocalData.groupListener();
  }
  if (LocalData.vrListener != null) {
    LocalData.vrListener();
  }
  if (LocalData.invListener != null) {
    LocalData.invListener();
  }
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

async function pushInvite(
  fromName: string,
  email: string,
  callback: () => void,
) {
  console.log('Sending invite for user email: ' + email);
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
        var userObj = User.firestoreConverter.fromFirestore(query.docs[0]);

        //Check if user is already in group
        safeGetListData(userObj.groups).forEach(groupInfo => {
          if (groupInfo.groupId === newInviteInfo.groupId) {
            throw new Error(ErrorCode.UserDuplicate);
          }
        });

        //Add invite
        firestore()
          .collection(Collection.Users)
          .doc(userObj.userId)
          .collection(Key.Invitations)
          .doc(newInviteInfo.groupId)
          .set(InviteInfo.firestoreConverter.toFirestore(newInviteInfo))
          .then(
            () => callback(),
            error => {
              console.error(error);
              throw new Error(ErrorCode.DatabaseError);
            },
          );
      } else if (query.size == 0) {
        throw new Error(ErrorCode.UserNotFound);
      } else {
        console.error(
          'There should not be multiple users with the same email!',
        );
        throw new Error(ErrorCode.DatabaseError);
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
        groupToJoin.members[LocalData.user.userId] = new MemberInfo(
          0,
          LocalData.user.name,
        );
        firestore()
          .collection(Collection.Groups)
          .doc(groupId)
          .update({
            members: groupToJoin.members,
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
