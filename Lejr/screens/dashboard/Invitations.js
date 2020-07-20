import React from 'react';
import {StyleSheet} from 'react-native';
import {Text, List, Layout, Button} from '@ui-kitten/components';
import {Screens} from '../../util/Constants';
import {LocalData} from '../../util/LocalData';
import {InvitationCard} from '../../util/InvitationUI';

export default function Invitations({navigation}) {
  console.log('Arrived at Invitations!');

  const InviteData = LocalData.user.invites;

  return (
    <Layout style={Styles.container}>
      <Layout style={Styles.titleContainer}>
        <Text style={Styles.text} category="h4">
          Invitations
        </Text>
      </Layout>
      <Layout style={Styles.listContainer}>
        <List
          style={Styles.list}
          contentContainerStyle={Styles.contentContainer}
          data={InviteData}
          renderItem={InvitationCard}
        />
      </Layout>
      <Layout style={Styles.buttonContainer}>
        <Button
          onPress={() => navigation.navigate(Screens.Home)}
          appearance="outline">
          Go back
        </Button>
      </Layout>
    </Layout>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 5,
    width: '100%',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    backgroundColor: 'white',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
