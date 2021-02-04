import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Text, Avatar, Layout, Spinner} from '@ui-kitten/components';
import ImageCropPicker from 'react-native-image-crop-picker';
import {
  LocalData,
  pushUserData,
  signOut,
  updateComponent,
  updatePicUrlForGroup,
} from '../../util/LocalData';
import {Screen} from '../../util/Constants';
import {SeeInvitations} from '../../util/ContributionUI';
import {TouchableWithoutFeedback} from 'react-native';
import {Alert} from 'react-native';

import storage from '@react-native-firebase/storage';
import {MergeState, warnLog} from '../../util/UtilityMethods';

const IMAGE_WIDTH = 96;
const IMAGE_HEIGHT = 96;

export default class Settings extends Component {
  constructor() {
    super();
    this._mounted = false;
    this.state = {
      profileUpdating: false,
    };
  }

  componentDidMount() {
    console.log('Arrived at Settings');
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  processImage(image) {
    console.log('Processing image: ' + image.path);

    //Must be .jpg
    if (image.path.slice(-4) !== '.jpg') {
      console.log('Wrong image format');
      Alert.alert(
        'Image Error',
        'The image provided was not in the correct format.',
      );
      return;
    }

    let userProfilePath = LocalData.user.userId + '.jpg';
    const storageRef = storage().ref(userProfilePath);

    MergeState(this, {profileUpdating: true});

    storageRef.putFile(image.path).then(
      snapshot => {
        console.log(snapshot.totalBytes + ' bytes transferred');
        storageRef.getDownloadURL().then(url => {
          LocalData.user.profilePic = url;
          LocalData.user.picIsCustom = true;
          console.log('User profile pic updated');
          updatePicUrlForGroup(LocalData.currentGroup.groupId).then(() => {
            pushUserData();
            updateComponent(LocalData.home);
            if (this._mounted) {
              MergeState(this, {profileUpdating: false});
              this.forceUpdate();
            }
            LocalData.isCamera = false;
          });
        });
      },
      error => warnLog(error),
    );
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Button
            style={Styles.bottomButton}
            appearance="outline"
            onPress={() => this.props.navigation.goBack()}>
            Back
          </Button>
          <Button
            style={Styles.button}
            appearance="filled"
            onPress={() => signOut()}>
            Sign out
          </Button>
          <Button
            style={Styles.button}
            appearance="outline"
            onPress={() => this.props.navigation.navigate(Screen.CreateGroup)}>
            Create group
          </Button>
          <SeeInvitations navigation={this.props.navigation} />
          <Text>{LocalData.user.email}</Text>
          <Text category="h6">{LocalData.user.name}</Text>
          <TouchableWithoutFeedback
            onPress={() => {
              Alert.alert(
                'Edit Profile Picture',
                'Select a picture from your Gallery or take one using your Camera.',
                [
                  {
                    text: 'Gallery',
                    onPress: () => {
                      LocalData.isCamera = true;
                      ImageCropPicker.openPicker({
                        mediaType: 'photo',
                        cropping: true,
                        compressImageMaxWidth: IMAGE_WIDTH,
                        compressImageMaxHeight: IMAGE_HEIGHT,
                        cropperCircleOverlay: true,
                        height: IMAGE_HEIGHT,
                        width: IMAGE_WIDTH,
                        forceJpg: true,
                      }).then(
                        image => this.processImage(image),
                        error => {
                          LocalData.isCamera = false;
                          warnLog(error.message);
                        },
                      );
                    },
                  },
                  {
                    text: 'Camera',
                    onPress: () => {
                      LocalData.isCamera = true;
                      ImageCropPicker.openCamera({
                        mediaType: 'photo',
                        cropping: true,
                        compressImageMaxWidth: IMAGE_WIDTH,
                        compressImageMaxHeight: IMAGE_HEIGHT,
                        cropperCircleOverlay: true,
                        height: IMAGE_HEIGHT,
                        width: IMAGE_WIDTH,
                        forceJpg: true,
                      }).then(
                        image => this.processImage(image),
                        error => {
                          LocalData.isCamera = false;
                          warnLog(error.message);
                        },
                      );
                    },
                  },
                ],
                {cancelable: true},
              );
            }}>
            {this.state.profileUpdating ? (
              <Layout style={Styles.spinner}>
                <Spinner size="large" />
              </Layout>
            ) : (
              <Avatar
                style={Styles.avatar}
                size="giant"
                source={{uri: LocalData.user.profilePic}}
                shape="round"
              />
            )}
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </Layout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column-reverse',
  },
  bottomButton: {
    marginBottom: 60,
    marginTop: 80,
  },
  button: {
    margin: 10,
  },
  spinner: {
    marginBottom: 48,
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
});
