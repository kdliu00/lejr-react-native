import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';
import {ContributionCard, getBalanceString} from '../../../util/ContributionUI';
import {
  LocalData,
  safeGetListData,
  isPossibleObjectEmpty,
  getKeyForCurrentGroupItems,
  swapGroup,
  resetVR,
} from '../../../util/LocalData';
import {Screen, AnimDefaultDuration} from '../../../util/Constants';
import {
  ThemedLayout,
  ThemedCard,
  ThemedScroll,
  IconButton,
} from '../../../util/ComponentUtil';
import {RetrieveData, warnLog} from '../../../util/UtilityMethods';
import Animated, {Easing} from 'react-native-reanimated';
import {
  AddIcon,
  CameraIcon,
  GearIcon,
  InviteIcon,
  PeopleIcon,
} from '../../../util/Icons';

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
    this.balanceRef = React.createRef();
  }

  componentDidMount() {
    console.log('Arrived at Home');
    LocalData.home = this;
    this._mounted = true;
    this.props.navigation.addListener('blur', () => {
      if (this.groupSelectExpanded) {
        this.toggleGroupSelect();
      }
    });
  }

  componentWillUnmount() {
    this._mounted = false;
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
          <ThemedLayout style={[Styles.banner]}>
            <BalanceText ref={this.balanceRef} />
          </ThemedLayout>
          {isPossibleObjectEmpty(safeGetListData(LocalData.virtualReceipts)) ? (
            <ThemedLayout style={Styles.center}>
              <Text appearance="hint">No group purchases yet.</Text>
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
          <Layout style={Styles.row}>
            <IconButton
              style={[Styles.container, Styles.squared]}
              icon={GearIcon}
              onPress={() => this.props.navigation.navigate(Screen.Settings)}
            />
            <IconButton
              style={[Styles.container, Styles.squared]}
              icon={AddIcon}
              onPress={() => {
                resetVR();
                this.props.navigation.navigate(Screen.QuickAdd);
              }}
            />
            <IconButton
              style={[Styles.container, Styles.squared]}
              icon={CameraIcon}
              onPress={() => {
                resetVR();
                this.props.navigation.navigate(Screen.FromImage, {
                  addMore: false,
                });
              }}
            />
          </Layout>
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
              <Layout style={Styles.scrollPad} />
            </ThemedScroll>
          </Animated.View>
          <Layout style={[Styles.banner, Styles.row]}>
            <IconButton
              icon={PeopleIcon}
              onPress={() => this.props.navigation.navigate(Screen.GroupMenu)}
            />
            <ThemedCard
              style={Styles.groupLabel}
              customBackground="background-basic-color-2"
              onPress={() => this.toggleGroupSelect()}>
              <Text numberOfLines={1} category="h5">
                {this.selectedGroup}
              </Text>
            </ThemedCard>
            <IconButton
              icon={InviteIcon}
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

class BalanceText extends Component {
  render() {
    return (
      <Text style={Styles.titleText} category="h6">
        Your balance in this group is {getBalanceString(LocalData.user.userId)}
      </Text>
    );
  }
}

function onGroupPress(groupId, component) {
  if (LocalData.currentGroup.groupId === groupId) {
    warnLog('Already loaded this group, invalid action!');
    return;
  }
  swapGroup(groupId, () => component.props.navigation.popToTop());
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
    marginTop: 8,
    borderRadius: 8,
  },
  groupPlaceholder: {
    textAlign: 'center',
    marginTop: 10,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  scrollView: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  scrollPad: {
    margin: 4,
  },
  row: {
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  banner: {
    marginBottom: 10,
  },
  titleText: {
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  squared: {
    borderRadius: 0,
  },
});
