export {User, Group, VirtualReceipt, Item, Archive};

class User {
  userId: string;
  email: string;
  profilePic: string;
  name: string;
  groups: string[];

  constructor(
    userId: string,
    email: string,
    profilePic: string,
    name: string,
    groups: string[],
  ) {
    this.userId = userId;
    this.email = email;
    this.profilePic = profilePic;
    this.name = name;
    this.groups = groups;
  }

  static firestoreConverter = {
    toFirestore: function(user: User) {
      return {
        userId: user.userId,
        email: user.email,
        profilePic: user.profilePic,
        name: user.name,
        groups: user.groups,
      };
    },
    fromFirestore: function(snapshot) {
      const data = snapshot.data();
      return new User(
        data.userId,
        data.email,
        data.profilePic,
        data.name,
        data.groups,
      );
    },
  };
}

class Group {
  groupName: string;
  members: Map<string, number>;
  virtualReceipts: VirtualReceipt[];
  archives: string[];

  constructor(
    groupName: string,
    members: Map<string, number>,
    virtualReceipts: VirtualReceipt[],
    archives: string[],
  ) {
    this.groupName = groupName;
    this.members = members;
    this.virtualReceipts = virtualReceipts;
    this.archives = archives;
  }
}

class VirtualReceipt {
  buyerId: string;
  virtualReceiptId: string;
  memo: string;
  storeName: string;
  dateAdded: Date;
  items: Item[];
  total: number;
  totalSplit: Map<string, number>;
  receiptImage: string;

  constructor(
    buyerId: string,
    virtualReceiptId: string,
    memo: string,
    storeName: string,
    dateAdded: Date,
    items: Item[],
    total: number,
    totalSplit: Map<string, number>,
    receiptImage: string,
  ) {
    this.buyerId = buyerId;
    this.virtualReceiptId = virtualReceiptId;
    this.memo = memo;
    this.storeName = storeName;
    this.dateAdded = dateAdded;
    this.items = items;
    this.total = total;
    this.totalSplit = totalSplit;
    this.receiptImage = receiptImage;
  }
}

class Item {
  itemName: string;
  itemCost: number;
  itemSplit: Map<string, number>;

  constructor(
    itemName: string,
    itemCost: number,
    itemSplit: Map<string, number>,
  ) {
    this.itemName = itemName;
    this.itemCost = itemCost;
    this.itemSplit = itemSplit;
  }
}

class Archive {
  dateStart: Date;
  dateEnd: Date;
  virtualReceipts: VirtualReceipt[];
  endBalances: Map<string, number>;

  constructor(
    dateStart: Date,
    dateEnd: Date,
    virtualReceipts: VirtualReceipt[],
    endBalances: Map<string, number>,
  ) {
    this.dateStart = dateStart;
    this.dateEnd = dateEnd;
    this.virtualReceipts = virtualReceipts;
    this.endBalances = endBalances;
  }
}
