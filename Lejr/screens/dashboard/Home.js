import React from 'react';
import {StyleSheet, Dimensions, TouchableOpacity, Keyboard} from 'react-native';
import {
  Layout,
  List,
  Text,
  OverflowMenu,
  Spinner,
  Modal,
  Button,
  Icon,
} from '@ui-kitten/components';
import {ContributionCard} from '../../util/ContributionUI';
import {LocalData, loadGroupAsMain} from '../../util/LocalData';
import * as yup from 'yup';
import {onValidationError, InputField} from '../../util/TextInputUI';
import {SafeAreaView} from 'react-navigation';

// Array of objects with at least properties 'memo', 'total', and 'totalSplit'
// const VirtualReceiptData = UserData.userGroupObject.virtualReceipts;

const InviteIcon = props => <Icon name="person-add-outline" {...props} />;
const MailIcon = props => <Icon name="email-outline" {...props} />;

export default function Home() {
  console.log('Arrived at Home!');

  const [IsLoading, SetIsLoading] = React.useState(false);
  const [OverflowVisible, SetOverflowVisible] = React.useState(false);
  const [SelectedGroup, SetSelectedGroup] = React.useState(
    LocalData.currentGroup.groupName,
  );
  const [InviteVisible, SetInviteVisible] = React.useState(false);

  const [Email, SetEmail] = React.useState('');
  const [EmailError, SetEmailError] = React.useState('');
  const EmailRef = React.useRef();

  const ValidationSchema = yup.object().shape({
    email: yup
      .string()
      .label('Email')
      .email()
      .required(),
  });

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
      <Button accessoryLeft={MailIcon} appearance="ghost" />
      <Text category="h5" onPress={() => SetOverflowVisible(true)}>
        {SelectedGroup}
      </Text>
      <Button
        accessoryLeft={InviteIcon}
        appearance="ghost"
        onPress={() => SetInviteVisible(true)}
      />
    </Layout>
  );

  return (
    <SafeAreaView style={Styles.container}>
      <Modal
        visible={InviteVisible}
        backdropStyle={Styles.modalBackdrop}
        onBackdropPress={() => SetInviteVisible(false)}>
        <Layout style={Styles.inviteModal} disabled={true}>
          <Layout style={Styles.modalItems}>
            <Text>Yay!</Text>
            <InputField
              fieldError={EmailError}
              refToPass={EmailRef}
              validationSchema={ValidationSchema}
              fieldKey="email"
              fieldParams={text => ({email: text})}
              setField={SetEmail}
              setFieldError={SetEmailError}
              placeholder="username@example.com"
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
              value={Email}
              autoFocus
            />
            <Button
              style={Styles.inviteButton}
              onPress={() => {
                ValidationSchema.validate({
                  email: Email,
                })
                  .catch(error => onValidationError(error, [[EmailRef, Email]]))
                  .then(valid => {
                    if (valid) {
                      console.log('Sending invite!');
                      pushInvite(Email);
                    }
                  });
              }}>
              Invite to group
            </Button>
          </Layout>
        </Layout>
      </Modal>
      {IsLoading ? (
        <Layout style={Styles.center}>
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
      <OverflowMenu
        style={Styles.overflowMenu}
        visible={OverflowVisible}
        anchor={groupSelect}
        placement="top"
        onBackdropPress={() => SetOverflowVisible(false)}>
        {groupElements}
      </OverflowMenu>
    </SafeAreaView>
  );
}

function onGroupPress(
  groupId,
  groupName,
  setSelectedGroup,
  setVisible,
  setIsLoading,
) {
  setIsLoading(true);
  setSelectedGroup(groupName);
  setVisible(false);
  if (LocalData.currentGroup.groupId !== groupId) {
    loadGroupAsMain(groupId)
      .catch(error => console.warn(error.message))
      .finally(() => setIsLoading(false));
  }
}

async function pushInvite(email) {}

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
  modalItems: {
    alignItems: 'center',
    marginLeft: -Dimensions.get('window').width * 0.1,
    marginRight: -Dimensions.get('window').width * 0.1,
    margin: 15,
    marginBottom: 15,
  },
  inviteModal: {
    flex: 1,
    borderRadius: 5,
    width: Dimensions.get('window').width * 0.8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  inviteButton: {
    marginTop: 20,
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
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
