
const ID_PATH = [ 'node', 'id' ];
const PID_PATH = [ 'node', 'parentId' ];
const NODE_TYPE_PATH = [ 'node', 'type' ];

const LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

const DEFAULT_MAX_CHECK = 50 * 10000;

export default class TreeStore {
  constructor({
    data,
    expandLevel = 1,
    maxChecked = DEFAULT_MAX_CHECK,
    defaultChecked,
    loadMode = LOAD_MODE.OVERALL,
    disabled = [],
  }) {
    if (!Array.isArray(data)) return;
    console.time('generate Tree model cost time');
    this.loadMode = loadMode;
    this.tree = [];
    this.expandLevel = loadMode === LOAD_MODE.OVERALL ? expandLevel : 1;
    this.maxChecked = maxChecked;
    this.defaultChecked = defaultChecked;
    this.originTree = data;
    this.checkedMap = {};
    this.asyncMap = {};
    this.asyncChecked = [];
    this.disabled = disabled;
    this.genTree();
    this.correctDefaultChecked();

    console.timeEnd('generate Tree model cost time');
  }

  get rootGroup() {
    return this.parentMap[this.getNodeId(this.rootNode)];
  }

  get rootNode() {
    return this.nodeMap.rootNode;
  }

  genTree() {
    const { nodeMap, parentMap, multiple } = this.genTreeMap();

    this.nodeMap = nodeMap;
    this.parentMap = parentMap;
    this.multiple = multiple;
    this.offspringMap = {};
    this.rootNode.level = 0;
    this.tree.push(this.rootNode);

    console.time(`expand tree level-${this.expandLevel} time:`);
    for (let i = 0; i < this.expandLevel; i++) {
      this.tree.forEach((n) => {
        const isOrg = this.isORG(n);

        if (isOrg && !n.expand) {
          this.expand(this.getNodeId(n));
        }
      });
    }
    console.timeEnd(`expand tree level-${this.expandLevel} time:`);
  }

  genTreeMap({ reset = true } = {}) {
    const nodeMap = {};
    const parentMap = {};
    const multiple = {};
    
    this.originTree.forEach((node) => {
      try {
        const id = this.getNodeId(node);

        if (reset) {
          node.expand = false;
          node.halfChecked = false;
        }

        node.checked = id === this.defaultChecked;
        if (id === this.defaultChecked) {
          this.checkedMap[id] = true;
        }

        this.addNodeMap(nodeMap, multiple, node);
        this.addParentMap(parentMap, node);
      }
      catch (e) {
        console.log(e);
      }
    });

    return {
      nodeMap,
      parentMap,
      multiple,
    };
  }

  addNodeMap(map, multiple, node) {
    const id = this.getNodeId(node);
    const pid = this.getParentId(node);

    if (pid == null) map.rootNode = node;

    if (!map[id]) {
      map[id] = node;
    }
    else { // yms 一个节点可能存在多个分组下，后端返回多个相同 id，不同pid的节点
      map[`${id}-${pid}`] = node;
      multiple[`${id}-${pid}`] = node;
    }
  }

  addParentMap(map, node) {
    const pid = this.getParentId(node);

    if (!pid) return;

    if (Array.isArray(map[pid])) {
      // if (this.updatedNodes[node.id]) return console.log('repeat !!!');

      map[pid].push(node);

      // this.updatedNodes[node.id] = node;
    }
    else {
      map[pid] = [ node ];
    }
  }

  getChild(id) {
    return this.parentMap[id];
  }

  getNode(id, parentId) {
    return this.nodeMap[`${id}-${parentId}`] || this.nodeMap[id];
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

  async toggle(id, getChildAsync, useAsync) {
    const node = this.getNode(id);

    if (this.getNodeType(node).indexOf('ORG') === -1 && this.getNodeType(node).indexOf('GROUP') === -1) return;

    return node.expand ? this.collapse(id) : this.expand(id, getChildAsync, useAsync);
  }

  genAsyncData(nodeId, data) {
    if (this.asyncMap[nodeId] || data.length === 0) return;

    // this.originTree.push(...data);  树数据 是引用关系 已经添加了新成员

    const { nodeMap, parentMap, multiple } = this.genTreeMap({ reset: false });

    this.nodeMap = nodeMap;
    this.parentMap = parentMap;
    this.multiple = multiple;

    this.asyncMap[nodeId] = data;

    this.asyncChecked.forEach((n) => {
      const id = this.getNodeId(n);
      const node = this.getNode(id);

      if (node) {
        node.checked = true;
        this.checkedMap[id] = true;
      }
    });
  }

  getAsyncCheckedNode(id) {
    return this.asyncChecked.find((n) => this.getNodeId(n) === id);
  }

  async expand(id, getChildAsync, useAsync = false) {
    const parent = this.getNode(id);

    if (this.loadMode === LOAD_MODE.SPLIT && useAsync) {
      const asyncData = await getChildAsync({ parentId: id });

      this.genAsyncData(id, asyncData);
    }
    const childes = this.getChild(id);

    if (!Array.isArray(childes)) return parent.expand = true;

    childes.forEach((node) => {
      node.level = parent.level + 1;
      node.expand = false;
    });

    this.appendToTree(childes, parent);
  }

  collapse(id) {
    const parent = this.getNode(id);
    const parentIndex = this.findNodeIndex(parent);
    const lastOffspringIndex = this.findLastOffspringIndex({ [id]: 1 }, parentIndex);

    this.tree.splice(parentIndex + 1, lastOffspringIndex - parentIndex);
    parent.expand = false;
  }

  appendToTree(childes, parent) {
    const parentIndex = this.findNodeIndex(parent);

    this.tree.splice(parentIndex + 1, 0, ...childes);
    parent.expand = true;
  }

  findNodeIndex(node) {
    return this.tree.findIndex((i) => this.getNodeId(i) === this.getNodeId(node));
  }

  findNextLevelIndex(level, currentIndex) {
    const nextIndex = currentIndex + 1;
    const nextNode = this.tree[nextIndex];

    if (nextIndex === this.tree.length) return this.tree.length - 1; // rest

    if (nextNode.level === level) return nextIndex - 1;

    return this.findNextLevelIndex(level, nextIndex);
  }

  findLastOffspringIndex(groupMap, currentIndex) {
    const nextIndex = currentIndex + 1;
    const nextNode = this.tree[nextIndex];
    const nextNodeId = this.getNodeId(nextNode);
    const nextNodePid = this.getParentId(nextNode);

    if (groupMap.hasOwnProperty(nextNodePid)) {
      groupMap[nextNodeId] = 1;

      return this.findLastOffspringIndex(groupMap, nextIndex);
    }
    else {
      return currentIndex;
    }
  }

  getNodeInMultiple(id) {
    const result = [];

    Object.keys(this.multiple).forEach((key) => {
      if (key.indexOf(id) > -1) result.push(this.multiple[key]);
    });

    return result;
  }

  async checkNode(id, checked) {
    if (id === this.defaultChecked) return;

    const checkeds = this.getChecked();

    if (checked && checkeds.length >= this.maxChecked) return checkeds;

    const node = this.getNode(id);

    if (this.loadMode === LOAD_MODE.SPLIT) {
      if (node) {
        node.checked = checked;
        this.checkedMap[id] = checked;
      }

      if (!checked) this.asyncChecked = this.asyncChecked.filter((n) => this.getNodeId(n) !== id);

      const checkedList = {};

      [ ...this.getChecked(), ...this.asyncChecked ].forEach((n) => {
        checkedList[this.getNodeId(n)] = n;
      });

      return Object.values(checkedList);
    }
    else {
      node.checked = checked;
      this.checkedMap[id] = checked;
      this.correctParentChecked({ id, checked });
      this.correctMultiple(id, checked);

      return this.getChecked();
    }
  }

  correctDefaultChecked() {
    if (this.defaultChecked) this.correctParentChecked({ id: this.defaultChecked, checked: true });
  }

  correctMultiple(id, checked) {
    const multiple = this.getNodeInMultiple(id); // 一个成员在多个不同的分组下

    multiple.forEach((n) => {
      n.checked = checked;
      this.correctParentChecked({
        parentId : n.parentId,
        checked,
      });
    });
  }

  isSetMaxCheck() {
    return this.maxChecked !== DEFAULT_MAX_CHECK;
  }

  isMultipleNode(id) {
    return Object.keys(this.multiple).find((i) => i.indexOf(id) > -1) != null;
  }

  getCheckedMultiple() {
    return Object.values(this.multiple).filter((i) => i.checked);
  }

  setCheckedList(data) {
    this.asyncChecked = data;

    return new Promise((resolve) => {
      data.forEach((n) => {
        if (this.loadMode === LOAD_MODE.SPLIT) {
          n.checked = true;
        }
        else {
          this.checkNode(this.getNodeId(n), true).then(() => {});
        }
      });

      if (this.loadMode === LOAD_MODE.SPLIT) {
        resolve([ ...this.getChecked(), ...data ]);
      }

      return resolve(this.getChecked());
    });
  }

  getOffspringNoGroup() {
    return this.genOffspring().filter((n) => !n.isGroup);
  }

  findParent({ id, parentId }) { // 可以提供一个 节点 或者 提供 id 或者 parentId
    if (parentId) return this.getNode(parentId);

    const node = this.getNode(id);

    return this.getNode(this.getParentId(node));
  }

  async checkOffspring(id, checked) {
    const parent = this.getNode(id);
    const checkedNodes = this.getChecked();

    if (checked && checkedNodes.length >= this.maxChecked) return checkedNodes;

    const offspring = this.genOffspring(id);

    if (checked) {
      parent.halfChecked = false;
    }
    parent.checked = checked;

    const inMultiple = [];

    for (let i = 0; i < offspring.length; i++) {
      const nodeId = this.getNodeId(offspring[i]);

      /* eslint-disable no-continue */
      if (nodeId === this.defaultChecked || this.disabled.indexOf(nodeId) > -1) continue;
      /* eslint-enable no-continue */

      if (this.isSetMaxCheck()) {
        const checkedNum = this.getChecked().length;

        if (checked && (checkedNum >= this.maxChecked)) {
          parent.checked = false;
          parent.halfChecked = true;

          break;
        }
      }
      offspring[i].checked = checked;

      if (this.isMultipleNode(nodeId)) inMultiple.push(offspring[i]);

      if (!this.isORG(offspring[i])) {
        this.checkedMap[nodeId] = checked;
      }

      if (checked && this.isORG(offspring[i])) {
        offspring[i].halfChecked = false;
      }
    }

    inMultiple.forEach((n) => {
      this.correctMultiple(this.getNodeId(n), n.checked);
    });

    this.correctParentChecked({ id, checked }); // 此处 勾选的是 分组 所以只传分组 的 id 就可以准确 校正 父分组的勾选状态

    const checkeds = this.getChecked();

    if (checkeds.length === this.maxChecked) this.correctChildChecked(id);

    return checkeds;
  }

  hasCheckedOffspring(id) {
    const offspring = this.genOffspring(id);

    return offspring.some((n) => n.checked);
  }

  isCheckedAllOffspring(id) {
    const offspring = this.genOffspring(id);

    return offspring.every((n) => n.checked);
  }


  /*
  *  提供 id 或者 parentId 找到父节点， 如果勾选的是 节点 需要提供 parentId， 如果是分组则随意;
  *
  *  因为 一个节点 可能在不同的分组下 即相同的id 不同的 parentId， 必须提供parentId 才能找到准确的父节点。
  * */
  correctParentChecked({ id, parentId, checked }) {
    const parent = !parentId ? this.findParent({ id }) : this.getNode(parentId);

    if (!parentId) parentId = this.getNodeId(parent);

    if (parent == null) return;

    if (checked) {
      const isCheckAllOffspring = this.isCheckedAllOffspring(parentId);

      parent.checked = isCheckAllOffspring;
      parent.halfChecked = !isCheckAllOffspring;

      this.correctParentChecked({ id: parentId, checked: true });
    }
    else {
      parent.halfChecked = this.hasCheckedOffspring(parentId);
      parent.checked = false;

      this.correctParentChecked({ id: parentId, checked: false });
    }
  }

  correctChildChecked(id) {
    const offspring = this.genOffspring(id);
    const groups = offspring.filter((n) => n.isGroup);

    groups.forEach((n) => {
      const groupId = this.getNodeId(n);
      const isCheckAllOffspring = this.isCheckedAllOffspring(groupId);

      n.checked = isCheckAllOffspring;

      n.halfChecked = !isCheckAllOffspring && this.hasCheckedOffspring(groupId);
    });
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


  // getOffspring(id) {
  //   const offSprings = [];
  //   const queue = [];
  //
  //   queue.push(...(this.getChild(id) || []));
  //
  //   while (queue.length > 0) {
  //     const child = queue.shift();
  //
  //     if (this.isORG(child)) {
  //       queue.push(...(this.getChild(this.getNodeId(child)) || []));
  //     }
  //     offSprings.push(child);
  //   }
  //
  //   return offSprings;
  // }

  isORG(node) {
    const type = this.getNodeType(node);

    return type.indexOf('ORG') > -1 || type.indexOf('GROUP') > -1;
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

  clear() {
    console.time('clear all checked cost time');
    Object.keys(this.checkedMap).forEach((key) => {
      if (key === this.defaultChecked) return;
      this.checkedMap[key] = false;
    });

    this.originTree.forEach((n) => {
      if (n.id === this.defaultChecked) return;
      n.checked = false;
      n.halfChecked = false;
    });

    this.asyncChecked = [];
    this.correctDefaultChecked();
    console.timeEnd('clear all checked cost time');
  }

  cancelChecked(id) {
    const node = this.getNode(id);

    if (this.loadMode === LOAD_MODE.SPLIT) {
      this.asyncChecked = this.asyncChecked.filter((n) => n.id !== id);

      if (node) {
        node.checked = false;
        this.checkedMap[id] = false;
      }
    }
    else {
      node.checked = false;
      this.checkedMap[id] = false;
      this.correctParentChecked({
        id,
        checked : false,
      });

      this.correctMultiple(id, false);
    }
  }

  search(text, max = 200) {
    let result = this.originTree
      .filter((n) => (n.name.indexOf(text) > -1 || n.number.indexOf(text) > -1) && !n.isGroup)
      .map((r) => this.getNodeId(r));

    result = [ ...new Set(result) ].slice(0, max);

    return result.map((r) => this.getNode(r));
  }
}
