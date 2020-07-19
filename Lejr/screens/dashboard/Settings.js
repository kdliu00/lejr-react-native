import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Button, Text, Avatar} from '@ui-kitten/components';
import {LocalData, signOut} from '../../util/LocalData';

export default function Settings({navigation}) {
  console.log('Arrived at Settings');

  return (
    <Layout style={Styles.container}>
      <Avatar
        style={Styles.avatar}
        size="giant"
        source={{uri: LocalData.user.profilePic}}
        shape="round"
      />
      <Text category="h6">{LocalData.user.name}</Text>
      <Text>{LocalData.user.email}</Text>
      <Button
        style={Styles.button}
        appearance="outline"
        onPress={() => signOut()}>
        Sign out
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
