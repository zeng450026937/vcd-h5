import rtc from '../../rtc';
import kom from '..';

const ID_PATH = [ 'node', 'id' ];
const PID_PATH = [ 'node', 'parentId' ];
const NODE_TYPE_PATH = [ 'node', 'type' ];

const LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

const groupMap = {
  'phone.book.staff.root.name' : {
    name   : '联系人',
    isUser : true,
  },
  'phone.book.device.root.name' : {
    name     : '会议室设备',
    isDevice : true,
  },
  'phone.book.externalcontacts.root.name' : {
    name       : '其他联系人',
    isExternal : true,
  },
  'phone.book.vmr.root.name' : {
    name  : '虚拟会议室',
    isVMR : true,
  },
  'phone.book.servicenumber.root.name' : {
    name      : '服务号',
    isService : true,
  },
  'phone.book.favoritecontacts.root.name' : {
    name       : '常用联系人',
    isFavorite : true,
  },
};

export default class Store {
  constructor(tree = [], loadMode = LOAD_MODE.OVERALL) {
    this.loadMode = loadMode;
    this.generate(tree);
  }

  destroy() {
    this.tree = [];
    this.originTree = [];
    this.nodeMap = {};
    this.parentMap = {};
    this.offspringMap = {};
  }

  generate(tree) {
    if (!Array.isArray(tree)) return;

    console.time('generate contact model cost time');
    this.tree = [];
    this.originTree = tree;
    this.asyncMap = {};
    this.genTree();
    this.genAmount();
    this.genRootGroup();
    console.timeEnd('generate contact model cost time');
  }

  getAsyncData(id) {
    return this.asyncMap[id];
  }

  updateAsyncData(id, data) {
    if (this.asyncMap[id]) return this.asyncMap[id];

    this.originTree.push(...data);

    data.forEach((n) => {
      this.formatContact(n);
      this.addParentMap(this.parentMap, n);
      this.addNodeMap(this.nodeMap, n);
    });

    this.genRootGroup(true);

    this.asyncMap[id] = data;

    return data;
  }

  update(tree) {
    this.destroy();
    this.generate(tree);

    return this;
  }

  get rootGroup() {
    return this.parentMap[this.getNodeId(this.rootNode)] || [];
  }

  get rootNode() {
    return this.nodeMap.rootNode || {};
  }

  clone(data) {
    return JSON.parse(JSON.stringify(data)); // 小数据用
  }

  genRootGroup(regenerate = false) {
    this.rootGroup.forEach((n) => {
      if (!groupMap.hasOwnProperty(n.attributes.name)) return;

      const groupInfo = this.clone(groupMap[n.attributes.name]);

      Object.assign(n, groupInfo);
      delete groupInfo.name;
      const offspring = this.genOffspring(this.getNodeId(n), regenerate);

      offspring.forEach((i) => {
        Object.assign(i, groupInfo);
      });
    });

    if (this.rootNode.attributes && groupMap.hasOwnProperty(this.rootNode.attributes.name)) {
      Object.assign(this.rootNode, groupMap[this.rootNode.attributes.name]);
    }
  }

  genTree() {
    const { nodeMap, parentMap } = this.genTreeMap();

    this.nodeMap = nodeMap;
    this.parentMap = parentMap;
    this.offspringMap = {};
    this.rootNode.isRoot = true;
    this.tree.push(this.rootNode);
  }

  genAmount() {
    if (this.loadMode === LOAD_MODE.SPLIT) return;

    this.originTree.forEach((n) => {
      const id = this.getNodeId(n);

      if (n.isGroup) {
        n.amount = this.getAmount(id);
      }
    });
  }

  formatContact(node) {
    node.isGroup = /ORG/.test(node.node.type);
    node.name = node.attributes.name || '';
    node.number = node.attributes.number || '';
    if (!node.isGroup) {
      node.nick = /^(.*)\(.*\)$/.test(node.name) ? RegExp.$1.substr(-2, 2) : node.name.substr(-2, 2);
    }
    else {
      node.amount = 0;
    }

    if (node.number === rtc.account.username) {
      node.isSelf = true;
      kom.vm.contact.currentContact = node;
    }
    node.phone = node.attributes.extension || '';
    node.email = node.attributes.email || '';
    node.id = node.node.id;
    node.parentId = node.node.parentId;
    node.amount = node.attributes.amount || 0;

    return node;
  }

  genTreeMap() {
    const nodeMap = {};
    const parentMap = {};

    this.originTree.forEach((n) => {
      try {
        this.formatContact(n);
        this.addNodeMap(nodeMap, n);
        this.addParentMap(parentMap, n);
      }
      catch (e) {
        console.log(e);
      }
    });

    return {
      nodeMap,
      parentMap,
    };
  }

  addNodeMap(map, node) {
    const id = this.getNodeId(node);
    const pid = this.getParentId(node);

    if (pid == null) map.rootNode = node;

    if (!map[id]) {
      map[id] = node;
    }
    else { // yms 一个节点可能存在多个分组下，后端返回多个相同 id，不同pid的节点
      map[`${id}-${pid}`] = node;
    }
  }

  addParentMap(map, node) {
    const pid = this.getParentId(node);

    if (!pid) return;

    if (Array.isArray(map[pid])) {
      map[pid].push(node);
    }
    else {
      map[pid] = [ node ];
    }
  }

  getChild(id) {
    return this.parentMap[id];
  }

  getNodeByNumber(number) {
    this.originTree.find((n) => n.number === number);
  }

  findBranch(node, branch = []) {
    const { id, parentId } = node;
    const parent = this.findParentNode(id, parentId);

    if (parent == null) return branch;
    branch.push(parent);

    return this.findBranch(parent, branch);
  }

  getNode(id, parentId) {
    return this.nodeMap[`${id}-${parentId}`] || this.nodeMap[id];
  }

  getAmount(id) {
    return this.getOffspringNoGroup(id).length;
  }

  getNodeId(node) {
    if (!node || !node.node) return null;

    return node.node.id;
  }

  getParentId(node) {
    if (!node || !node.node) return null;

    return node.node.parentId;
  }

  getNodeType(node) {
    if (!node || !node.node) return null;

    return node.node.type;
  }

  findNodeIndex(node) {
    return this.tree.findIndex((i) => this.getNodeId(i) === this.getNodeId(node));
  }


  findParentNode(id, pid) {
    if (pid) return this.getNode(pid);

    const node = this.getNode(id);

    return this.getNode(this.getParentId(node));
  }

  genOffspring(id, regenerate = false) {
    let offspring = this.offspringMap[id];

    if (offspring == null || regenerate) offspring = this.getOffspring(id);

    return this.offspringMap[id] = offspring;
  }

  getOffspring(id, offsprings = []) {
    const childes = this.getChild(id);

    if (childes == null) return offsprings;

    offsprings.push(...childes);

    childes.forEach((node) => {
      this.getOffspring(node.node.id, offsprings);
    });

    return offsprings;
  }

  getOffspringNoGroup(id) {
    let offspring = this.offspringMap[id];

    if (offspring == null) offspring = this.getOffspring(id);

    return offspring.filter((n) => !n.isGroup);
  }

  isGroup(node) {
    const type = this.getNodeType(node);

    return type.indexOf('ORG') > -1;
  }
}
