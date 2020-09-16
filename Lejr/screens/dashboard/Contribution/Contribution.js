import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, Dimensions} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
import {ThemedLayout, ThemedScroll} from '../../../util/ComponentUtil';
import {LocalData} from '../../../util/LocalData';
import {Item} from '../../../util/DataObjects';
import {Screen} from '../../../util/Constants';
import {ItemCard} from '../../../util/ContributionUI';

const AddIcon = props => <Icon name="plus-outline" {...props} />;
const TrashIcon = props => <Icon name="trash-2-outline" {...props} />;
const SaveIcon = props => <Icon name="cloud-upload-outline" {...props} />;

export default class Contribution extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    console.log('Arrived at Contribution');
  }

  render() {
    if (LocalData.items == null) {
      LocalData.items = [
        new Item('first', 12, {yoink: 100}),
        new Item('second', 23, {yoink: 100}),
        new Item('third', 34, {yoink: 100}),
        new Item('fourth', 345, {yoink: 100}),
        new Item('fifth', 22, {yoink: 100}),
        new Item('sixth', 11, {yoink: 100}),
        new Item('seventh', 2.1, {yoink: 100}),
        new Item('eighth', 22.3, {yoink: 100}),
        new Item('ninth', 4.1, {yoink: 100}),
        new Item('tenth', 1, {yoink: 100}),
        new Item('eleventh', 3, {yoink: 100}),
        new Item('twelfth', 12, {yoink: 100}),
      ];
    }
    return (
      <ThemedLayout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Layout style={Styles.itemList}>
            {LocalData.items.length === 0 ? (
              <Text appearance="hint" style={Styles.placeholderText}>
                Click on the plus button below to add an item
              </Text>
            ) : (
              <ThemedScroll
                style={Styles.list}
                contentContainerStyle={Styles.contentContainer}>
                {LocalData.items.map((item, index) => {
                  return <ItemCard key={index} item={item} index={index} />;
                })}
              </ThemedScroll>
            )}
          </Layout>
          <Layout style={Styles.actionButtons}>
            <Button
              style={Styles.button}
              appearance="ghost"
              accessoryLeft={TrashIcon}
              size="large"
            />
            <Button
              style={Styles.button}
              appearance="ghost"
              accessoryLeft={AddIcon}
              onPress={() =>
                this.props.navigation.navigate(Screen.NewItem, {
                  item: new Item('', 0, {}),
                })
              }
              size="large"
            />
            <Button
              style={Styles.button}
              appearance="ghost"
              accessoryLeft={SaveIcon}
              size="large"
            />
          </Layout>
        </SafeAreaView>
      </ThemedLayout>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  itemList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  button: {
    flex: 1,
  },
  placeholderText: {
    textAlign: 'center',
    marginHorizontal: 20,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  list: {
    width: Dimensions.get('window').width,
    flex: 1,
  },
});
