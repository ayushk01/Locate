import React from 'react';
import {
  Platform,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
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

  componentDidMount() {
    this.requestPermissions();
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

  requestPermissions = async () => {
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
        let initialPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0122,
        };

        this.setState({location: initialPosition});
      },
      error => Alert.alert(error.message),
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000},
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
      .ref('users/' + firebase.auth().currentUser.email + '/' + this.showDate())
      .set({
        location: this.state.location,
      })
      .then(() => {
        Alert.alert('Reported!');
      })
      .catch(err => {
        Alert.alert(err);
      });
  };

  changeCamera = () => {
    if (this.state.camera.type === RNCamera.Constants.Type.front) {
      this.setState({
        camera: {
          type: RNCamera.Constants.Type.back,
        },
      });
    } else {
      this.setState({
        camera: {
          type: RNCamera.Constants.Type.front,
        },
      });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.mapView}
          provider={PROVIDER_GOOGLE}
          ref={map => (this._map = map)}
          showsUserLocation={true}
          region={this.state.location}
        />
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={this.state.camera.type}
          flashMode={RNCamera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          onGoogleVisionBarcodesDetected={({barcodes}) => {
            console.log(barcodes);
          }}>
          <TouchableOpacity onPress={() => this.changeCamera()}>
            <Icon name="reverse-camera" style={{color: '#fff', fontSize: 20}} />
          </TouchableOpacity>
        </RNCamera>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            this.sendData();
          }}>
          <Text style={{color: '#fff'}}>Report</Text>
        </TouchableOpacity>
      </View>
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
  button: {
    top: 550,
    marginHorizontal: 40,
    backgroundColor: '#e9446a',
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
