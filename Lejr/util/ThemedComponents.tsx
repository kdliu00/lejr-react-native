import React from 'react';
import {Layout, List, withStyles} from '@ui-kitten/components';
import {TouchableOpacity} from 'react-native';

export {ThemedLayout, ThemedList, ThemedCard};

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
