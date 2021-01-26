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
import {Screen} from '../../../util/Constants';
import {BlankCard, ItemCard} from '../../../util/ContributionUI';
import {
  getMoneyFormatString,
  getTotal,
  removeNullsFromList,
  StoreData,
} from '../../../util/UtilityMethods';
import {
  AddCircleIcon,
  TrashIcon,
  SaveIcon,
  BackIcon,
  CameraIcon,
} from '../../../util/Icons';
import {Item} from '../../../util/DataObjects';

export default class Contribution extends Component {
  constructor() {
    super();
    this.totalRef = React.createRef();
  }

  componentDidMount() {
    console.log('Arrived at Contribution');
    LocalData.container = this;
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
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
                Tap the camera icon to scan your receipt.{'\n\n'}Tap the plus
                icon to add items manually.
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
            {LocalData.currentVR ? (
              <IconButton
                style={Styles.button}
                status="basic"
                icon={BackIcon}
                onPress={() => this.props.navigation.goBack()}
              />
            ) : (
              <IconButton
                status="danger"
                icon={TrashIcon}
                onPress={() =>
                  Alert.alert(
                    'Discard Purchase',
                    'Are you sure you want to discard this purchase?',
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
            )}
            <IconButton
              icon={AddCircleIcon}
              onPress={() => {
                LocalData.items = removeNullsFromList(LocalData.items);
                this.props.navigation.navigate(Screen.NewItem, {
                  item: new Item(null, null, null, null),
                  vrIndex: null,
                });
              }}
            />
            <IconButton
              status="info"
              icon={CameraIcon}
              onPress={() => {
                LocalData.items = removeNullsFromList(LocalData.items);
                this.props.navigation.navigate(Screen.FromImage);
              }}
            />
            <IconButton
              status="success"
              icon={SaveIcon}
              onPress={() => {
                LocalData.items = removeNullsFromList(LocalData.items);
                this.props.navigation.navigate(Screen.ContribDetails);
              }}
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
        Subtotal: {getMoneyFormatString(getTotal(filterItemCosts()))}
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
  placeholderText: {
    textAlign: 'center',
    marginHorizontal: 30,
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
