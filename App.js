import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import firebase from 'firebase';

// Screens
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

// App's Firebase configuration
var firebaseConfig = {
  apiKey: 'AIzaSyBTFJdYXdAs6exddbX3uKLy0hScnAwbfME',
  authDomain: 'locatedb-4f705.firebaseapp.com',
  databaseURL: 'https://locatedb-4f705.firebaseio.com',
  projectId: 'locatedb-4f705',
  storageBucket: 'locatedb-4f705.appspot.com',
  messagingSenderId: '962496643762',
  appId: '1:962496643762:web:2e95aebbe5fcb8b06b7fab',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const AuthStack = createStackNavigator(
  {
    Login: LoginScreen,
    Register: RegisterScreen,
  },
  {
    headerMode: 'none',
  },
);

const AppStack = createStackNavigator(
  {
    Home: HomeScreen,
  },
  {
    headerMode: 'none',
  },
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      Auth: AuthStack,
      App: AppStack,
    },
    {
      initialRouteName: 'Loading',
    },
  ),
);
