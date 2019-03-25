
const ID_PATH = [ 'node', 'id' ];
const PID_PATH = [ 'node', 'parentId' ];
const NODE_TYPE_PATH = [ 'node', 'type' ];

const LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

export default class TreeStore {
  constructor({ data, expandLevel = 2, maxChecked = 50 * 10000, defaultChecked, loadMode = LOAD_MODE.OVERALL }) {
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
    this.genTree();
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

    if (this.getNodeType(node).indexOf('ORG') === -1) return;

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

  getCheckedMultiple(id) {
    const multiple = this.getNodeInMultiple(id);

    return multiple.filter((n) => n.checked);
  }

  async checkNode(id, checked) {
    if (id === this.defaultChecked) return;

    const checkers = this.getChecked();

    if (checked && checkers.length >= this.maxChecked) return checkers;

    this.getNode(id).checked = checked;
    this.checkedMap[id] = checked;
    this.correctParentChecked({ id, checked });
    this.correctMultiple(id, checked);

    return this.getChecked();
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

  setCheckers(data) {
    return new Promise((resolve) => {
      data.forEach((id) => {
        this.checkNode(id, true).then(() => {});
      });

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

    let checkedNum = checkedNodes.length;

    offspring.forEach((node) => {
      const nodeId = this.getNodeId(node);

      if (!this.isORG(node)) { // TODO 如果大于 maxChecked 需要break
        checkedNum++;
      }

      if (checked && checkedNum > (this.maxChecked - this.getCheckedMultiple(this.getNodeId(node)).length)) {
        // 设置 当前勾选的分组 选中状态
        parent.checked = false;
        parent.halfChecked = true;

        return;
      }

      node.checked = checked;

      if (!this.isORG(node)) {
        this.checkedMap[nodeId] = checked;
        this.correctMultiple(node.id, checked);
      }

      if (checked && this.isORG(node)) {
        node.halfChecked = false;
      }
    });

    this.correctParentChecked({ id, checked }); // 此处 勾选的是 分组 所以只传分组 的 id 就可以准确 校正 父分组的勾选状态

    const checkers = this.getChecked();

    if (checkers.length === this.maxChecked) this.correctChildChecked(id);

    return checkers;
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

  isORG(node) {
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
    console.timeEnd('clear all checked cost time');
  }

  cancelChecked(id) {
    const node = this.getNode(id);

    node.checked = false;
    this.checkedMap[id] = false;
    this.correctParentChecked({
      id,
      checked : false,
    });

    this.correctMultiple(id, false);
  }

  search(text) {
    return this.originTree.filter((n) => n.name.indexOf(text) > -1);
  }
}
