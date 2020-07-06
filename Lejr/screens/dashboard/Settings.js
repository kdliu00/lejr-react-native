import React from 'react';
import {StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Layout, Button, Text, Avatar} from '@ui-kitten/components';
import UserData from '../../util/LocalData';

export default function Settings({navigation}) {
  console.log('Arrived at Settings!');

  return (
    <Layout style={Styles.container}>
      <Avatar
        style={Styles.avatar}
        size="giant"
        source={{uri: UserData.userObject.profilePic}}
        shape="round"
      />
      <Text category="h6">{UserData.userObject.name}</Text>
      <Text>{UserData.userObject.email}</Text>
      <Button
        style={Styles.button}
        appearance="outline"
        onPress={() => {
          auth()
            .signOut()
            .then(() => {
              console.log('User signed out!');
              UserData.userObject = null;
            });
        }}>
        Sign Out
      </Button>
    </Layout>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 40,
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
});
