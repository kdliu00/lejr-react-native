import React from 'react';
import {StyleSheet} from 'react-native';
import {Avatar, Card, Layout, Text} from '@ui-kitten/components';
import {VirtualReceipt, Item} from './DataObjects';
import {ThemedCard} from './ThemedComponents';

export {ContributionCard, ItemCard};

const ContributionCard = (info: any) => {
  const item: VirtualReceipt = info.item;

  return (
    <ThemedCard style={Styles.card}>
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

const ItemCard = (info: any) => {
  const item: Item = info.item;

  return (
    <ThemedCard style={Styles.card}>
      <Layout style={Styles.header}>
        <Layout style={Styles.topLeft}>
          <Text numberOfLines={1}>{item.itemName}</Text>
        </Layout>
        <Layout style={Styles.topRight}>
          <Text numberOfLines={1}>${item.itemCost}</Text>
        </Layout>
      </Layout>
    </ThemedCard>
  );
};

const Styles = StyleSheet.create({
  card: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
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
