import React from 'react';
import {StyleSheet} from 'react-native';
import {Avatar, Icon, Layout, Text} from '@ui-kitten/components';
import {VirtualReceipt, Item} from './DataObjects';
import {DangerSwipe, ThemedCard, CustomSwipeable} from './ComponentUtil';
import {navigate} from '../RootNav';
import {AnimDefaultDuration, Screen} from './Constants';
import Animated, {Easing} from 'react-native-reanimated';
import {LocalData} from './LocalData';
import {getMoneyFormatString} from './UtilityMethods';

export {ContributionCard, ItemCard, PurchaseSplit, MailIcon};

const MailIcon = props => <Icon name="email-outline" {...props} />;

const ContributionCard = (props: any) => {
  const vr: VirtualReceipt = props.vr;

  return (
    <ThemedCard
      style={Styles.contribCard}
      onPress={() => {
        LocalData.currentVR = vr;
        LocalData.items = vr.items;
        LocalData.container.forceUpdate();
        setTimeout(() => navigate(Screen.Contribution), 150);
      }}>
      <Layout style={Styles.header}>
        <Layout style={Styles.topLeft}>
          <Text numberOfLines={1}>{vr.memo}</Text>
        </Layout>
        <Layout style={Styles.topRight}>
          <Text numberOfLines={1}>${vr.total}</Text>
        </Layout>
      </Layout>
      <Layout style={Styles.footer}>
        {Object.keys(vr.totalSplit).map(userId => {
          var initials =
            LocalData.currentGroup.memberNames[userId].match(/\b\w/g) || [];
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

const ItemCard = (props: any) => {
  const RENDER_HEIGHT = 56;

  const item: Item = props.item;
  const index: number = props.index;
  const totalRef: React.RefObject<any> = props.totalRef;
  const renderScaleY = new Animated.Value<number>(1);
  const offsetY = new Animated.Value<number>(RENDER_HEIGHT);
  const swipeableRef = React.createRef();

  const shrinkAnim = Animated.timing(renderScaleY, {
    duration: AnimDefaultDuration,
    toValue: 0,
    easing: Easing.out(Easing.exp),
  });
  const shiftAnim = Animated.timing(offsetY, {
    duration: AnimDefaultDuration,
    toValue: 0,
    easing: Easing.out(Easing.exp),
  });

  const closeSwipeable = () => {
    (swipeableRef.current as CustomSwipeable).close();
  };

  const renderRightActions = () => {
    return (
      <DangerSwipe style={Styles.itemCard} renderLabel="Slide to delete" />
    );
  };

  return (
    <Animated.View
      style={{
        height: offsetY,
        scaleY: renderScaleY,
      }}>
      <CustomSwipeable
        childrenContainerStyle={{height: RENDER_HEIGHT}}
        ref={swipeableRef as React.RefObject<any>}
        renderRightActions={renderRightActions}
        onSwipeableRightWillOpen={() => {
          LocalData.items[index] = null;
          totalRef.current.forceUpdate();
          shrinkAnim.start();
          shiftAnim.start();
        }}
        onSwipeableRightOpen={() => {
          closeSwipeable();
          if (LocalData.items.filter(item => item != null).length == 0) {
            LocalData.items = [];
            LocalData.container.forceUpdate();
          }
        }}>
        <ThemedCard
          style={Styles.itemCard}
          onPress={() =>
            navigate(Screen.NewItem, {
              item: item,
              vrIndex: index,
            })
          }>
          <Layout style={Styles.header}>
            <Layout style={Styles.topLeft}>
              <Text numberOfLines={1}>{item.itemName}</Text>
            </Layout>
            <Layout style={Styles.topRight}>
              <Text numberOfLines={1}>
                ${getMoneyFormatString(item.itemCost)}
              </Text>
            </Layout>
          </Layout>
        </ThemedCard>
      </CustomSwipeable>
    </Animated.View>
  );
};

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

const Styles = StyleSheet.create({
  contribCard: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  itemCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
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
