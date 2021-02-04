export {
  AnimDefaultDuration,
  AnimKeyboardDuration,
  QuickAddLabel,
  Minus,
  defaultProfilePic,
  iOSWebClientId,
  androidWebClientId,
  bugfenderAppId,
  Key,
  Collection,
  Screen,
  ErrorCode,
  Theme,
};

const AnimDefaultDuration = 400;
const AnimKeyboardDuration = 200;

const QuickAddLabel = 'QUICK ADD ITEM';
const Minus = '—';

const defaultProfilePic =
  'https://firebasestorage.googleapis.com/v0/b/lejr-fa6e3.appspot.com/o/default-profile-pic.jpg?alt=media&token=1ae60215-ca49-4da5-b759-d2fb56e33dd2';

const iOSWebClientId =
  '746843927000-6biufia12op03j4ma7522it3s81nim8b.apps.googleusercontent.com';

const androidWebClientId =
  '746843927000-1kd2tbmtr59ba41i9k4bk2gr8252jhau.apps.googleusercontent.com';

const bugfenderAppId = 'UUiginsDdHNrT9aWlpztix9egLB2Kj4z';

enum Key {
  Items = 'items_key_',
  CurrentGroup = 'current_group_id',
  VirtualReceipts = 'virtualReceipts',
  Invitations = 'invitations',
  Timestamp = 'timestamp',
  Theme = 'theme',
  Email = 'email',
  Warn = 'WARN',
  Error = 'ERROR',
}

enum Theme {
  Dark = 'dark',
  Light = 'light',
}

enum Collection {
  Users = 'users',
  Groups = 'groups',
  Archives = 'archives',
}

enum Screen {
  Parent = 'Parent',
  Loading = 'Loading',
  Login = 'Login',
  EmailLogin = 'EmailLogin',
  CreateAccount = 'CreateAccount',
  CreateGroup = 'CreateGroup',
  Dashboard = 'Dashboard',
  Home = 'Home',
  Contribution = 'Contribution',
  FromImage = 'FromImage',
  Settings = 'Settings',
  InviteToGroup = 'InviteToGroup',
  Invitations = 'Invitations',
  NewItem = 'NewItem',
  ContribDetails = 'ContribDetails',
  GroupMenu = 'GroupMenu',
  QuickAdd = 'QuickAdd',
  QRScanner = 'QRScanner',
}

enum ErrorCode {
  UserNotFound = 'UserNotFound',
  UserDuplicate = 'UserDuplicate',
  InvalidId = 'InvalidId',
  DoesNotExist = 'DoesNotExist',
  DatabaseError = 'DatabaseError',
  ImagePickerError = 'ImagePickerError',
}
