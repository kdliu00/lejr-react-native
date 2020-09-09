export {User, GroupInfo, InviteInfo, Group, VirtualReceipt, Item, Archive};

class User {
  userId: string;
  email: string;
  profilePic: string;
  name: string;
  groups: GroupInfo[];
  invites: InviteInfo[];

  constructor(
    userId: string,
    email: string,
    profilePic: string,
    name: string,
    groups: GroupInfo[],
    invites: InviteInfo[],
  ) {
    this.userId = userId;
    this.email = email;
    this.profilePic = profilePic;
    this.name = name;
    this.groups = groups;
    this.invites = invites;
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
    fromFirestore: function(snapshot: {data: () => any}) {
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

class InviteInfo {
  fromName: string;
  groupId: string;
  groupName: string;

  constructor(fromName: string, groupId: string, groupName: string) {
    this.fromName = fromName;
    this.groupId = groupId;
    this.groupName = groupName;
  }

  static firestoreConverter = {
    toFirestore: function(groupInfo: InviteInfo) {
      return {
        fromName: groupInfo.fromName,
        groupId: groupInfo.groupId,
        groupName: groupInfo.groupName,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new InviteInfo(data.fromName, data.groupId, data.groupName);
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
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new GroupInfo(data.groupId, data.groupName);
    },
  };
}

class Group {
  groupId: string;
  groupName: string;
  members: Map<string, number>;
  memberNames: Map<string, string>;
  virtualReceipts: VirtualReceipt[];
  archives: string[];

  constructor(
    groupId: string,
    groupName: string,
    members: Map<string, number>,
    memberNames: Map<string, string>,
    virtualReceipts: VirtualReceipt[],
    archives: string[],
  ) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.members = members;
    this.memberNames = memberNames;
    this.virtualReceipts = virtualReceipts;
    this.archives = archives;
  }

  static firestoreConverter = {
    toFirestore: function(group: Group) {
      return {
        groupId: group.groupId,
        groupName: group.groupName,
        members: group.members,
        memberNames: group.memberNames,
        virtualReceipts: group.virtualReceipts,
        archives: group.archives,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new Group(
        data.groupId,
        data.groupName,
        data.members,
        data.memberNames,
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
