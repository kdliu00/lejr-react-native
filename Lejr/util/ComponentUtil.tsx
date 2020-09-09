import React from 'react';
import {Layout, List, withStyles, Text} from '@ui-kitten/components';
import {TouchableOpacity} from 'react-native';
import Slider from '@react-native-community/slider';
import NewItem from '../screens/dashboard/Contribution/NewItem';
import {LocalData} from './LocalData';

export {ThemedLayout, ThemedList, ThemedCard, ThemedSlider, SplitSlider};

const LayoutWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  return <Layout {...restProps} style={[eva.style.container, style]} />;
};

const ThemedLayout = withStyles(LayoutWrapper, theme => ({
  container: {
    backgroundColor: theme['background-basic-color-1'],
  },
}));

const ListWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  return <List {...restProps} style={[eva.style.container, style]} />;
};

const ThemedList = withStyles(ListWrapper, theme => ({
  container: {
    backgroundColor: theme['background-basic-color-1'],
  },
}));

const CardWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  return (
    <TouchableOpacity {...restProps} style={[eva.style.container, style]} />
  );
};

const ThemedCard = withStyles(CardWrapper, theme => ({
  container: {
    backgroundColor: theme['background-basic-color-1'],
    borderColor: theme['color-basic-500'],
  },
}));

const SliderWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;
  const themeColor = eva.style.container.backgroundColor;

  return (
    <Slider
      {...restProps}
      minimumTrackTintColor={themeColor}
      thumbTintColor={themeColor}
      maximumTrackTintColor="#000000"
      style={style}
    />
  );
};

const ThemedSlider = withStyles(SliderWrapper, theme => ({
  container: {
    backgroundColor: theme['color-primary-500'],
  },
}));

const SplitSlider = (props: any) => {
  const userId: string = props.userId;
  const objectInstance: NewItem = props.objectInstance;
  const defaultPercent: number = props.value;

  return (
    <ThemedLayout>
      <ThemedLayout style={props.sliderContainerStyle}>
        <Text>
          {Object(LocalData.currentGroup.memberNames)[userId] +
            ' pays ' +
            (objectInstance.itemSplitPercent[userId] != null
              ? objectInstance.itemSplitPercent[userId]
              : defaultPercent) +
            '%'}
        </Text>
      </ThemedLayout>
      <ThemedSlider
        {...props}
        style={props.sliderStyle}
        onValueChange={(value: number) => {
          objectInstance.itemSplitPercent[userId] = value;
          objectInstance.forceUpdate();
        }}
      />
    </ThemedLayout>
  );
};
