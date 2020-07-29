import React from 'react';
import {StyleSheet, Dimensions, SafeAreaView} from 'react-native';
import {
  Layout,
  Text,
  OverflowMenu,
  Spinner,
  Button,
  Icon,
} from '@ui-kitten/components';
import {ContributionCard} from '../../util/ContributionUI';
import {
  LocalData,
  loadGroupAsMain,
  safeGetListData,
  isPossibleObjectEmpty,
} from '../../util/LocalData';
import {Screen} from '../../util/Constants';
import {
  ThemedLayout,
  ThemedList,
  ThemedCard,
} from '../../util/ThemedComponents';
import {MergeState} from '../../util/UtilityMethods';
import {Component} from 'react';

const InviteIcon = props => <Icon name="person-add-outline" {...props} />;
const MailIcon = props => <Icon name="email-outline" {...props} />;

export default class Home extends Component {
  constructor() {
    super();
    this.virtualReceiptData = safeGetListData(
      LocalData.currentGroup.virtualReceipts,
    );
    this.state = {
      isLoading: false,
      overflowVisible: false,
      selectedGroup: LocalData.currentGroup.groupName,
    };
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
    const GroupSelect = () => (
      <Layout style={Styles.groupSelect}>
        <Button
          accessoryLeft={MailIcon}
          appearance="ghost"
          onPress={() => this.props.navigation.navigate(Screen.Invitations)}
        />
        <Text
          category="h5"
          onPress={() => MergeState(this, {overflowVisible: true})}>
          {this.state.selectedGroup}
        </Text>
        <Button
          accessoryLeft={InviteIcon}
          appearance="ghost"
          onPress={() =>
            this.props.navigation.navigate(Screen.InviteToGroup, {
              groupName: this.state.selectedGroup,
            })
          }
        />
      </Layout>
    );
    return (
      <ThemedLayout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          {this.state.isLoading ? (
            <ThemedLayout style={Styles.center}>
              <Spinner size="large" />
            </ThemedLayout>
          ) : isPossibleObjectEmpty(this.virtualReceiptData) ? (
            <ThemedLayout style={Styles.center}>
              <Text appearance="hint">No contributions</Text>
            </ThemedLayout>
          ) : (
            <ThemedList
              style={Styles.list}
              contentContainerStyle={Styles.contentContainer}
              data={this.virtualReceiptData}
              renderItem={ContributionCard}
            />
          )}
          <OverflowMenu
            style={Styles.overflowMenu}
            visible={this.state.overflowVisible}
            anchor={GroupSelect}
            placement="top"
            onBackdropPress={() => MergeState(this, {overflowVisible: false})}>
            {this.GroupElements}
          </OverflowMenu>
        </SafeAreaView>
      </ThemedLayout>
    );
  }
}

function onGroupPress(groupId, groupName, component) {
  var newState = {overflowVisible: false};
  if (LocalData.currentGroup.groupId !== groupId) {
    newState.isLoading = true;
    newState.selectedGroup = groupName;
    loadGroupAsMain(groupId)
      .catch(error => console.warn(error.message))
      .finally(() => MergeState(component, {isLoading: false}));
  }
  MergeState(component, newState);
}

const CustomMenuItem = ({groupId, groupName, component}) => {
  return (
    <ThemedCard
      activeOpacity={1}
      onPress={() => onGroupPress(groupId, groupName, component)}>
      <Layout style={Styles.overflowItem}>
        <Text category="h6">{groupName}</Text>
      </Layout>
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
  overflowMenu: {
    width: Dimensions.get('window').width * 0.99,
  },
  groupSelect: {
    height: 56,
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
