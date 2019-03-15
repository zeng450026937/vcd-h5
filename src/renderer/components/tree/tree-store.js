import { get } from 'lodash/fp';

const ID_PATH = 'node.id';
const PID_PATH = 'node.parentId';
const NODE_TYPE_PATH = 'node.type';

export default class TreeStore {
  constructor(originTree) {
    this.tree = [];
    this.originTree = originTree;
    this.checkedMap = {};
    this.genTree();
  }

  get rootGroup() {
    return this.parentMap[get(ID_PATH)(this.rootNode)];
  }

  get rootNode() {
    return this.nodeMap.rootNode;
  }

  genTree() {
    const { nodeMap, parentMap } = this.genTreeMap();

    this.nodeMap = nodeMap;
    this.parentMap = parentMap;
    this.rootNode.level = 0;
    this.tree.push(this.rootNode);
  }

  genTreeMap() {
    const nodeMap = {};
    const parentMap = {};
    
    this.originTree.forEach((node) => {
      try {
        node.expand = false;
        node.checked = false;
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

  getNode(id) {
    return this.nodeMap[id];
  }

  async toggle(id) {
    const node = this.getNode(id);

    if (get(NODE_TYPE_PATH)(node).indexOf('ORG') === -1) return;

    return node.expand ? this.collapse(id) : this.expand(id);
  }

  expand(id) {
    const parent = this.getNode(id);
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
    return this.tree.findIndex((i) => get(ID_PATH)(i) === get(ID_PATH)(node));
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
    const nextNodeId = get(ID_PATH)(nextNode);
    const nextNodePid = get(PID_PATH)(nextNode);

    if (groupMap.hasOwnProperty(nextNodePid)) {
      groupMap[nextNodeId] = 1;

      return this.findLastOffspringIndex(groupMap, nextIndex);
    }
    else {
      return currentIndex;
    }
  }

  async checkNode(id, checked) {
    this.nodeMap[id].checked = checked;
    this.checkedMap[id] = checked;

    this.correctParentChecked(id, checked);

    return this.getChecked();
  }

  async checkGroupChild(id, checked) {
    const childes = this.getChild(id);

    this.nodeMap[id].checked = checked;
    childes.forEach((node) => {
      const nodeId = get(ID_PATH)(node);
      const isORGNode = this.isORG(node);

      if (!isORGNode) {
        node.checked = checked;
        this.checkedMap[nodeId] = checked;
      }
    });

    return this.getChecked();
  }

  findParentNode(id) {
    const node = this.nodeMap[id];

    return this.nodeMap[get(PID_PATH)(node)];
  }

  findBrotherNode(id) {
    const parentNode = this.findParentNode(id);

    return this.parentMap[get(ID_PATH)(parentNode)];
  }

  async checkOffspring(id, checked) {
    const offspring = this.getOffspring(id);
    const parent = this.nodeMap[id];


    parent.checked = checked;

    offspring.forEach((node) => {
      const nodeId = get(ID_PATH)(node);
      const isORGNode = this.isORG(node);

      node.checked = checked;

      if (!isORGNode) {
        this.checkedMap[nodeId] = checked;
      }
    });

    this.correctParentChecked(id, checked);

    return this.getChecked();
  }

  correctParentChecked(id, checked) {
    const node = this.nodeMap[id];
    const parent = this.findParentNode(get(ID_PATH)(node));

    if (parent != null) {
      if (checked) {
        const brotherNode = this.findBrotherNode(id);

        const unCheckedNode = brotherNode.find((n) => !n.checked);

        if (!unCheckedNode) parent.checked = true;
      }
      else {
        parent.checked = false;
      }
    }
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
    const type = get(NODE_TYPE_PATH)(node);

    return type.indexOf('ORG') > -1;
  }

  getChecked() {
    const result = [];

    Object.keys(this.checkedMap).forEach((key) => {
      if (this.checkedMap[key]) {
        result.push(this.nodeMap[key]);
      }
    });

    return result;
  }
}
