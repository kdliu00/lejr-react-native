import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, Layout, Text} from '@ui-kitten/components';
import {VirtualReceipt, Item} from './DataObjects';
import {DangerSwipe, ThemedCard, CustomSwipeable} from './ComponentUtil';
import {AnimDefaultDuration, AnimKeyboardDuration, Screen} from './Constants';
import Animated, {Easing} from 'react-native-reanimated';
import {LocalData} from './LocalData';
import {
  getMoneyFormatString,
  removeNullsFromList,
  JSONCopy,
} from './UtilityMethods';
import {Fragment} from 'react';

export {
  ContributionCard,
  ItemCard,
  PurchaseSplit,
  BlankCard,
  Balance,
  TwoColText,
  getBalanceString,
};

const ContributionCard = (props: any) => {
  const vr: VirtualReceipt = props.vr;
  const nav: any = props.nav;

  return (
    <ThemedCard
      style={Styles.contribCard}
      onPress={() => {
        LocalData.currentVR = JSONCopy(vr);
        LocalData.currentVRCopy = JSONCopy(vr);
        LocalData.items = JSONCopy(vr.items);
        if (LocalData.container != null) {
          LocalData.container.forceUpdate();
        }
        setTimeout(
          () => nav.navigate(Screen.Contribution),
          AnimKeyboardDuration,
        );
      }}>
      <Layout style={Styles.header}>
        <Layout style={Styles.topLeft}>
          <Text numberOfLines={1}>{vr.memo}</Text>
        </Layout>
        <Layout style={Styles.topRight}>
          <Text numberOfLines={1}>${getMoneyFormatString(vr.total)}</Text>
        </Layout>
      </Layout>
      <Layout style={Styles.footer}>
        {Object.keys(vr.totalSplit).map(userId => {
          var initials =
            LocalData.currentGroup.members[userId].name.match(/\b\w/g) || [];
          initials = (
            (initials.shift() || '') + (initials.pop() || '')
          ).toUpperCase();
          return (
            <Text style={Styles.splitText} key={userId}>
              {initials}: {Math.round(vr.totalSplit[userId])}%
            </Text>
          );
        })}
      </Layout>
    </ThemedCard>
  );
};

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
    this.swipeableRef = React.createRef();

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

  closeSwipeable() {
    (this.swipeableRef.current as CustomSwipeable).close();
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
          ref={this.swipeableRef}
          renderRightActions={this.renderRightActions}
          onSwipeableRightWillOpen={() => {
            // LocalData.items[this.index] = null;
            // LocalData.items = removeNullsFromList(LocalData.items);
            LocalData.items.splice(this.index, 1);
            this.totalRef.current.forceUpdate();
            this.closeAnim();
          }}
          onSwipeableRightOpen={() => {
            this.closeSwipeable();
            if (removeNullsFromList(LocalData.items).length == 0) {
              LocalData.items = [];
            }
            LocalData.container.forceUpdate();
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
                  ${getMoneyFormatString(this.item.itemCost)}
                </Text>
              </Layout>
            </Layout>
          </ThemedCard>
        </CustomSwipeable>
      </Animated.View>
    );
  }
}

const PurchaseSplit = (props: any) => {
  return (
    <Layout style={Styles.purchaseSplit}>
      <Layout style={Styles.topLeft}>
        <Text numberOfLines={1} category="h6">
          {props.userName}
        </Text>
      </Layout>
      <Layout style={Styles.topRight}>
        <Text numberOfLines={1} category="h6">
          ${getMoneyFormatString(props.userTotal)}
        </Text>
      </Layout>
      <Layout style={Styles.topRight}>
        <Text numberOfLines={1} category="h6">
          {props.userTotalPercent}%
        </Text>
      </Layout>
    </Layout>
  );
};

const Balance = (props: any) => {
  return (
    <TwoColText
      text1={props.userName as string}
      text2={getBalanceString(props.userId)}
    />
  );
};

const TwoColText = (props: any) => {
  return (
    <Layout style={Styles.purchaseSplit}>
      <Layout style={Styles.topLeft}>
        <Text numberOfLines={1} category="h6">
          {props.text1}
        </Text>
      </Layout>
      <Layout style={Styles.topRight}>
        <Text numberOfLines={1} category="h6">
          {props.text2}
        </Text>
      </Layout>
    </Layout>
  );
};

function getBalanceString(userId: string) {
  let balance = LocalData.currentGroup.members[userId].balance;
  return balance < 0
    ? '-$' + getMoneyFormatString(Math.abs(balance))
    : '$' + getMoneyFormatString(Math.abs(balance));
}

const BlankCard = () => {
  return (
    <ThemedCard
      style={[Styles.itemCard, {justifyContent: 'center', height: 32}]}
      customBackground="background-basic-color-1"
      enabled={false}
    />
  );
};

const Styles = StyleSheet.create({
  contribCard: {
    paddingTop: 12,
    paddingBottom: 16,
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
  topLeft: {
    flex: 5,
    flexDirection: 'row',
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  topRight: {
    flex: 2,
    flexDirection: 'row-reverse',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  footer: {
    flex: 1,
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  avatar: {
    marginLeft: 8,
    marginRight: 8,
  },
  purchaseSplit: {
    height: 42,
    flexDirection: 'row',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  splitText: {
    marginRight: 14,
  },
});
