import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, List, Text} from '@ui-kitten/components';
import {ContributionCard} from '../../util/ContributionUI';
import {LocalData} from '../../util/LocalData';

// Array of objects with at least properties 'memo', 'total', and 'totalSplit'
// const VirtualReceiptData = UserData.userGroupObject.virtualReceipts;

export default function Home({navigation}) {
  console.log('Arrived at Home!');

  return (
    <Layout style={Styles.container}>
      <Layout style={Styles.header}>
        <Text category="h5">{LocalData.currentGroup.groupName}</Text>
      </Layout>
      <List
        style={Styles.list}
        contentContainerStyle={Styles.contentContainer}
        // data={VirtualReceiptData}
        renderItem={ContributionCard}
      />
    </Layout>
  );
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  list: {
    flex: 1,
  },
});
