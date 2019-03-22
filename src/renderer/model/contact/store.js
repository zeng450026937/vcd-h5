import rtc from '../../rtc';

import { get } from 'lodash/fp';
import kom from '..';

const ID_PATH = 'node.id';
const PID_PATH = 'node.parentId';
const NODE_TYPE_PATH = 'node.type';

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

export default class TreeStore {
  constructor(tree = []) {
    this.generate(tree);
  }

  destroy() {
    this.tree = [];
    this.originTree = [];
    this.checkedMap = {};
    this.nodeMap = {};
    this.parentMap = {};
    this.offspringMap = {};
  }

  generate(tree) {
    if (!Array.isArray(tree)) return;

    console.time('generate tree cost time');
    this.tree = [];
    this.originTree = tree;
    this.checkedMap = {};
    this.genTree();
    this.genAmount();
    this.genRootGroup();
    console.timeEnd('generate tree cost time');
  }

  update(tree) {
    this.destroy();
    this.generate(tree);

    return this;
  }

  get rootGroup() {
    return this.parentMap[get(ID_PATH)(this.rootNode)] || [];
  }

  get rootNode() {
    return this.nodeMap.rootNode || {};
  }

  clone(data) {
    return JSON.parse(JSON.stringify(data)); // 小数据用
  }

  genRootGroup() {
    this.rootGroup.forEach((n) => {
      if (!groupMap.hasOwnProperty(n.attributes.name)) return;

      const groupInfo = this.clone(groupMap[n.attributes.name]);

      Object.assign(n, groupInfo);
      delete groupInfo.name;
      const offspring = this.genOffspring(n.id);

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
    this.originTree.forEach((n) => {
      const id = this.getNodeId(n);

      if (n.isGroup) {
        n.amount = this.getAmount(id);
      }
    });
  }

  genTreeMap() {
    const nodeMap = {};
    const parentMap = {};

    this.originTree.forEach((node) => {
      try {
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

        this.addNodeMap(nodeMap, node);
        this.addParentMap(parentMap, node);
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
    const id = get(ID_PATH)(node);
    const pid = get(PID_PATH)(node);

    if (pid == null) map.rootNode = node;

    if (!map[id]) {
      map[id] = node;
    }
    else { // yms 一个节点可能存在多个分组下，后端返回多个相同 id，不同pid的节点
      map[`${id}-${pid}`] = node;
    }
  }

  addParentMap(map, node) {
    const pid = get(PID_PATH)(node);

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

  isSomething(name, id) {
    const node = this.getNode(id);
    const parent = this.findParentNode(id);

    if (!parent) return false;

    if (parent.id === this.rootNode.id) return node[name];

    if (groupMap.hasOwnProperty(parent.attributes.name)) {
      return groupMap[parent.attributes.name][name];
    }

    return this.isSomething(name, parent.id);
  }

  findBranch(id, branch = []) {
    const parent = this.findParentNode(id);

    if (parent == null) return branch;
    branch.push(parent);

    return this.findBranch(parent.id, branch);
  }

  getNode(id) {
    return this.nodeMap[id];
  }


  getAmount(id) {
    return this.getOffspringNoGroup(id).length;
  }

  getNodeId(node) {
    return get(ID_PATH)(node);
  }

  getNodeType(node) {
    return get(NODE_TYPE_PATH)(node);
  }

  findNodeIndex(node) {
    return this.tree.findIndex((i) => get(ID_PATH)(i) === get(ID_PATH)(node));
  }


  findParentNode(id) {
    const node = this.getNode(id);

    return this.getNode(get(PID_PATH)(node));
  }

  findBrotherNode(id) {
    const groupNode = this.findGroupNode(id);

    return groupNode.filter((n) => get(ID_PATH)(n) !== id);
  }

  findGroupNode(id) {
    const parentNode = this.findParentNode(id);

    return this.getChild(this.getNodeId(parentNode)) || [];
  }

  genOffspring(id) {
    let offspring = this.offspringMap[id];

    if (offspring == null) offspring = this.getOffspring(id);

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

  getChecked() {
    const result = [];

    Object.keys(this.checkedMap).forEach((key) => {
      if (this.checkedMap[key]) {
        result.push(this.getNode(key));
      }
    });

    return result;
  }
}
