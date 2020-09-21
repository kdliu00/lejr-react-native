import React from 'react';
import {StyleSheet} from 'react-native';
import {Avatar, Layout, Text} from '@ui-kitten/components';
import {VirtualReceipt, Item} from './DataObjects';
import {DangerSwipe, ThemedCard, CustomSwipeable} from './ComponentUtil';
import {navigate} from '../RootNav';
import {Screen} from './Constants';
import Animated, {Easing} from 'react-native-reanimated';
import {LocalData} from './LocalData';

export {ContributionCard, ItemCard};

const ContributionCard = (info: any) => {
  const item: VirtualReceipt = info.item;

  return (
    <ThemedCard style={Styles.contribCard}>
      <Layout style={Styles.header}>
        <Layout style={Styles.topLeft}>
          <Text numberOfLines={1}>{item.memo}</Text>
        </Layout>
        <Layout style={Styles.topRight}>
          <Text numberOfLines={1}>${item.total}</Text>
        </Layout>
      </Layout>
      <Layout style={Styles.footer}>
        {new Array(5).fill(
          <Avatar
            style={Styles.avatar}
            size="tiny"
            source={require('../icon.png')}
          />,
        )}
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
  const animDuration = 500;
  const swipeableRef = React.createRef();

  const shrinkAnim = Animated.timing(renderScaleY, {
    duration: animDuration,
    toValue: 0,
    easing: Easing.out(Easing.exp),
  });
  const shiftAnim = Animated.timing(offsetY, {
    duration: animDuration,
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
              <Text numberOfLines={1}>${item.itemCost.toString()}</Text>
            </Layout>
          </Layout>
        </ThemedCard>
      </CustomSwipeable>
    </Animated.View>
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
    flex: 3,
    flexDirection: 'row',
    marginRight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.0)',
  },
  topRight: {
    flex: 1,
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
});
