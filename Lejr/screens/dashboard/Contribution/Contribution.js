import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, Dimensions} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
import {ThemedLayout, ThemedList} from '../../../util/ComponentUtil';
import {isPossibleObjectEmpty, LocalData} from '../../../util/LocalData';
import {VirtualReceipt, Item} from '../../../util/DataObjects';
import {Screen} from '../../../util/Constants';
import {ItemCard} from '../../../util/ContributionUI';

const AddIcon = props => <Icon name="plus-outline" {...props} />;
const TrashIcon = props => <Icon name="trash-2-outline" {...props} />;
const SaveIcon = props => <Icon name="cloud-upload-outline" {...props} />;

export default class Contribution extends Component {
  constructor() {
    super();
    if (LocalData.virtualReceipt == null) {
      LocalData.virtualReceipt = new VirtualReceipt(
        LocalData.user.userId,
        '',
        '',
        '',
        Date.now(),
        [],
        0,
        new Map(),
        '',
      );
    }
  }

  componentDidMount() {
    console.log('Arrived at Contribution');
    this.props.navigation.addListener('focus', () => {
      this.forceUpdate();
    });
  }

  render() {
    return (
      <ThemedLayout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <Layout style={Styles.itemList}>
            {LocalData.virtualReceipt.items.length === 0 ? (
              <Text appearance="hint" style={Styles.placeholderText}>
                Click on the plus button below to add an item
              </Text>
            ) : (
              <ThemedList
                style={Styles.list}
                contentContainerStyle={Styles.contentContainer}
                data={LocalData.virtualReceipt.items}
                renderItem={ItemCard}
              />
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
