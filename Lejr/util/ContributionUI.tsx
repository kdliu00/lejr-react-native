import React, {Component} from 'react';
import {StyleSheet} from 'react-native';
import {Avatar, CheckBox, Layout, Text} from '@ui-kitten/components';
import {VirtualReceipt, Item} from './DataObjects';
import {DangerSwipe, ThemedCard, CustomSwipeable} from './ComponentUtil';
import {
  AnimDefaultDuration,
  AnimKeyboardDuration,
  QuickAddLabel,
  Screen,
} from './Constants';
import Animated, {Easing} from 'react-native-reanimated';
import {
  getProfilePic,
  isPossibleObjectEmpty,
  LocalData,
  resetVR,
  updateComponent,
} from './LocalData';
import {
  getMoneyFormatString,
  removeNullsFromList,
  JSONCopy,
} from './UtilityMethods';
import {CheckIcon} from './Icons';
import moment from 'moment';
import {Fragment} from 'react';

export {
  ContributionCard,
  ItemCard,
  BlankCard,
  Balance,
  OneColText,
  TwoColText,
  TwoColCheck,
  getBalanceString,
  SeeInvitations,
};

class ContributionCard extends Component {
  vr: VirtualReceipt;
  nav: any;

  constructor(props: any) {
    super(props);
    this.vr = props.vr;
    this.nav = props.nav;
  }

  render() {
    return (
      <ThemedCard
        style={Styles.contribCard}
        onPress={() => {
          resetVR();
          LocalData.currentVR = JSONCopy(this.vr);
          LocalData.currentVRCopy = JSONCopy(this.vr);
          LocalData.items = JSONCopy(this.vr.items);
          updateComponent(LocalData.container);

          setTimeout(() => {
            LocalData.items.length == 1 &&
            LocalData.items[0].itemName === QuickAddLabel
              ? this.nav.navigate(Screen.QuickAdd)
              : this.nav.navigate(Screen.Contribution);
          }, AnimKeyboardDuration);
        }}>
        <Layout style={Styles.header}>
          <Layout style={Styles.topLeft}>
            <Avatar
              style={Styles.avatar}
              size="medium"
              source={{
                uri: getProfilePic(this.vr.buyerId),
              }}
              shape="round"
            />
            <Text numberOfLines={1} category="h6">
              {this.vr.memo}
            </Text>
          </Layout>
          <Layout style={Styles.topRight}>
            <Text numberOfLines={1} category="h6">
              {getMoneyFormatString(this.vr.total)}
            </Text>
          </Layout>
        </Layout>
        <Layout style={Styles.footer}>
          <Layout style={Styles.topLeft}>
            {Object.keys(this.vr.totalSplit).map(userId => {
              if (this.vr.totalSplit[userId] != 0) {
                return (
                  <Fragment key={userId}>
                    <Avatar
                      style={Styles.avatar}
                      size="tiny"
                      source={{
                        uri: getProfilePic(userId),
                      }}
                      shape="round"
                    />
                  </Fragment>
                );
              }
            })}
          </Layout>
          <Text style={Styles.splitText}>
            {moment(new Date(this.vr.timestamp)).format('MMM. D, h:mm a')}
          </Text>
        </Layout>
      </ThemedCard>
    );
  }
}

class ItemCard extends Component {
  RENDER_HEIGHT = 56;

  item: Item;
  index: number;
  totalRef: React.RefObject<Component>;
  nav: any;
  swipeableRef: React.RefObject<CustomSwipeable>;

  constructor(props: any) {
    super(props);
    this.item = props.item;
    this.index = props.index;
    this.totalRef = props.totalRef;
    this.nav = props.nav;

    this.state = {
      renderScaleY: new Animated.Value<number>(1),
      offsetY: new Animated.Value<number>(this.RENDER_HEIGHT),
    };
  }

  closeAnim() {
    Animated.timing((this.state as any).renderScaleY, {
      duration: AnimDefaultDuration,
      toValue: 0,
      easing: Easing.out(Easing.exp),
    }).start();
    Animated.timing((this.state as any).offsetY, {
      duration: AnimDefaultDuration,
      toValue: 0,
      easing: Easing.out(Easing.exp),
    }).start();
  }

  renderRightActions = () => {
    return (
      <DangerSwipe
        animStyle={{
          height: (this.state as any).offsetY,
          scaleY: (this.state as any).renderScaleY,
        }}
        style={Styles.itemCard}
        renderLabel="Delete"
      />
    );
  };

  render() {
    return (
      <Animated.View
        style={{
          height: (this.state as any).offsetY,
          scaleY: (this.state as any).renderScaleY,
        }}>
        <CustomSwipeable
          containerStyle={{height: this.RENDER_HEIGHT}}
          childrenContainerStyle={{height: this.RENDER_HEIGHT}}
          renderRightActions={this.renderRightActions}
          onSwipeableRightWillOpen={() => {
            this.closeAnim();
          }}
          onSwipeableRightOpen={() => {
            LocalData.items[this.index] = null;
            this.totalRef.current.forceUpdate();
            if (removeNullsFromList(LocalData.items).length == 0) {
              LocalData.items = [];
              updateComponent(LocalData.container);
            }
          }}>
          <ThemedCard
            style={[Styles.itemCard, {justifyContent: 'center'}]}
            onPress={() =>
              this.nav.navigate(Screen.NewItem, {
                item: this.item,
                vrIndex: this.index,
              })
            }>
            <Layout style={Styles.header}>
              <Layout style={Styles.topLeft}>
                <Text numberOfLines={1}>{this.item.itemName}</Text>
              </Layout>
              <Layout style={Styles.topRight}>
                <Text numberOfLines={1}>
                  {getMoneyFormatString(this.item.itemCost)}
                </Text>
              </Layout>
            </Layout>
          </ThemedCard>
        </CustomSwipeable>
      </Animated.View>
    );
  }
}

/**
 * Two columns of text for user balance
 * @param props userName and userId
 */
const Balance = (props: any) => {
  var [checked, setChecked] = React.useState(props.isChecked);
  props.groupMenuInstance.entryCallbacks[props.userId] = setChecked;
  return (
    <Layout style={Styles.purchaseSplit}>
      {checked ? (
        <Layout>{<CheckIcon style={Styles.icon} />}</Layout>
      ) : (
        <Layout />
      )}
      <Layout style={Styles.topLeft}>
        {
          <Text numberOfLines={1} category="h6">
            {props.userName as string}
          </Text>
        }
      </Layout>
      <Layout style={Styles.topRight}>
        {
          <Text numberOfLines={1} category="h6">
            {getBalanceString(props.userId)}
          </Text>
        }
      </Layout>
    </Layout>
  );
};

/**
 * One column of text
 * @param props text
 */
const OneColText = (props: any) => {
  var text = (
    <Text numberOfLines={1} category="h6">
      {props.text}
    </Text>
  );
  return <OneColElem elem={text} />;
};

/**
 * Two columns of text
 * @param props text1 and text2
 */
const TwoColText = (props: any) => {
  var text1 = (
    <Text numberOfLines={1} category="h6">
      {props.text1}
    </Text>
  );
  var text2 = (
    <Text numberOfLines={1} category="h6">
      {props.text2}
    </Text>
  );
  return <TwoColElem elem1={text1} elem2={text2} />;
};

/**
 * Column of text and column of checkbox
 * @param props isChecked, callback, and text
 */
const TwoColCheck = (props: any) => {
  var [checked, setChecked] = React.useState(props.isChecked);
  var text = (
    <Text
      numberOfLines={1}
      category="h6"
      appearance={checked ? 'default' : 'hint'}>
      {props.text}
    </Text>
  );
  var check = (
    <CheckBox
      disabled={props.isDisabled}
      checked={checked}
      onChange={nextChecked => {
        setChecked(nextChecked);
        props.callback(nextChecked);
      }}
    />
  );
  return (
    <Layout style={Styles.checkboxRow}>
      <TwoColElem elem1={text} elem2={check} />
    </Layout>
  );
};

const TwoColElem = (props: any) => {
  return (
    <Layout style={Styles.purchaseSplit}>
      <Layout style={Styles.topLeft}>{props.elem1}</Layout>
      <Layout style={Styles.topRight}>{props.elem2}</Layout>
    </Layout>
  );
};

const OneColElem = (props: any) => {
  return (
    <Layout style={Styles.purchaseSplit}>
      <Layout style={Styles.topCenter}>{props.elem}</Layout>
    </Layout>
  );
};

function getBalanceString(userId: string) {
  let balance = LocalData.currentGroup.members[userId].balance;
  return getMoneyFormatString(balance);
}

const BlankCard = (props: any) => {
  return (
    <ThemedCard
      style={{justifyContent: 'center', height: 64}}
      customBackground={
        props.background ? props.background : 'background-basic-color-1'
      }
      enabled={false}
    />
  );
};

const SeeInvitations = (props: any) => {
  var [count, setCount] = React.useState(
    isPossibleObjectEmpty(LocalData.invitations)
      ? 0
      : LocalData.invitations.length,
  );
  LocalData.setInvCount = setCount;
  console.log('Set invitation count setter');
  return (
    <Text
      style={[Styles.text, Styles.boldText]}
      category="h6"
      status="primary"
      onPress={() => props.navigation.navigate(Screen.Invitations)}>
      See invitations {'(' + count + ')'}
    </Text>
  );
};

const Styles = StyleSheet.create({
  contribCard: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 8,
    flex: 1,
  },
  itemCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  topCenter: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  topLeft: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  topRight: {
    flex: 2,
    alignItems: 'center',
    flexDirection: 'row-reverse',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  footer: {
    flex: 1,
    marginTop: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  avatar: {
    marginRight: 10,
  },
  purchaseSplit: {
    height: 42,
    flexDirection: 'row',
    paddingHorizontal: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  splitText: {
    textAlign: 'right',
    marginLeft: 14,
  },
  checkboxRow: {
    marginHorizontal: 50,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: 'green',
    marginRight: 5,
  },
  text: {
    textAlign: 'center',
    marginVertical: 15,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
