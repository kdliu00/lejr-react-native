import React from 'react';
import {Layout, List, withStyles, Text, Icon} from '@ui-kitten/components';
import {
  RectButton,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import Slider from '@react-native-community/slider';
import NewItem from '../screens/dashboard/Contribution/NewItem';
import {LocalData} from './LocalData';
import Swipeable from 'react-native-gesture-handler/Swipeable';

export {
  ThemedLayout,
  ThemedList,
  ThemedCard,
  ThemedSlider,
  SplitSlider,
  CustomSwipeable,
  DangerSwipe,
};

const RemoveIcon = props => <Icon name="close-outline" {...props} />;

const RectButtonWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  return (
    <RectButton {...restProps} style={[eva.style.container, style]}>
      <Text style={eva.style.text}>Swipe to delete</Text>
    </RectButton>
  );
};
const DangerSwipe = withStyles(RectButtonWrapper, theme => ({
  container: {
    backgroundColor: theme['color-danger-500'],
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  text: {
    color: theme['background-basic-color-3'],
  },
}));

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
    <TouchableWithoutFeedback
      {...restProps}
      style={[eva.style.container, style]}
    />
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
    <ThemedLayout style={props.sliderContainer}>
      <ThemedLayout style={props.sliderLabel}>
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

class CustomSwipeable extends Swipeable {
  close = () => {
    const {onSwipeableWillClose, onSwipeableClose} = this.props;
    const {dragX, rowTranslation} = this.state as any;
    dragX.setValue(0);
    rowTranslation.setValue(0);
    this.setState({rowState: Math.sign(0)});
    if (onSwipeableWillClose) {
      onSwipeableWillClose();
    }
    if (onSwipeableClose) {
      onSwipeableClose();
    }
  };
}
