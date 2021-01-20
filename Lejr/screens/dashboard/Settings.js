import React, {Component} from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {Button, Text, Avatar, Layout} from '@ui-kitten/components';
import ImageCropPicker from 'react-native-image-crop-picker';
import {
  LocalData,
  pushUserData,
  signOut,
  updatePicUrlForGroup,
} from '../../util/LocalData';
import {Screen} from '../../util/Constants';
import {SeeInvitations} from '../../util/ContributionUI';
import {TouchableWithoutFeedback} from 'react-native';
import {Alert} from 'react-native';

import storage from '@react-native-firebase/storage';

const IMAGE_WIDTH = 96;
const IMAGE_HEIGHT = 96;

export default class Settings extends Component {
  constructor() {
    super();
    this._mounted = false;
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
        [{text: 'Okay'}],
        {cancelable: false},
      );
      return;
    }

    let userProfilePath = LocalData.user.userId + '.jpg';
    const storageRef = storage().ref(userProfilePath);

    storageRef.putFile(image.path).then(
      (snapshot) => {
        console.log(snapshot.totalBytes + ' bytes transferred');
        storageRef.getDownloadURL().then((url) => {
          LocalData.user.profilePic = url;
          LocalData.user.picIsCustom = true;
          console.log('User profile pic updated');
          updatePicUrlForGroup(LocalData.currentGroup.groupId).then(() => {
            if (LocalData.home != null) {
              LocalData.home.forceUpdate();
            }
            if (this._mounted) {
              this.forceUpdate();
            }
            LocalData.isCamera = false;
          });
        });
      },
      (error) => console.warn(error),
    );
  }

  render() {
    return (
      <Layout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Button
            style={[Styles.button, Styles.bottomButton]}
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
                        (image) => this.processImage(image),
                        (error) => {
                          LocalData.isCamera = false;
                          console.warn(error.message);
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
                        (image) => this.processImage(image),
                        (error) => {
                          LocalData.isCamera = false;
                          console.warn(error.message);
                        },
                      );
                    },
                  },
                ],
                {cancelable: true},
              );
            }}>
            <Avatar
              style={Styles.avatar}
              size="giant"
              source={{uri: LocalData.user.profilePic}}
              shape="round"
            />
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
    marginBottom: 50,
    marginTop: 80,
  },
  button: {
    margin: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
});
