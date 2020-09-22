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
} from '../util/LocalData';
import {User} from '../util/DataObjects';
import {
  defaultProfilePic,
  Collection,
  Screen,
  AnimDefaultDuration,
  Key,
} from '../util/Constants';
import {Component} from 'react';
import {RetrieveData, StoreData} from '../util/UtilityMethods';

export default class Loading extends Component {
  constructor() {
    super();
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
        .then(doc => {
          if (doc.exists) {
            console.log('User document found');
            LocalData.user = User.firestoreConverter.fromFirestore(doc);
            LocalData.userCopy = JSON.parse(JSON.stringify(LocalData.user));
            handleScreen(this.props.navigation);
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
                  handleScreen(this.props.navigation);
                },
                error => console.warn(error.message),
              );
          }
        })
        .catch(error => {
          console.warn(error.message);
        });
    } else if (user && LocalData.user) {
      setTimeout(
        () => handleScreen(this.props.navigation),
        AnimDefaultDuration,
      );
    } else {
      StoreData(getKeyForCurrentGroupItems(), null);
      StoreData(Key.CurrentGroup, null);
      deleteAllItems(false);
      this.props.navigation.navigate(Screen.Login);
    }
  }

  componentDidMount() {
    console.log('Arrived at Loading');
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

function handleScreen(navigation) {
  if (isPossibleObjectEmpty(LocalData.user.groups)) {
    navigation.navigate(Screen.CreateGroup);
  } else if (!LocalData.currentGroup) {
    RetrieveData(Key.CurrentGroup).then(value => {
      loadGroupAsMain(
        value == null ? LocalData.user.groups[0].groupId : value,
      ).then(() => navigation.navigate(Screen.Dashboard));
    });
  } else {
    navigation.navigate(Screen.Dashboard);
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
