import React, {Component, Fragment} from 'react';
import {StyleSheet, SafeAreaView, Dimensions, Alert} from 'react-native';
import {Card, Layout, Modal, Text} from '@ui-kitten/components';
import {
  IconButton,
  ThemedLayout,
  ThemedScroll,
} from '../../../util/ComponentUtil';
import {
  deleteAllItems,
  filterItemCosts,
  getKeyForCurrentGroupItems,
  getTax,
  LocalData,
} from '../../../util/LocalData';
import {Screen} from '../../../util/Constants';
import {BlankCard, ItemCard} from '../../../util/ContributionUI';
import {
  getMoneyFormatString,
  getTotal,
  MergeState,
  nearestHundredth,
  removeNullsFromList,
  StoreData,
} from '../../../util/UtilityMethods';
import {
  AddCircleIcon,
  TrashIcon,
  SaveIcon,
  BackIcon,
  CameraIcon,
  CloseIcon,
  ConfirmIcon,
} from '../../../util/Icons';
import {Item} from '../../../util/DataObjects';
import {TextInput} from 'react-native-gesture-handler';

export default class Contribution extends Component {
  constructor() {
    super();
    this.totalRef = React.createRef();
    this.state = {
      taxModal: false,
    };
    this.tempTax = 0;
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
            <Layout style={Styles.row}>
              <Text
                style={Styles.subtitle}
                onPress={() => {
                  this.tempTax = getTax(LocalData.currentVR);
                  MergeState(this, {taxModal: true});
                }}>
                Tax: {getMoneyFormatString(getTax(LocalData.currentVR))}
              </Text>
            </Layout>
          </ThemedLayout>
          <Modal
            visible={this.state.taxModal}
            backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
            onBackdropPress={() => {
              this.tempTax = getTax(LocalData.currentVR);
              MergeState(this, {taxModal: false});
            }}>
            <Card
              disabled={true}
              style={{justifyContent: 'center', borderRadius: 8}}>
              <Text>Please enter the correct tax amount.</Text>
              <TextInput
                style={{textAlign: 'center'}}
                keyboardType="numeric"
                onChangeText={text => {
                  this.tempTax = nearestHundredth(parseFloat(text));
                }}
                onSubmitEditing={() => {
                  LocalData.tax = this.tempTax;
                  if (LocalData.currentVR) {
                    LocalData.currentVR.tax = LocalData.tax;
                  }
                  MergeState(this, {taxModal: false});
                }}
                autoFocus
              />
              <Layout style={Styles.row}>
                <IconButton
                  status="danger"
                  icon={CloseIcon}
                  onPress={() => MergeState(this, {taxModal: false})}
                />
                <IconButton
                  status="success"
                  icon={ConfirmIcon}
                  onPress={() => {
                    LocalData.tax = this.tempTax;
                    if (LocalData.currentVR) {
                      LocalData.currentVR.tax = LocalData.tax;
                    }
                    MergeState(this, {taxModal: false});
                  }}
                />
              </Layout>
            </Card>
          </Modal>

          {LocalData.items.length !== 0 && (
            <Text appearance="hint" style={Styles.placeholderText}>
              Swipe left to delete. Tap on tax to edit.
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
          <Layout style={[Styles.banner, Styles.row]}>
            {LocalData.currentVR ? (
              <IconButton
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
        Total:{' '}
        {getMoneyFormatString(
          parseFloat(getTotal(filterItemCosts())) +
            parseFloat(getTax(LocalData.currentVR)),
        )}
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
  },
  row: {
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
  subtitle: {
    marginTop: 5,
    marginBottom: -5,
  },
});
