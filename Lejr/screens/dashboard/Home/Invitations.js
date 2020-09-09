import React from 'react';
import {StyleSheet, SafeAreaView, Alert} from 'react-native';
import {Text, Layout, Button, Icon} from '@ui-kitten/components';
import {Screen, ErrorCode} from '../../../util/Constants';
import {
  LocalData,
  safeGetListData,
  pushUserData,
  joinGroup,
  isPossibleObjectEmpty,
} from '../../../util/LocalData';
import {ThemedList, ThemedCard} from '../../../util/ComponentUtil';
import {Component} from 'react';
import {MergeState} from '../../../util/UtilityMethods';

const AcceptIcon = props => <Icon name="checkmark-outline" {...props} />;
const DenyIcon = props => <Icon name="close-outline" {...props} />;

export default class Invitations extends Component {
  constructor() {
    super();
    this.state = {
      inviteData: LocalData.user.invites,
    };
  }

  InvitationCard = info => {
    const item = info.item;

    return (
      <ThemedCard activeOpacity={1} style={Styles.card} disabled={true}>
        <Layout style={Styles.innerContainer}>
          <Button
            size="small"
            accessoryRight={DenyIcon}
            appearance="outline"
            status="danger"
            onPress={() => removeInvitation(info.index, this)}
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
                () => removeInvitation(info.index, this),
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

  componentDidMount() {
    console.log('Arrived at Invitations!');
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Layout style={Styles.titleContainer}>
            <Text style={Styles.titleText} category="h4">
              Invitations
            </Text>
          </Layout>
          <Layout style={Styles.listContainer}>
            {isPossibleObjectEmpty(this.state.inviteData) ? (
              <Layout style={Styles.container}>
                <Text style={Styles.text} appearance="hint">
                  No invitations
                </Text>
              </Layout>
            ) : (
              <ThemedList
                style={Styles.list}
                contentContainerStyle={Styles.contentContainer}
                data={this.state.inviteData}
                renderItem={this.InvitationCard}
              />
            )}
          </Layout>
          <Layout style={Styles.buttonContainer}>
            <Button
              onPress={() => this.props.navigation.navigate(Screen.Home)}
              appearance="outline">
              Go back
            </Button>
          </Layout>
        </SafeAreaView>
      </Layout>
    );
  }
}

function removeInvitation(index, component) {
  console.log('Removed invitation ' + index);
  LocalData.user.invites.splice(index, 1);
  pushUserData();
  MergeState(component, {inviteData: safeGetListData(LocalData.user.invites)});
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
    marginVertical: 30,
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
    marginHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    margin: 10,
  },
  text: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 5,
  },
});
