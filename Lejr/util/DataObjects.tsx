import {raw} from 'core-js/fn/string';

export {User, GroupInfo, InviteInfo, Group, MemberInfo, VirtualReceipt, Item};

class User {
  userId: string;
  email: string;
  profilePic: string;
  name: string;
  groups: GroupInfo[];

  constructor(
    userId: string,
    email: string,
    profilePic: string,
    name: string,
    groups: GroupInfo[],
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
    fromFirestore: function(snapshot: {data: () => any}) {
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
  members: Map<string, MemberInfo>;
  archives: string[];
  lastSettleDate: number;
  settler: string;
  settleLocks: Map<string, boolean>;

  constructor(
    groupId: string,
    groupName: string,
    members: Map<string, MemberInfo>,
    archives: string[],
    lastSettleDate: number,
    settler: string,
    settleLocks: Map<string, boolean>,
  ) {
    this.groupId = groupId;
    this.groupName = groupName;
    this.members = members;
    this.archives = archives;
    this.lastSettleDate = lastSettleDate;
    this.settler = settler;
    this.settleLocks = settleLocks;
  }

  static firestoreConverter = {
    toFirestore: function(group: Group) {
      return {
        groupId: group.groupId,
        groupName: group.groupName,
        members: group.members,
        archives: group.archives,
        lastSettleDate: group.lastSettleDate,
        settler: group.settler,
        settleLocks: group.settleLocks,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new Group(
        data.groupId,
        data.groupName,
        data.members,
        data.archives,
        data.lastSettleDate,
        data.settler,
        data.settleLocks,
      );
    },
  };
}

class MemberInfo {
  balance: number;
  name: string;

  constructor(balance: number, name: string) {
    this.balance = balance;
    this.name = name;
  }

  static firestoreConverter = {
    toFirestore: function(memberInfo: MemberInfo) {
      return {
        balance: memberInfo.balance,
        name: memberInfo.name,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new MemberInfo(data.balance, data.name);
    },
  };
}

class VirtualReceipt {
  buyerId: string;
  virtualReceiptId: string;
  memo: string;
  timestamp: number;
  items: Item[];
  total: number;
  totalSplit: Map<string, number>;
  receiptImage: string;

  constructor(
    buyerId: string,
    virtualReceiptId: string,
    memo: string,
    timestamp: number,
    items: Item[],
    total: number,
    totalSplit: Map<string, number>,
    receiptImage: string,
  ) {
    this.buyerId = buyerId;
    this.virtualReceiptId = virtualReceiptId;
    this.memo = memo;
    this.timestamp = timestamp;
    this.items = items;
    this.total = total;
    this.totalSplit = totalSplit;
    this.receiptImage = receiptImage;
  }

  static firestoreConverter = {
    toFirestore: function(vr: VirtualReceipt) {
      return {
        buyerId: vr.buyerId,
        virtualReceiptId: vr.virtualReceiptId,
        memo: vr.memo,
        timestamp: vr.timestamp,
        items: vr.items,
        total: vr.total,
        totalSplit: vr.totalSplit,
        receiptImage: vr.receiptImage,
      };
    },
    fromFirestore: function(snapshot: {data: () => any}) {
      const data = snapshot.data();
      return new VirtualReceipt(
        data.buyerId,
        data.virtualReceiptId,
        data.memo,
        data.timestamp,
        data.items,
        data.total,
        data.totalSplit,
        data.receiptImage,
      );
    },
  };
}

class Item {
  itemName: string;
  itemCost: number;
  itemSplit: Map<string, number>;
  rawText: string;
  sliderDefault: Map<string, boolean>;

  constructor(
    itemName: string,
    itemCost: number,
    itemSplit: Map<string, number>,
    rawText: string,
    sliderDefault: Map<string, boolean>,
  ) {
    this.itemName = itemName;
    this.itemCost = itemCost;
    this.itemSplit = itemSplit;
    this.rawText = rawText;
    this.sliderDefault = sliderDefault;
  }
}
