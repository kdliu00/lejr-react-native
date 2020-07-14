export {
  defaultProfilePic,
  iOSWebClientId,
  androidWebClientId,
  Collections,
  Screens,
};

const defaultProfilePic =
  'https://firebasestorage.googleapis.com/v0/b/lejr-fa6e3.appspot.com/o/default-profile-pic.jpg?alt=media&token=1ae60215-ca49-4da5-b759-d2fb56e33dd2';

const iOSWebClientId =
  '746843927000-6biufia12op03j4ma7522it3s81nim8b.apps.googleusercontent.com';

const androidWebClientId =
  '746843927000-1kd2tbmtr59ba41i9k4bk2gr8252jhau.apps.googleusercontent.com';

enum Collections {
  Users = 'users',
  Groups = 'groups',
  Archives = 'archives',
}

enum Screens {
  Loading = 'Loading',
  Login = 'Login',
  EmailLogin = 'EmailLogin',
  CreateAccount = 'CreateAccount',
  SelectGroup = 'SelectGroup',
  Dashboard = 'Dashboard',
  Home = 'Home',
  Contribution = 'Contribution',
  FromImage = 'FromImage',
  Settings = 'Settings',
}
