import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Spinner} from '@ui-kitten/components';
import firestore from '@react-native-firebase/firestore';
import UserData from '../util/LocalData';
import {User} from '../util/DataObjects';
import {defaultProfilePic} from '../util/Constants';

export default function Loading({navigation}) {
  console.log('Arrived at Loading!');

  auth().onAuthStateChanged(user => {
    if (user) {
      firestore()
        .collection('users')
        .doc(user.uid)
        .get()
        .then(doc => {
          if (doc.exists) {
            console.log('User document found!');
            UserData.userObject = User.firestoreConverter.fromFirestore(doc);
            checkGroups(navigation);
          } else {
            console.log('No document for user, creating new one!');
            if (UserData.userObject == null) {
              console.log('Creating new user object from auth!');
              UserData.userObject = new User(
                user.uid,
                user.email,
                user.photoURL,
                user.displayName,
                new Map(),
              );
            }
            UserData.userObject.userId = user.uid;
            console.log(UserData.userObject.userId);
            UserData.userObject.profilePic = defaultProfilePic;
            firestore()
              .collection('users')
              .doc(user.uid)
              .set(User.firestoreConverter.toFirestore(UserData.userObject))
              .catch(error => console.warn(error.message))
              .then(() => checkGroups(navigation));
          }
        })
        .catch(error => {
          console.warn(error.message);
        });
    } else {
      navigation.navigate('Login');
    }
  });

  return (
    <Layout style={Styles.container}>
      <Spinner size="large" />
    </Layout>
  );
}

function checkGroups(navigation) {
  if (Object.keys(UserData.userObject.groupBalances).length === 0) {
    navigation.navigate('JoinGroup');
  } else {
    navigation.navigate('Dashboard');
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
