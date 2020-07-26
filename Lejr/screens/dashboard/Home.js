import React from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  Layout,
  Text,
  OverflowMenu,
  Spinner,
  Button,
  Icon,
} from '@ui-kitten/components';
import {ContributionCard} from '../../util/ContributionUI';
import {
  LocalData,
  loadGroupAsMain,
  safeGetListData,
  isPossibleObjectEmpty,
} from '../../util/LocalData';
import {Screen} from '../../util/Constants';
import {ThemedLayout, ThemedList} from '../../util/ThemedComponents';

const InviteIcon = props => <Icon name="person-add-outline" {...props} />;
const MailIcon = props => <Icon name="email-outline" {...props} />;

export default function Home({navigation}) {
  console.log('Arrived at Home');

  const VirtualReceiptData = safeGetListData(
    LocalData.currentGroup.virtualReceipts,
  );

  const [IsLoading, SetIsLoading] = React.useState(false);
  const [OverflowVisible, SetOverflowVisible] = React.useState(false);
  const [SelectedGroup, SetSelectedGroup] = React.useState(
    LocalData.currentGroup.groupName,
  );

  var groupElements = LocalData.user.groups.map(groupInfo => {
    return (
      <CustomMenuItem
        key={groupInfo.groupId}
        groupId={groupInfo.groupId}
        groupName={groupInfo.groupName}
        setSelectedGroup={SetSelectedGroup}
        setOverflowVisible={SetOverflowVisible}
        setIsLoading={SetIsLoading}
      />
    );
  });

  const groupSelect = () => (
    <Layout style={Styles.groupSelect}>
      <Button
        accessoryLeft={MailIcon}
        appearance="ghost"
        onPress={() => navigation.navigate(Screen.Invitations)}
      />
      <Text category="h5" onPress={() => SetOverflowVisible(true)}>
        {SelectedGroup}
      </Text>
      <Button
        accessoryLeft={InviteIcon}
        appearance="ghost"
        onPress={() =>
          navigation.navigate(Screen.InviteToGroup, {GroupName: SelectedGroup})
        }
      />
    </Layout>
  );

  return (
    <ThemedLayout style={Styles.container}>
      <SafeAreaView style={Styles.container}>
        {IsLoading ? (
          <ThemedLayout style={Styles.center}>
            <Spinner size="large" />
          </ThemedLayout>
        ) : isPossibleObjectEmpty(VirtualReceiptData) ? (
          <ThemedLayout style={Styles.center}>
            <Text appearance="hint">No contributions</Text>
          </ThemedLayout>
        ) : (
          <ThemedList
            style={Styles.list}
            contentContainerStyle={Styles.contentContainer}
            data={VirtualReceiptData}
            renderItem={ContributionCard}
          />
        )}
        <OverflowMenu
          style={Styles.overflowMenu}
          visible={OverflowVisible}
          anchor={groupSelect}
          placement="top"
          onBackdropPress={() => SetOverflowVisible(false)}>
          {groupElements}
        </OverflowMenu>
      </SafeAreaView>
    </ThemedLayout>
  );
}

function onGroupPress(
  groupId,
  groupName,
  setSelectedGroup,
  setVisible,
  setIsLoading,
) {
  setVisible(false);
  if (LocalData.currentGroup.groupId !== groupId) {
    setIsLoading(true);
    setSelectedGroup(groupName);
    loadGroupAsMain(groupId)
      .catch(error => console.warn(error.message))
      .finally(() => setIsLoading(false));
  }
}

const CustomMenuItem = ({
  groupId,
  groupName,
  setSelectedGroup,
  setOverflowVisible,
  setIsLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={() =>
        onGroupPress(
          groupId,
          groupName,
          setSelectedGroup,
          setOverflowVisible,
          setIsLoading,
        )
      }>
      <Layout style={Styles.overflowItem}>
        <Text category="h6">{groupName}</Text>
      </Layout>
    </TouchableOpacity>
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
  overflowItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  overflowMenu: {
    width: Dimensions.get('window').width * 0.99,
  },
  groupSelect: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
