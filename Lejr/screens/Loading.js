import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Spinner} from '@ui-kitten/components';
import {StackActions} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {
  LocalData,
  isPossibleObjectEmpty,
  loadGroupAsMain,
  getKeyForCurrentGroupItems,
  deleteAllItems,
  getUserInvitations,
} from '../util/LocalData';
import {User} from '../util/DataObjects';
import {
  defaultProfilePic,
  Collection,
  Screen,
  AnimDefaultDuration,
  Key,
  ErrorCode,
} from '../util/Constants';
import {Component} from 'react';
import {JSONCopy, RetrieveData, StoreData} from '../util/UtilityMethods';

export default class Loading extends Component {
  constructor() {
    super();
  }

  handleScreen() {
    getUserInvitations(LocalData.user.userId, () =>
      console.log('Attached invitation listener'),
    );
    LocalData.container = null;
    if (isPossibleObjectEmpty(LocalData.user.groups)) {
      this.props.navigation.navigate(Screen.CreateGroup, {welcome: true});
    } else if (!LocalData.currentGroup) {
      RetrieveData(Key.CurrentGroup).then(value => {
        loadGroupAsMain(
          value == null ? LocalData.user.groups[0].groupId : value,
          () => this.props.navigation.navigate(Screen.Dashboard),
          false,
        );
      });
    } else {
      this.props.navigation.navigate(Screen.Dashboard);
    }
  }

  handleUserState(user) {
    if (
      user &&
      (!LocalData.user || !(LocalData.user ? LocalData.user.userId : null))
    ) {
      firestore()
        .collection(Collection.Users)
        .doc(user.uid)
        .get()
        .then(
          doc => {
            if (doc.exists) {
              console.log('User document found');
              LocalData.user = User.firestoreConverter.fromFirestore(doc);
              LocalData.userCopy = JSONCopy(LocalData.user);
              this.handleScreen();
            } else {
              console.log('No document for user, creating new one');
              if (LocalData.user == null) {
                console.log('Creating new user object from auth');
                LocalData.user = new User(
                  user.uid,
                  user.email,
                  user.photoURL,
                  user.displayName,
                  [],
                );
              }
              LocalData.user.userId = user.uid;
              if (!user.photoURL) {
                LocalData.user.profilePic = defaultProfilePic;
              }
              firestore()
                .collection(Collection.Users)
                .doc(user.uid)
                .set(User.firestoreConverter.toFirestore(LocalData.user))
                .then(
                  () => {
                    console.log('Successfully created new user document');
                    this.handleScreen();
                  },
                  error => console.warn(error.message),
                );
            }
          },
          error => {
            console.error(error);
            throw new Error(ErrorCode.DatabaseError);
          },
        );
    } else if (user && LocalData.user) {
      setTimeout(() => this.handleScreen(), AnimDefaultDuration);
    } else {
      StoreData(getKeyForCurrentGroupItems(), null);
      StoreData(Key.CurrentGroup, null);
      deleteAllItems(false);
      this.props.navigation.navigate(Screen.Login);
    }
  }

  componentDidMount() {
    auth().onAuthStateChanged(() => {
      //Go back to this screen, invokes onFocus() listener
      if (this.props.navigation.canGoBack()) {
        console.log('Return to Loading');
        this.props.navigation.dispatch(StackActions.popToTop());
      }
    });

    //onFocus() listener
    this.props.navigation.addListener('focus', () => {
      console.log('Arrived at Loading');
      this.handleUserState(auth().currentUser);
    });
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <Spinner size="large" />
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
