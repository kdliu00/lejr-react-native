import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, Dimensions} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
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
import {RetrieveData, StoreData} from '../../../util/UtilityMethods';
import Animated, {Easing} from 'react-native-reanimated';

const InviteIcon = props => <Icon name="person-add-outline" {...props} />;
const MailIcon = props => <Icon name="email-outline" {...props} />;
const GROUP_RENDER_HEIGHT = 150;

export default class Home extends Component {
  constructor() {
    super();
    RetrieveData(getKeyForCurrentGroupItems()).then(
      value => (LocalData.items = value),
    );
    this.state = {
      renderHeight: new Animated.Value(0),
    };
    this.groupSelectExpanded = false;
    this.virtualReceiptData = safeGetListData(
      LocalData.currentGroup.virtualReceipts,
    );
    this.selectedGroup = LocalData.currentGroup.groupName;
    this.GroupElements = LocalData.user.groups
      .filter(groupInfo => groupInfo.groupId !== LocalData.currentGroup.groupId)
      .map(groupInfo => {
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

  toggleGroupSelect() {
    const {renderHeight} = this.state;
    Animated.timing(renderHeight, {
      duration: 500,
      toValue: this.groupSelectExpanded ? 0 : GROUP_RENDER_HEIGHT,
      easing: Easing.inOut(Easing.exp),
    }).start();
    this.groupSelectExpanded = !this.groupSelectExpanded;
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
              style={Styles.container}
              contentContainerStyle={Styles.contentContainer}
              data={this.virtualReceiptData}
              renderItem={ContributionCard}
            />
          )}
          <Animated.View style={{height: this.state.renderHeight}}>
            <ThemedScroll
              style={Styles.scrollView}
              customBackground="background-basic-color-2">
              {LocalData.user.groups.length === 1 ? (
                <Text style={Styles.groupPlaceholder} appearance="hint">
                  Your other groups will be here
                </Text>
              ) : (
                this.GroupElements
              )}
            </ThemedScroll>
          </Animated.View>
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
                onPress={() => this.toggleGroupSelect()}>
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
  StoreData(getKeyForCurrentGroupItems(), LocalData.items);
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
      style={Styles.groupItem}>
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
  groupItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    margin: 8,
    borderRadius: 8,
  },
  groupSelect: {
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupPlaceholder: {
    textAlign: 'center',
    marginTop: 20,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scrollView: {
    paddingTop: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
