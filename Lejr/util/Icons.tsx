import React from 'react';
import {Icon} from '@ui-kitten/components';

export {
  InviteIcon,
  AddIcon,
  PeopleIcon,
  GearIcon,
  CameraIcon,
  GoogleIcon,
  EmailIcon,
  CloseIcon,
  ConfirmIcon,
  AddCircleIcon,
  BackIcon,
  TrashIcon,
  SaveIcon,
  RemoveIcon,
  LeaveIcon,
  AcceptIcon,
  DenyIcon,
  CheckIcon,
};

const AddCircleIcon = (props: any) => (
  <Icon {...props} name="plus-circle-outline" />
);
const TrashIcon = (props: any) => <Icon {...props} name="trash-2-outline" />;
const SaveIcon = (props: any) => <Icon {...props} name="save-outline" />;

const GoogleIcon = (props: any) => <Icon {...props} name="google" />;
const EmailIcon = (props: any) => <Icon {...props} name="email" />;

const CloseIcon = (props: any) => <Icon {...props} name="close-outline" />;
const ConfirmIcon = (props: any) => (
  <Icon {...props} name="checkmark-outline" />
);

const InviteIcon = (props: any) => (
  <Icon {...props} name="person-add-outline" />
);
const AddIcon = (props: any) => <Icon {...props} name="plus-outline" />;
const PeopleIcon = (props: any) => <Icon {...props} name="people-outline" />;
const GearIcon = (props: any) => <Icon {...props} name="settings-2-outline" />;
const CameraIcon = (props: any) => <Icon {...props} name="camera-outline" />;
const BackIcon = (props: any) => <Icon {...props} name="arrow-back-outline" />;

const AcceptIcon = (props: any) => <Icon {...props} name="checkmark-outline" />;
const DenyIcon = (props: any) => <Icon {...props} name="close-outline" />;

const RemoveIcon = (props: any) => (
  <Icon {...props} name="person-remove-outline" />
);
const LeaveIcon = (props: any) => <Icon {...props} name="log-out-outline" />;

const CheckIcon = (props: any) => (
  <Icon {...props} name="checkmark-circle-2-outline" />
);
