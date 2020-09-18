import React, {Component} from 'react';
import {StyleSheet, Dimensions, SafeAreaView} from 'react-native';
import {Layout, Text, Spinner, Button, Icon} from '@ui-kitten/components';
import {ContributionCard} from '../../../util/ContributionUI';
import {
  LocalData,
  loadGroupAsMain,
  safeGetListData,
  isPossibleObjectEmpty,
  getKeyForCurrentGroupItems,
} from '../../../util/LocalData';
import {Screen} from '../../../util/Constants';
import {
  ThemedLayout,
  ThemedList,
  ThemedCard,
  ThemedScroll,
} from '../../../util/ComponentUtil';
import {MergeState, RetrieveData} from '../../../util/UtilityMethods';

const InviteIcon = props => <Icon name="person-add-outline" {...props} />;
const MailIcon = props => <Icon name="email-outline" {...props} />;

export default class Home extends Component {
  constructor() {
    super();
    RetrieveData(getKeyForCurrentGroupItems()).then(
      value => (LocalData.items = value),
    );
    this.virtualReceiptData = safeGetListData(
      LocalData.currentGroup.virtualReceipts,
    );
    this.selectedGroup = LocalData.currentGroup.groupName;
    this.GroupElements = LocalData.user.groups.map(groupInfo => {
      return (
        <CustomMenuItem
          key={groupInfo.groupId}
          groupId={groupInfo.groupId}
          groupName={groupInfo.groupName}
          component={this}
        />
      );
    });
  }

  componentDidMount() {
    console.log('Arrived at Home');
  }

  render() {
    return (
      <ThemedLayout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          {isPossibleObjectEmpty(this.virtualReceiptData) ? (
            <ThemedLayout style={Styles.center}>
              <Text appearance="hint">No contributions yet</Text>
            </ThemedLayout>
          ) : (
            <ThemedList
              style={Styles.list}
              contentContainerStyle={Styles.contentContainer}
              data={this.virtualReceiptData}
              renderItem={ContributionCard}
            />
          )}
          <Layout>{this.GroupElements}</Layout>
          <Layout style={Styles.groupSelect}>
            <Button
              accessoryLeft={MailIcon}
              appearance="ghost"
              size="large"
              onPress={() => this.props.navigation.navigate(Screen.Invitations)}
            />
            <Layout style={Styles.center}>
              <Text
                numberOfLines={1}
                category="h5"
                onPress={() => MergeState(this, {overflowVisible: true})}>
                {this.selectedGroup}
              </Text>
            </Layout>
            <Button
              accessoryLeft={InviteIcon}
              appearance="ghost"
              size="large"
              onPress={() =>
                this.props.navigation.navigate(Screen.InviteToGroup, {
                  groupName: this.selectedGroup,
                })
              }
            />
          </Layout>
        </SafeAreaView>
      </ThemedLayout>
    );
  }
}

function onGroupPress(groupId, component) {
  if (LocalData.currentGroup.groupId !== groupId) {
    loadGroupAsMain(groupId)
      .catch(error => console.warn(error.message))
      .finally(() => component.props.navigation.popToTop());
  }
}

const CustomMenuItem = ({groupId, groupName, component}) => {
  return (
    <ThemedCard
      onPress={() => onGroupPress(groupId, component)}
      style={Styles.overflowItem}>
      <Text category="h6">{groupName}</Text>
    </ThemedCard>
  );
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  groupSelect: {
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  list: {
    flex: 1,
  },
});
