import React, {Component} from 'react';
import {Layout, withStyles, Text} from '@ui-kitten/components';
import {RectButton, ScrollView} from 'react-native-gesture-handler';
import Slider from '@react-native-community/slider';
import NewItem from '../screens/dashboard/Contribution/NewItem';
import {LocalData} from './LocalData';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {MergeState} from './UtilityMethods';

export {
  ThemedLayout,
  ThemedScroll,
  ThemedCard,
  ThemedSlider,
  SplitSlider,
  CustomSwipeable,
  DangerSwipe,
  SuccessSwipe,
};

const RectButtonWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  return (
    <RectButton {...restProps} style={[eva.style.container, style]}>
      <Text style={eva.style.text}>{restProps.renderLabel}</Text>
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
const SuccessSwipe = withStyles(RectButtonWrapper, theme => ({
  container: {
    backgroundColor: theme['color-success-500'],
    flexDirection: 'row',
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

const ScrollWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  return (
    <ScrollView
      {...restProps}
      style={[
        eva.style.container,
        style,
        {
          backgroundColor: eva.theme[props.customBackground],
        },
      ]}
    />
  );
};
const ThemedScroll = withStyles(ScrollWrapper, theme => ({
  container: {
    backgroundColor: theme['background-basic-color-1'],
  },
}));

const CardWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  return (
    <RectButton
      {...restProps}
      style={[
        eva.style.container,
        style,
        {
          backgroundColor: eva.theme[props.customBackground],
        },
      ]}
    />
  );
};
const ThemedCard = withStyles(CardWrapper, theme => ({
  container: {
    backgroundColor: theme['color-primary-100'],
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

class SplitSlider extends Component {
  userId: string;
  objectInstance: NewItem;
  displayPercent: number;
  passProps: any;

  constructor(props: Readonly<{}>) {
    super(props);
    this.passProps = this.props as any;
    this.userId = this.passProps.userId;
    this.objectInstance = this.passProps.objectInstance;
    this.state = {
      displayPercent: this.passProps.value,
    };
  }

  componentDidMount() {
    this.updatePercent((this.state as any).displayPercent);
  }

  updatePercent(value: number) {
    this.objectInstance.itemSplitPercent[this.userId] = value;
  }

  render() {
    return (
      <ThemedLayout style={this.passProps.sliderContainer}>
        <ThemedLayout style={this.passProps.sliderLabel}>
          <Text>
            {LocalData.currentGroup.memberNames[this.userId] +
              ' pays ' +
              Math.round((this.state as any).displayPercent) +
              '%'}
          </Text>
        </ThemedLayout>
        <ThemedSlider
          {...this.passProps}
          style={this.passProps.sliderStyle}
          onValueChange={(value: number) => {
            this.updatePercent(value);
            MergeState(this, {displayPercent: value});
          }}
        />
      </ThemedLayout>
    );
  }
}

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
