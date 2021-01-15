import React, {Component, Fragment} from 'react';
import {StyleSheet, SafeAreaView, Dimensions, Alert} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
import {ThemedLayout, ThemedScroll} from '../../../util/ComponentUtil';
import {
  deleteAllItems,
  filterItemCosts,
  getKeyForCurrentGroupItems,
  LocalData,
} from '../../../util/LocalData';
import {Item} from '../../../util/DataObjects';
import {BannerHeight, Screen} from '../../../util/Constants';
import {BlankCard, ItemCard} from '../../../util/ContributionUI';
import {
  getMoneyFormatString,
  getTotal,
  removeNullsFromList,
  StoreData,
} from '../../../util/UtilityMethods';

const AddIcon = props => <Icon name="plus-outline" {...props} />;
const RestartIcon = props => <Icon name="refresh-outline" {...props} />;
const SaveIcon = props => <Icon name="save-outline" {...props} />;
const ArrowIcon = props => <Icon name="arrowhead-right-outline" {...props} />;

export default class Contribution extends Component {
  constructor() {
    super();
    this.totalRef = React.createRef();
  }

  componentDidMount() {
    console.log('Arrived at Contribution');
    LocalData.container = this;
  }

  render() {
    if (LocalData.items == null) {
      LocalData.items = [];
      StoreData(getKeyForCurrentGroupItems(), LocalData.items);
    }
    return (
      <ThemedLayout style={Styles.container}>
        <SafeAreaView style={Styles.container}>
          <ThemedLayout style={Styles.banner}>
            <TotalText ref={this.totalRef} />
          </ThemedLayout>
          {LocalData.items.length !== 0 && (
            <Text appearance="hint" style={Styles.placeholderText}>
              Slide left to delete.
            </Text>
          )}
          <ThemedLayout style={Styles.itemList}>
            {LocalData.items.length === 0 ? (
              <Text appearance="hint" style={Styles.placeholderText}>
                To create individualized item splits, tap the plus icon or use
                the camera tab to scan a receipt.{'\n\n'}You can also Quick Add
                by tapping the double arrows in the lower right.
              </Text>
            ) : (
              <ThemedScroll
                style={Styles.list}
                contentContainerStyle={Styles.contentContainer}>
                {LocalData.items.map((item, index) => {
                  if (item != null) {
                    return (
                      <Fragment key={index}>
                        {new ItemCard({
                          item: item,
                          index: index,
                          totalRef: this.totalRef,
                          nav: this.props.navigation,
                        }).render()}
                      </Fragment>
                    );
                  }
                })}
                <BlankCard />
              </ThemedScroll>
            )}
          </ThemedLayout>
          <Layout style={Styles.banner}>
            <Button
              style={Styles.button}
              appearance="ghost"
              accessoryLeft={RestartIcon}
              onPress={() =>
                Alert.alert(
                  'Create New Purchase',
                  'Are you sure you want to create a new purchase? This will delete all current items and changes will not be saved.',
                  [
                    {
                      text: 'Yes',
                      onPress: () => {
                        console.log('Deleting all items');
                        deleteAllItems();
                      },
                    },
                    {
                      text: 'No',
                      onPress: () => console.log('Not deleting items'),
                      style: 'cancel',
                    },
                  ],
                  {cancelable: false},
                )
              }
              size="large"
            />
            <Button
              style={Styles.button}
              appearance="ghost"
              accessoryLeft={AddIcon}
              onPress={() =>
                this.props.navigation.navigate(Screen.NewItem, {
                  item: new Item('', null, {}, ''),
                })
              }
              size="large"
            />
            {removeNullsFromList(LocalData.items).length === 0 ? (
              <Button
                style={Styles.button}
                appearance="ghost"
                accessoryLeft={ArrowIcon}
                onPress={() => this.props.navigation.navigate(Screen.QuickAdd)}
                size="large"
              />
            ) : (
              <Button
                style={Styles.button}
                appearance="ghost"
                accessoryLeft={SaveIcon}
                onPress={() =>
                  this.props.navigation.navigate(Screen.ContribDetails)
                }
                size="large"
              />
            )}
          </Layout>
        </SafeAreaView>
      </ThemedLayout>
    );
  }
}

class TotalText extends Component {
  render() {
    return (
      <Text style={Styles.titleText} category="h4">
        Total: ${getMoneyFormatString(getTotal(filterItemCosts()))}
      </Text>
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
  titleText: {
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  banner: {
    height: BannerHeight,
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
    marginTop: 10,
  },
});
