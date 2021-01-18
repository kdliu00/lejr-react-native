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
  <Icon name="plus-circle-outline" {...props} />
);
const TrashIcon = (props: any) => <Icon name="trash-2-outline" {...props} />;
const SaveIcon = (props: any) => <Icon name="save-outline" {...props} />;

const GoogleIcon = (props: any) => <Icon name="google" {...props} />;
const EmailIcon = (props: any) => <Icon name="email" {...props} />;

const InviteIcon = (props: any) => (
  <Icon name="person-add-outline" {...props} />
);
const AddIcon = (props: any) => <Icon name="plus-outline" {...props} />;
const PeopleIcon = (props: any) => <Icon name="people-outline" {...props} />;
const GearIcon = (props: any) => <Icon name="settings-2-outline" {...props} />;
const CameraIcon = (props: any) => <Icon name="camera-outline" {...props} />;
const BackIcon = (props: any) => <Icon name="arrow-back-outline" {...props} />;

const AcceptIcon = (props: any) => <Icon name="checkmark-outline" {...props} />;
const DenyIcon = (props: any) => <Icon name="close-outline" {...props} />;

const RemoveIcon = (props: any) => (
  <Icon name="person-remove-outline" {...props} />
);
const LeaveIcon = (props: any) => <Icon name="log-out-outline" {...props} />;

const CheckIcon = (props: any) => (
  <Icon name="checkmark-circle-2-outline" {...props} />
);
