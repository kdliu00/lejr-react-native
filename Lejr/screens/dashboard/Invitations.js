import React from 'react';
import {StyleSheet, SafeAreaView, Alert} from 'react-native';
import {Text, Layout, Button, Icon} from '@ui-kitten/components';
import {Screen, ErrorCode} from '../../util/Constants';
import {
  LocalData,
  safeGetListData,
  pushUserData,
  joinGroup,
  isPossibleObjectEmpty,
} from '../../util/LocalData';
import {ThemedList, ThemedCard} from '../../util/ThemedComponents';

const AcceptIcon = props => <Icon name="checkmark-outline" {...props} />;
const DenyIcon = props => <Icon name="close-outline" {...props} />;

export default function Invitations({navigation}) {
  console.log('Arrived at Invitations!');

  const [InviteData, SetInviteData] = React.useState(
    safeGetListData(LocalData.user.invites),
  );

  const InvitationCard = info => {
    const item = info.item;

    return (
      <ThemedCard style={Styles.card}>
        <Layout style={Styles.innerContainer}>
          <Button
            size="small"
            accessoryRight={DenyIcon}
            appearance="outline"
            status="danger"
            onPress={() => removeInvitation(info.index, SetInviteData)}
          />
          <Text style={Styles.text}>
            {item.fromName} invited you to {item.groupName}
          </Text>
          <Button
            size="small"
            accessoryRight={AcceptIcon}
            appearance="filled"
            status="success"
            onPress={() => {
              joinGroup(item.groupId).then(
                () => removeInvitation(info.index, SetInviteData),
                error => {
                  console.warn(error.message);
                  if (error.message !== ErrorCode.DoesNotExist) {
                    Alert.alert(
                      'Join Group Error',
                      'Failed to join group. Please try again.',
                    );
                  }
                },
              );
            }}
          />
        </Layout>
      </ThemedCard>
    );
  };

  return (
    <Layout style={Styles.container}>
      <SafeAreaView style={Styles.container}>
        <Layout style={Styles.titleContainer}>
          <Text style={Styles.titleText} category="h4">
            Invitations
          </Text>
        </Layout>
        <Layout style={Styles.listContainer}>
          {isPossibleObjectEmpty(InviteData) ? (
            <Layout style={Styles.container}>
              <Text style={Styles.text} appearance="hint">
                No invitations
              </Text>
            </Layout>
          ) : (
            <ThemedList
              style={Styles.list}
              contentContainerStyle={Styles.contentContainer}
              data={InviteData}
              renderItem={InvitationCard}
            />
          )}
        </Layout>
        <Layout style={Styles.buttonContainer}>
          <Button
            onPress={() => navigation.navigate(Screen.Home)}
            appearance="outline">
            Go back
          </Button>
        </Layout>
      </SafeAreaView>
    </Layout>
  );
}

function removeInvitation(index, setInviteData) {
  LocalData.user.invites.splice(index, 1);
  pushUserData();
  setInviteData(safeGetListData(LocalData.user.invites));
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
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
    flex: 1,
  },
  buttonContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  card: {
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    margin: 10,
  },
  text: {
    textAlign: 'center',
  },
});
