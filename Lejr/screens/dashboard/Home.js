import React from 'react';
import {StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {Layout, List, Text, OverflowMenu, Spinner} from '@ui-kitten/components';
import {ContributionCard} from '../../util/ContributionUI';
import {LocalData, pullGroup} from '../../util/LocalData';

// Array of objects with at least properties 'memo', 'total', and 'totalSplit'
// const VirtualReceiptData = UserData.userGroupObject.virtualReceipts;

export default function Home() {
  console.log('Arrived at Home!');

  const [IsLoading, SetIsLoading] = React.useState(false);
  const [OverflowVisible, SetOverflowVisible] = React.useState(false);
  const [SelectedGroup, SetSelectedGroup] = React.useState(
    LocalData.currentGroup.groupName,
  );
  var groupElements = Object.keys(LocalData.groupMap).map(groupId => {
    return (
      <CustomMenuItem
        groupId={groupId}
        setSelectedGroup={SetSelectedGroup}
        setOverflowVisible={SetOverflowVisible}
        setIsLoading={SetIsLoading}
      />
    );
  });

  const nameText = () => (
    <Layout style={Styles.header}>
      <Text category="h5" onPress={() => SetOverflowVisible(true)}>
        {SelectedGroup}
      </Text>
    </Layout>
  );

  return (
    <Layout style={Styles.container}>
      <OverflowMenu
        style={Styles.overflowMenu}
        visible={OverflowVisible}
        anchor={nameText}
        onBackdropPress={() => SetOverflowVisible(false)}>
        {groupElements}
      </OverflowMenu>
      {IsLoading ? (
        <Layout style={Styles.spinner}>
          <Spinner size="large" />
        </Layout>
      ) : (
        <List
          style={Styles.list}
          contentContainerStyle={Styles.contentContainer}
          // data={VirtualReceiptData}
          renderItem={ContributionCard}
        />
      )}
    </Layout>
  );
}

function onGroupPress(groupId, setSelectedGroup, setVisible, setIsLoading) {
  setIsLoading(true);
  setSelectedGroup(LocalData.groupMap[groupId]);
  setVisible(false);
  if (LocalData.currentGroup.groupId !== groupId) {
    pullGroup(groupId, true)
      .catch(error => console.warn(error.message))
      .finally(() => setIsLoading(false));
  }
}

const CustomMenuItem = ({
  groupId,
  setSelectedGroup,
  setOverflowVisible,
  setIsLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={() =>
        onGroupPress(
          groupId,
          setSelectedGroup,
          setOverflowVisible,
          setIsLoading,
        )
      }>
      <Layout style={Styles.overflowItem}>
        <Text category="h6">{LocalData.groupMap[groupId]}</Text>
      </Layout>
    </TouchableOpacity>
  );
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowItem: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  overflowMenu: {
    width: Dimensions.get('window').width,
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
