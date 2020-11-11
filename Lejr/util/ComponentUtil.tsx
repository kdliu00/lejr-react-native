import React, {Component, Fragment} from 'react';
import {Layout, withStyles, Text} from '@ui-kitten/components';
import {RectButton, ScrollView} from 'react-native-gesture-handler';
import Slider from '@react-native-community/slider';
import NewItem from '../screens/dashboard/Contribution/NewItem';
import {LocalData} from './LocalData';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {MergeState, nearestHundredth} from './UtilityMethods';
import Animated from 'react-native-reanimated';

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
  const {eva, style, animStyle, ...restProps} = props;

  return (
    <Animated.View {...restProps} style={[{flex: 1}, animStyle]}>
      <RectButton {...restProps} style={[eva.style.container, style]}>
        <Text style={eva.style.text}>{restProps.renderLabel}</Text>
      </RectButton>
    </Animated.View>
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
  overrideBackgroundColor(eva, props);

  return <ScrollView {...restProps} style={[eva.style.container, style]} />;
};
const ThemedScroll = withStyles(ScrollWrapper, theme => ({
  container: {
    backgroundColor: theme['background-basic-color-1'],
  },
}));

const CardWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;
  overrideBackgroundColor(eva, props);

  return <RectButton {...restProps} style={[eva.style.container, style]} />;
};
const ThemedCard = withStyles(CardWrapper, theme => ({
  container: {
    backgroundColor: theme['color-primary-100'],
  },
}));

const SliderWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  if (props.customColor) {
    eva.style.container.trackTint = eva.theme[props.customColor];
    eva.style.container.knobColor = eva.theme[props.customColor];
  }

  return (
    <Slider
      {...restProps}
      minimumTrackTintColor={eva.style.container.trackTint}
      thumbTintColor={eva.style.container.knobColor}
      maximumTrackTintColor="gray"
      style={style}
    />
  );
};
const ThemedSlider = withStyles(SliderWrapper, theme => ({
  container: {
    trackTint: theme['color-primary-500'],
    knobColor: theme['color-primary-500'],
  },
}));

class SplitSlider extends Component {
  userId: string;
  objectInstance: NewItem;
  displayPercent: number;
  passProps: any;
  default: boolean;
  label: SliderLabel;

  constructor(props: Readonly<{}>) {
    super(props);
    this.passProps = this.props as any;
    this.userId = this.passProps.userId;
    this.objectInstance = this.passProps.objectInstance;
  }

  componentDidMount() {
    if (this.objectInstance.sliderDefault[this.userId] == null) {
      this.objectInstance.sliderDefault[this.userId] = true;
    }
    this.objectInstance.sliderObjects.push(this);
    this.forceUpdate();
  }

  updatePercent(value: number) {
    if (this.objectInstance.sliderDefault[this.userId]) {
      this.objectInstance.sliderDefault[this.userId] = false;
      this.forceUpdate();
    }
    this.objectInstance.itemSplitPercent[this.userId] = value;
    this.label.forceUpdate();
  }

  render() {
    return (
      <ThemedLayout style={this.passProps.sliderContainer}>
        <SliderLabel parent={this} />
        <ThemedSlider
          {...this.passProps}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={this.objectInstance.itemSplitPercent[this.userId]}
          customColor={
            this.objectInstance.sliderDefault[this.userId]
              ? 'color-basic-500'
              : ''
          }
          style={this.passProps.sliderStyle}
          onValueChange={(value: number) => {
            this.updatePercent(value);
          }}
          onSlidingComplete={this.passProps.sliderCallback.bind(
            this.objectInstance,
          )}
        />
      </ThemedLayout>
    );
  }
}

interface SliderLabelProps {
  parent: SplitSlider;
}

class SliderLabel extends Component<SliderLabelProps> {
  parent: SplitSlider;

  constructor(props: any) {
    super(props);
    this.parent = this.props.parent;
  }

  componentDidMount() {
    this.parent.label = this;
  }

  render() {
    return (
      <ThemedLayout style={this.parent.passProps.sliderLabel}>
        <Text>
          {LocalData.currentGroup.members[this.parent.userId].name +
            ' pays ' +
            nearestHundredth(
              this.parent.objectInstance.itemSplitPercent[this.parent.userId],
            ) +
            '%'}
        </Text>
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

function overrideBackgroundColor(eva: any, props: any) {
  if (props.customBackground) {
    eva.style.container.backgroundColor = eva.theme[props.customBackground];
  }
}
