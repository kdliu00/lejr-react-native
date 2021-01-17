import React, {Component, Fragment} from 'react';
import {StyleSheet, SafeAreaView, Dimensions, Alert} from 'react-native';
import {Layout, Text} from '@ui-kitten/components';
import {
  IconButton,
  ThemedLayout,
  ThemedScroll,
} from '../../../util/ComponentUtil';
import {
  deleteAllItems,
  filterItemCosts,
  getKeyForCurrentGroupItems,
  LocalData,
} from '../../../util/LocalData';
import {Item} from '../../../util/DataObjects';
import {Screen} from '../../../util/Constants';
import {BlankCard, ItemCard} from '../../../util/ContributionUI';
import {
  getMoneyFormatString,
  getTotal,
  StoreData,
} from '../../../util/UtilityMethods';
import {AddCircleIcon, TrashIcon, SaveIcon} from '../../../util/Icons';

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
            <IconButton
              style={Styles.button}
              status="danger"
              icon={TrashIcon}
              onPress={() =>
                Alert.alert(
                  'Delete Purchase',
                  'Are you sure you want to delete this purchase?',
                  [
                    {
                      text: 'Yes',
                      onPress: () => {
                        console.log('Deleting all items');
                        deleteAllItems();
                        this.props.navigation.navigate(Screen.Home);
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
            />
            <IconButton
              style={Styles.button}
              icon={AddCircleIcon}
              onPress={() =>
                this.props.navigation.navigate(Screen.NewItem, {
                  item: new Item('', null, {}, ''),
                })
              }
            />
            <IconButton
              style={Styles.button}
              status="success"
              icon={SaveIcon}
              onPress={() =>
                this.props.navigation.navigate(Screen.ContribDetails)
              }
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
    marginVertical: 10,
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
