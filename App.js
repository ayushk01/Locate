import React from 'react';
import {
  Platform,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
  PermissionsAndroid,
} from 'react-native';

import firebase from 'firebase';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {RNCamera} from 'react-native-camera';
import Icon from 'react-native-ionicons';

class App extends React.Component {
  state = {
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    camera: {
      type: RNCamera.Constants.Type.front,
    },
    imagePath: null,
  };

  UNSAFE_componentWillMount() {
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
  }

  componentDidMount() {
    this.requestLocationPermission();
  }

  showDate = () => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    return (
      date + '_' + month + '_' + year + '_' + hours + ':' + min + ':' + sec
    );
  };

  requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      this.locateCurrentPosition();
    } else {
      try {
        let granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.locateCurrentPosition();
        } else {
          Alert.alert('Location permission denied!');
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  locateCurrentPosition = () => {
    Geolocation.getCurrentPosition(
      position => {
        // console.log(JSON.stringify(position));
        let initialPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        this.setState({location: initialPosition});
      },
      error => Alert.alert(error.message),
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
    );
  };

  takePicture = async () => {
    if (this.camera) {
      const data = await this.camera.takePictureAsync();
      Alert.alert('Imaged saved on ' + data.uri);
    }
  };

  sendData = () => {
    this.takePicture();
    firebase
      .database()
      .ref('users/me/' + this.showDate())
      .set({
        location: this.state.location,
      })
      .then(() => {
        Alert.alert('Data sent to database!');
      })
      .catch(err => {
        Alert.alert(err);
      });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <MapView
          style={styles.mapView}
          provider={PROVIDER_GOOGLE}
          ref={map => (this._map = map)}
          showsUserLocation={true}
          region={this.state.location}
        />
        <View style={styles.overlayContainer}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={this.state.camera.type}
            onGoogleVisionBarcodesDetected={({barcodes}) => {
              console.log(barcodes);
            }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  camera: {
                    type: this.state.camera.type === 1 ? 0 : 1,
                  },
                });
              }}>
              <Icon
                style={styles.icon}
                color="white"
                android="reverse-camera"
              />
            </TouchableOpacity>
          </RNCamera>
          <Button
            title="Send Details"
            style={styles.button}
            onPress={() => {
              this.sendData();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  preview: {
    top: 50,
    left: 250,
    width: 100,
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
  },
  icon: {
    fontSize: 20,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
});

export default App;
