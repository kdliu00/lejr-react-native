import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
import {ContributionCard, MailIcon} from '../../../util/ContributionUI';
import {
  LocalData,
  safeGetListData,
  isPossibleObjectEmpty,
  getKeyForCurrentGroupItems,
  deleteAllItems,
} from '../../../util/LocalData';
import {
  Screen,
  Key,
  BannerHeight,
  AnimDefaultDuration,
} from '../../../util/Constants';
import {
  ThemedLayout,
  ThemedCard,
  ThemedScroll,
} from '../../../util/ComponentUtil';
import {RetrieveData, StoreData} from '../../../util/UtilityMethods';
import Animated, {Easing} from 'react-native-reanimated';

const InviteIcon = props => <Icon name="person-add-outline" {...props} />;
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
    this.virtualReceiptData = safeGetListData(LocalData.virtualReceipts);
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
    LocalData.home = this;
    this.props.navigation.addListener('blur', () => {
      if (this.groupSelectExpanded) {
        this.toggleGroupSelect();
      }
    });
  }

  toggleGroupSelect() {
    const {renderHeight} = this.state;
    Animated.timing(renderHeight, {
      duration: AnimDefaultDuration,
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
              <Text appearance="hint">No group purchases yet</Text>
            </ThemedLayout>
          ) : (
            <ThemedScroll
              style={Styles.container}
              contentContainerStyle={Styles.contentContainer}>
              {LocalData.virtualReceipts.map(virtualReceipt => {
                return (
                  <ContributionCard
                    key={virtualReceipt.virtualReceiptId}
                    vr={virtualReceipt}
                    nav={this.props.navigation}
                  />
                );
              })}
            </ThemedScroll>
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
            <ThemedCard
              style={Styles.groupLabel}
              customBackground="background-basic-color-2"
              onPress={() => this.toggleGroupSelect()}>
              <Text numberOfLines={1} category="h5">
                {this.selectedGroup}
              </Text>
            </ThemedCard>
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
  if (LocalData.currentGroup.groupId === groupId) {
    console.warn('Already loaded this group, invalid action!');
    return;
  }
  deleteAllItems(false);
  LocalData.currentGroup = null;
  LocalData.virtualReceipts = null;
  StoreData(Key.CurrentGroup, groupId).then(() =>
    component.props.navigation.popToTop(),
  );
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
  groupLabel: {
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  groupItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  groupSelect: {
    height: BannerHeight,
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
    paddingTop: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
