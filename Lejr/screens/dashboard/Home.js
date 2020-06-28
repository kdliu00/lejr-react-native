import React from 'react';
import {View, Button, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Home({navigation}) {
  console.log('Arrived at Home!');

  return (
    <View style={styles.container}>
      <Button
        title="Sign out"
        onPress={() => {
          auth()
            .signOut()
            .then(() => console.log('User signed out!'));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
