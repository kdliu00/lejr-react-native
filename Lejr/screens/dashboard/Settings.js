import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Text, Avatar, Layout} from '@ui-kitten/components';
import {isPossibleObjectEmpty, LocalData, signOut} from '../../util/LocalData';
import {Screen} from '../../util/Constants';

export default class Settings extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    console.log('Arrived at Settings');
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Avatar
            style={Styles.avatar}
            size="giant"
            source={{uri: LocalData.user.profilePic}}
            shape="round"
          />
          <Text category="h6">{LocalData.user.name}</Text>
          <Text>{LocalData.user.email}</Text>
          <Layout style={Styles.buttonContainer}>
            <Text
              style={[Styles.text, Styles.boldText]}
              category="h6"
              status="primary"
              onPress={() =>
                this.props.navigation.navigate(Screen.Invitations)
              }>
              See invitations{' '}
              {'(' +
                (isPossibleObjectEmpty(LocalData.invitations)
                  ? 0
                  : LocalData.invitations.length) +
                ')'}
            </Text>
            <Button
              style={Styles.button}
              appearance="outline"
              onPress={() =>
                this.props.navigation.navigate(Screen.CreateGroup)
              }>
              Create group
            </Button>
            <Button
              style={Styles.button}
              appearance="filled"
              onPress={() => signOut()}>
              Sign out
            </Button>
          </Layout>
        </SafeAreaView>
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    margin: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
  text: {
    textAlign: 'center',
    marginVertical: 15,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
