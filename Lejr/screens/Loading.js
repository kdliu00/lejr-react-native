import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Spinner} from '@ui-kitten/components';
import firestore from '@react-native-firebase/firestore';
import {LocalData, getGroupsLength, loadGroupAsMain} from '../util/LocalData';
import {User} from '../util/DataObjects';
import {defaultProfilePic, Collections, Screens} from '../util/Constants';
import {StackActions} from '@react-navigation/native';

export default function Loading({navigation}) {
  console.log('Arrived at Loading!');

  auth().onAuthStateChanged(user => {
    if (user) {
      firestore()
        .collection(Collections.Users)
        .doc(user.uid)
        .get()
        .then(doc => {
          if (doc.exists) {
            console.log('User document found!');
            LocalData.user = User.firestoreConverter.fromFirestore(doc);
            if (getGroupsLength() === 0) {
              navigation.navigate(Screens.CreateGroup);
            } else {
              loadGroupAsMain(LocalData.user.groups[0].groupId).then(() =>
                navigation.navigate(Screens.Dashboard),
              );
            }
          } else {
            console.log('No document for user, creating new one!');
            if (LocalData.user == null) {
              console.log('Creating new user object from auth!');
              LocalData.user = new User(
                user.uid,
                user.email,
                user.photoURL,
                user.displayName,
                [],
                new Map(),
              );
            }
            LocalData.user.userId = user.uid;
            if (!user.photoURL) {
              LocalData.user.profilePic = defaultProfilePic;
            }
            firestore()
              .collection(Collections.Users)
              .doc(user.uid)
              .set(User.firestoreConverter.toFirestore(LocalData.user))
              .catch(error => console.warn(error.message))
              .then(() =>
                console.log('Successfully created new user document!'),
              );
          }
        })
        .catch(error => {
          console.warn(error.message);
        });
    } else {
      if (navigation.canGoBack()) {
        navigation.dispatch(StackActions.popToTop());
      }
      navigation.navigate(Screens.Login);
    }
  });

  return (
    <Layout style={Styles.container}>
      <Spinner size="large" />
    </Layout>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
