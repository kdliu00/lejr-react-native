import React from 'react';
import {StyleSheet} from 'react-native';
import {Button, Layout, Text, Icon} from '@ui-kitten/components';
import {InviteInfo} from './DataObjects';
import {LocalData, joinGroup, pushUserData} from './LocalData';

export {InvitationCard};

const AcceptIcon = props => <Icon name="checkmark-outline" {...props} />;
const DenyIcon = props => <Icon name="close-outline" {...props} />;

const InvitationCard = info => {
  const item: InviteInfo = info.item;

  return (
    <Layout style={Styles.card}>
      <Layout style={Styles.innerContainer}>
        <Button
          size="small"
          accessoryRight={DenyIcon}
          appearance="outline"
          status="danger"
          onPress={() => removeInvitation(info.index)}
        />
        <Text style={Styles.text}>
          {item.fromName} invited you to {item.groupName}
        </Text>
        <Button
          size="small"
          accessoryRight={AcceptIcon}
          appearance="filled"
          status="success"
          onPress={() => {
            joinGroup(item.groupId);
            removeInvitation(info.index);
          }}
        />
      </Layout>
    </Layout>
  );
};

function removeInvitation(index: number) {
  LocalData.user.invites.splice(index, 1);
  pushUserData();
}

const Styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'lightgray',
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    margin: 10,
  },
  text: {
    textAlign: 'center',
  },
});
