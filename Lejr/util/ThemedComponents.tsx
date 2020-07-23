import React from 'react';
import {Layout, withStyles} from '@ui-kitten/components';

export {ThemedLayout};

const LayoutWrapper = (props: any) => {
  const {eva, style, ...restProps} = props;

  return <Layout {...restProps} style={[eva.style.container, style]} />;
};

const ThemedLayout = withStyles(LayoutWrapper, theme => ({
  container: {
    backgroundColor: theme['background-basic-color-2'],
  },
}));
