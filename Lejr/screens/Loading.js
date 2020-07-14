import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Spinner} from '@ui-kitten/components';
import firestore from '@react-native-firebase/firestore';
import {LocalData} from '../util/LocalData';
import {User} from '../util/DataObjects';
import {defaultProfilePic, Collections, Screens} from '../util/Constants';

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
            LocalData.userObject = User.firestoreConverter.fromFirestore(doc);
            checkGroups(navigation);
          } else {
            console.log('No document for user, creating new one!');
            if (LocalData.userObject == null) {
              console.log('Creating new user object from auth!');
              LocalData.userObject = new User(
                user.uid,
                user.email,
                user.photoURL,
                user.displayName,
                new Map(),
              );
            }
            LocalData.userObject.userId = user.uid;
            console.log(LocalData.userObject.userId);
            LocalData.userObject.profilePic = defaultProfilePic;
            firestore()
              .collection(Collections.Users)
              .doc(user.uid)
              .set(User.firestoreConverter.toFirestore(LocalData.userObject))
              .catch(error => console.warn(error.message))
              .then(() => checkGroups(navigation));
          }
        })
        .catch(error => {
          console.warn(error.message);
        });
    } else {
      navigation.navigate(Screens.Login);
    }
  });

  return (
    <Layout style={Styles.container}>
      <Spinner size="large" />
    </Layout>
  );
}

function checkGroups(navigation) {
  if (Object.keys(LocalData.userObject.groups).length === 0) {
    navigation.navigate(Screens.SelectGroup);
  } else {
    navigation.navigate(Screens.Dashboard);
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
