import React from 'react';
import {StyleSheet} from 'react-native';
import {Avatar, Card, Layout, Text} from '@ui-kitten/components';
import {VirtualReceipt} from './DataObjects';

export {ContributionCard};

const ContributionCard = info => {
  const item: VirtualReceipt = info.item;

  return (
    <Card style={Styles.card}>
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
    </Card>
  );
};

const Styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    borderRadius: 8,
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
