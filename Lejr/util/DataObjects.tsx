export {User, GroupInfo, Group, VirtualReceipt, Item, Archive};

class User {
  userId: string;
  email: string;
  profilePic: string;
  name: string;
  groups: GroupInfo[];
  invites: Map<string, string>;

  constructor(
    userId: string,
    email: string,
    profilePic: string,
    name: string,
    groups: GroupInfo[],
    invites: Map<string, string>,
  ) {
    this.userId = userId;
    this.email = email;
    this.profilePic = profilePic;
    this.name = name;
    this.groups = nullHandler(groups, []);
    this.invites = nullHandler(invites, new Map());
  }

  static firestoreConverter = {
    toFirestore: function(user: User) {
      return {
        userId: user.userId,
        email: user.email,
        profilePic: user.profilePic,
        name: user.name,
        groups: user.groups,
        invites: user.invites,
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
        data.invites,
      );
    },
  };
}

class GroupInfo {
  groupId: string;
  groupName: string;

  constructor(groupId: string, groupName: string) {
    this.groupId = groupId;
    this.groupName = groupName;
  }

  static firestoreConverter = {
    toFirestore: function(groupInfo: GroupInfo) {
      return {
        groupId: groupInfo.groupId,
        groupName: groupInfo.groupName,
      };
    },
    fromFirestore: function(snapshot) {
      const data = snapshot.data();
      return new GroupInfo(data.groupId, data.groupName);
    },
  };
}

class Group {
  groupId: string;
  groupName: string;
  members: Map<string, number>;
  virtualReceipts: VirtualReceipt[];
  archives: string[];

  constructor(
    groupId: string,
    groupName: string,
    members: Map<string, number>,
    virtualReceipts: VirtualReceipt[],
    archives: string[],
  ) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.members = nullHandler(members, new Map());
    this.virtualReceipts = nullHandler(virtualReceipts, []);
    this.archives = nullHandler(archives, []);
  }

  static firestoreConverter = {
    toFirestore: function(group: Group) {
      return {
        groupId: group.groupId,
        groupName: group.groupName,
        members: group.members,
        virtualReceipts: group.virtualReceipts,
        archives: group.archives,
      };
    },
    fromFirestore: function(snapshot) {
      const data = snapshot.data();
      return new Group(
        data.groupId,
        data.groupName,
        data.members,
        data.virtualReceipts,
        data.archives,
      );
    },
  };
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
    this.items = nullHandler(items, []);
    this.total = total;
    this.totalSplit = nullHandler(totalSplit, new Map());
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
    this.itemSplit = nullHandler(itemSplit, new Map());
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
    this.virtualReceipts = nullHandler(virtualReceipts, []);
    this.endBalances = nullHandler(endBalances, new Map());
  }
}

/**
 * Handles null properties when the firestore property is empty
 * @param property The property to handle
 * @param ifNull What to return if property is null
 */
function nullHandler(property: any, ifNull: any) {
  return property ? property : ifNull;
}
