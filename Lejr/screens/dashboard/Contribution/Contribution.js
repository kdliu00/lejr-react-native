import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, Dimensions, Alert} from 'react-native';
import {Layout, Text, Button, Icon} from '@ui-kitten/components';
import {ThemedLayout, ThemedScroll} from '../../../util/ComponentUtil';
import {getKeyForCurrentGroupItems, LocalData} from '../../../util/LocalData';
import {Item} from '../../../util/DataObjects';
import {BannerHeight, Screen} from '../../../util/Constants';
import {ItemCard} from '../../../util/ContributionUI';
import {StoreData} from '../../../util/UtilityMethods';

const AddIcon = props => <Icon name="plus-outline" {...props} />;
const TrashIcon = props => <Icon name="trash-2-outline" {...props} />;
const SaveIcon = props => <Icon name="cloud-upload-outline" {...props} />;

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
          <ThemedLayout style={Styles.itemList}>
            {LocalData.items.length === 0 ? (
              <Text appearance="hint" style={Styles.placeholderText}>
                Click on the plus button below to add an item
              </Text>
            ) : (
              <ThemedScroll
                style={Styles.list}
                contentContainerStyle={Styles.contentContainer}>
                {LocalData.items.map((item, index) => {
                  if (item != null) {
                    return (
                      <ItemCard
                        key={index}
                        item={item}
                        index={index}
                        totalRef={this.totalRef}
                      />
                    );
                  }
                })}
              </ThemedScroll>
            )}
          </ThemedLayout>
          <Layout style={Styles.banner}>
            <Button
              style={Styles.button}
              appearance="ghost"
              accessoryLeft={TrashIcon}
              onPress={() =>
                Alert.alert(
                  'Delete All Items',
                  'Are you sure you want to delete all items? This action cannot be undone.',
                  [
                    {
                      text: 'Yes',
                      onPress: () => {
                        console.log('Deleting all items');
                        LocalData.items = [];
                        StoreData(
                          getKeyForCurrentGroupItems(),
                          LocalData.items,
                        );
                        LocalData.container.forceUpdate();
                      },
                      style: 'cancel',
                    },
                    {
                      text: 'No',
                      onPress: () => console.log('Not deleting items'),
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
              onPress={() => {
                this.props.navigation.push(Screen.NewItem, {
                  item: new Item('', 0, {}),
                });
              }}
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

class TotalText extends Component {
  render() {
    return (
      <Text style={Styles.titleText} category="h4">
        Total: $
        {LocalData.items
          .map(item => {
            return item ? item.itemCost : 0;
          })
          .reduce((a, b) => a + b, 0)}
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
  },
});
