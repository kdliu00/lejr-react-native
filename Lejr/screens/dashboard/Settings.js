import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Text, Avatar, Layout} from '@ui-kitten/components';
import {isPossibleObjectEmpty, LocalData, signOut} from '../../util/LocalData';
import {Screen} from '../../util/Constants';
import {SeeInvitations} from '../../util/ContributionUI';

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
          <Button
            style={[Styles.button, Styles.bottomButton]}
            appearance="outline"
            onPress={() => this.props.navigation.goBack()}>
            Back
          </Button>
          <Button
            style={Styles.button}
            appearance="filled"
            onPress={() => signOut()}>
            Sign out
          </Button>
          <Button
            style={Styles.button}
            appearance="outline"
            onPress={() => this.props.navigation.navigate(Screen.CreateGroup)}>
            Create group
          </Button>
          <SeeInvitations navigation={this.props.navigation} />
          <Text>{LocalData.user.email}</Text>
          <Text category="h6">{LocalData.user.name}</Text>
          <Avatar
            style={Styles.avatar}
            size="giant"
            source={{uri: LocalData.user.profilePic}}
            shape="round"
          />
        </SafeAreaView>
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  bottomButton: {
    marginBottom: 50,
    marginTop: 80,
  },
  button: {
    margin: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
});
