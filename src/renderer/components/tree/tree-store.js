
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
    const { nodeMap, parentMap } = this.genTreeMap();

    this.nodeMap = nodeMap;
    this.parentMap = parentMap;
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

  getNode(id) {
    return this.nodeMap[id];
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

    const { nodeMap, parentMap } = this.genTreeMap({ reset: false });

    this.nodeMap = nodeMap;
    this.parentMap = parentMap;

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

  findBranch(id, branch = []) {
    const node = this.getNode(id);
    const parent = this.findParentNode(id);

    branch.push(node);

    if (parent == null) return branch;

    return this.findBranch(parent, branch);
  }

  isGroupAllChecked(id) {
    const groupNode = this.findGroupNode(id);

    return groupNode.every((n) => n.checked);
  }

  async checkNode(id, checked) {
    if (id === this.defaultChecked) return;

    const checkers = this.getChecked();

    if (checked && checkers.length >= this.maxChecked) return checkers;

    this.getNode(id).checked = checked;
    this.checkedMap[id] = checked;

    this.correctParentChecked(id, checked);

    return this.getChecked();
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

  async checkGroupChild(id, checked) {
    const checkedNodes = this.getChecked();

    if (checkedNodes.length >= this.maxChecked) return checkedNodes;

    const childes = this.getChild(id);

    this.getNode(id).checked = checked;
    childes.forEach((node) => {
      const nodeId = this.getNodeId(node);

      if (!this.isORG(node)) {
        node.checked = checked;
        this.checkedMap[nodeId] = checked;
      }
    });

    return this.getChecked();
  }

  getCheckedNum() {
    return this.getChecked().length;
  }

  findParentNode(id) {
    const node = this.getNode(id);

    return this.getNode(this.getParentId(node));
  }

  findBrotherNode(id) {
    const groupNode = this.findGroupNode(id);

    return groupNode.filter((n) => this.getNodeId(n) !== id);
  }

  findGroupNode(id) {
    const parentNode = this.findParentNode(id);

    return this.getChild(this.getNodeId(parentNode)) || [];
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

      if (checked && checkedNum > this.maxChecked) {
        parent.checked = false;
        parent.halfChecked = true;

        return;
      }

      node.checked = checked;

      if (!this.isORG(node)) {
        this.checkedMap[nodeId] = checked;
      }

      if (checked && this.isORG(node)) {
        node.halfChecked = false;
      }
    });

    this.correctParentChecked(id, checked);

    const checkers = this.getChecked();

    if (checkers.length === this.maxChecked) this.correctChildChecked(id);

    return checkers;
  }

  hasUncheckedBrother(id) {
    const brotherNode = this.findBrotherNode(id);

    return brotherNode.some((n) => !n.checked);
  }

  hasCheckedBrother(id) {
    const brotherNode = this.findBrotherNode(id);

    return brotherNode.some((n) => n.checked);
  }

  hasCheckedOffspring(id) {
    const offspring = this.genOffspring(id);

    return offspring.some((n) => n.checked);
  }

  isCheckedAllOffspring(id) {
    const offspring = this.genOffspring(id);

    return offspring.every((n) => n.checked);
  }

  isUncheckedAllOffspring() {
    return !this.isCheckedAllOffspring();
  }

  correctParentChecked(id, checked) {
    const parent = this.findParentNode(id);
    const parentId = this.getNodeId(parent);

    if (parent == null) return;

    if (checked) {
      const isCheckAllOffspring = this.isCheckedAllOffspring(parentId);

      parent.checked = isCheckAllOffspring;
      parent.halfChecked = !isCheckAllOffspring;

      this.correctParentChecked(parentId, true);
    }
    else {
      parent.halfChecked = this.hasCheckedOffspring(parentId);
      parent.checked = false;

      this.correctParentChecked(parentId, false);
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
    this.correctParentChecked(id, false);
  }

  search(text) {
    return this.originTree.filter((n) => n.name.indexOf(text) > -1);
  }
}
