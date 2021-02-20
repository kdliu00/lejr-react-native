import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Layout, Text} from '@ui-kitten/components';
import {ContributionCard, getBalanceString} from '../../../util/ContributionUI';
import {
  LocalData,
  safeGetListData,
  isPossibleObjectEmpty,
  getKeyForCurrentGroupItems,
  swapGroup,
  resetVR,
} from '../../../util/LocalData';
import {Screen, AnimDefaultDuration, Minus} from '../../../util/Constants';
import {
  ThemedLayout,
  ThemedCard,
  ThemedScroll,
  IconButton,
} from '../../../util/ComponentUtil';
import {JSONCopy, RetrieveData, warnLog} from '../../../util/UtilityMethods';
import Animated, {Easing} from 'react-native-reanimated';
import {
  AddIcon,
  CameraIcon,
  GearIcon,
  InviteIcon,
  PeopleIcon,
} from '../../../util/Icons';
import {Fragment} from 'react';
import {BackHandler} from 'react-native';

BackHandler.addEventListener('hardwareBackPress', () => {
  return true;
});

const GROUP_RENDER_HEIGHT = 150;
const ADD_OPTS_RENDER_HEIGHT = 54;

export default class Home extends Component {
  constructor() {
    super();
    RetrieveData(getKeyForCurrentGroupItems()).then(
      value => (LocalData.items = value),
    );
    this.state = {
      renderHeight: new Animated.Value(0),
      addOptsHeight: new Animated.Value(0),
    };
    this.groupSelectExpanded = false;
    this.addOptsExpanded = false;
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
      if (this.addOptsExpanded) {
        this.toggleAddOptsSelect();
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
      easing: Easing.out(Easing.cubic),
    }).start();
    this.groupSelectExpanded = !this.groupSelectExpanded;
  }

  toggleAddOptsSelect() {
    const {addOptsHeight} = this.state;
    Animated.timing(addOptsHeight, {
      duration: AnimDefaultDuration,
      toValue: this.addOptsExpanded ? 0 : ADD_OPTS_RENDER_HEIGHT,
      easing: Easing.out(Easing.cubic),
    }).start();
    this.addOptsExpanded = !this.addOptsExpanded;
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
                  <Fragment key={virtualReceipt.virtualReceiptId}>
                    {new ContributionCard(
                      virtualReceipt,
                      this.props.navigation,
                    ).render()}
                  </Fragment>
                );
              })}
            </ThemedScroll>
          )}
          <Animated.View style={{height: this.state.addOptsHeight}}>
            <ThemedScroll showsVerticalScrollIndicator={false}>
              <Layout style={Styles.row}>
                <Button
                  appearance="outline"
                  style={Styles.button}
                  onPress={() => {
                    resetVR();
                    this.props.navigation.navigate(Screen.QuickAdd);
                  }}>
                  Quick Add
                </Button>
                <Button
                  appearance="outline"
                  style={Styles.button}
                  onPress={() => {
                    resetVR();
                    this.props.navigation.navigate(Screen.Contribution);
                  }}>
                  Itemized
                </Button>
              </Layout>
            </ThemedScroll>
          </Animated.View>
          <Layout style={Styles.row}>
            <IconButton
              status="basic"
              icon={GearIcon}
              onPress={() => this.props.navigation.navigate(Screen.Settings)}
            />
            <IconButton
              icon={AddIcon}
              onPress={() => {
                this.toggleAddOptsSelect();
              }}
            />
            <IconButton
              status="info"
              icon={CameraIcon}
              onPress={() => {
                resetVR();
                this.props.navigation.navigate(Screen.FromImage);
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
              style={{flex: 0}}
              status="warning"
              icon={PeopleIcon}
              onPress={() => this.props.navigation.navigate(Screen.GroupMenu)}
            />
            <ThemedCard
              style={Styles.groupLabel}
              customBackground="background-basic-color-2"
              onPress={() => this.toggleGroupSelect()}>
              <Text numberOfLines={1} category="h5">
                {LocalData.currentGroup.groupName}
              </Text>
            </ThemedCard>
            <IconButton
              style={{flex: 0}}
              status="success"
              icon={InviteIcon}
              onPress={() =>
                this.props.navigation.navigate(Screen.InviteToGroup)
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
    let curBalance = getBalanceString(LocalData.user.userId);
    let text = '';
    if (curBalance.startsWith(Minus)) {
      text = 'You owe this group ' + curBalance.replace(Minus, '');
    } else {
      text = 'This group owes you ' + curBalance;
    }
    return (
      <Text style={Styles.titleText} category="h6">
        {text}
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
    paddingVertical: 14,
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
  button: {
    width: 120,
    marginHorizontal: 20,
  },
  banner: {
    marginBottom: 10,
  },
  titleText: {
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
