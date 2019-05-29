<template>
  <div id="tree-scroll-area" class="overflow-auto">
    <div ref="tree-content" id="tree-content-area" @click="handleClick">
      <loading></loading>
    </div>
  </div>
</template>

<script>
import Clusterize from 'clusterize.js';
import TreeStore from './tree-store';
import Loading from './loading.vue';

const LOAD_MODE = {
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

export default {
  name  : 'tree',
  props : {
    loadMode : {
      type    : String,
      default : LOAD_MODE.OVERALL,
    },
    getChild : {
      type : Function,
    },
    disabled : {
      type : Array,
      default() {
        return [];
      },
    },
  },
  sketch : [
    {
      ns    : 'i18n',
      props : [ 'language' ],
    },
  ],
  watch : {
    language() {
      this.updateTreeViews();
    },
  },
  data() {
    return {
      tree     : [],
      treeData : [],
    };
  },
  components : {
    Loading,
  },
  methods : {
    handleClick(e) {
      e.preventDefault();

      const id = e.target.getAttribute('node-id');
      const type = e.target.getAttribute('node-type');
      const isCheckboxElm = e.target.getAttribute('check-box') != null;
      const isHalfCheck = e.target.getAttribute('half-check') != null;

      if (type == null) return;

      const isOrg = type.indexOf('ORG') > -1;

      if (isHalfCheck) return this.checkGroup(id, true); // 选中分组节点

      if (isOrg) {
        if (isCheckboxElm) {
          const checked = !e.target.parentElement.querySelector('input').checked;

          this.checkGroup(id, checked); // 选中分组节点
        }
        else {
          this.toggleGroup(id); // 展开或者收起
        }
      }
      else {
        this.checkEntity(id); // 选中节点
      }
    },
    checkEntity(id) {
      if (this.disabled.indexOf(id) > -1) return;

      const node = this.treeStore.getNode(id);

      this.treeStore.checkNode(id, !node.checked).then((nodes) => {
        this.updateTreeViews();
        this.$emit('change', nodes);
      });
    },
    check(id, checked) {
      return this.treeStore.checkNode(id, checked).then((nodes) => {
        this.updateTreeViews();
        this.$emit('change', nodes);
      });
    },
    checkOffspring(id, checked) {
      return this.treeStore.checkOffspring(id, checked).then((nodes) => {
        this.updateTreeViews();

        return nodes;
      });
    },
    checkGroup(id, checked) {
      this.checkOffspring(id, checked).then((nodes) => {
        this.$emit('change', nodes);
      });
    },
    updateTreeViews() {
      this.cluster.update(this.createRow(this.treeStore.tree));
      this.cluster.refresh();
    },
    createStyleString(styles) {
      let result = '';

      Object.keys(styles).forEach((key) => {
        result += `${key}:${styles[key]};`;
      });

      return result;
    },
    getAvatar(node) {
      if (node.isUser) return `${/^(.*)\(.*\)$/.test(node.name) ? RegExp.$1.substr(-2, 2) : node.name.substr(-2, 2)}`;

      const iconType = node.isDevice
        ? 'icon-huiyishishebei'
        : node.isExternal
          ? 'icon-zuzhi'
          : node.isService
            ? 'icon-wangluo'
            : node.isVMR
              ? 'icon-xunihuiyishi'
              : 'icon-zuzhi';

      return this.icon(iconType);
    },
    icon(type) {
      return `<svg width="1.5em" height="1.5em" fill="currentColor" aria-hidden="true" focusable="false" class=""><use xlink:href="#${type}"></use></svg>`;
    },
    createGroupRow(row) {
      const styles = {
        'padding-left' : `${12 + row.level * 15}px`,
      };

      const inputStyles = {
        display        : row.halfChecked ? 'none' : 'inline-block',
        'margin-right' : '10px',
      };

      const input = `
        <input id="${row.node.id}" node-id="${row.node.id}" node-type="${row.node.type}" class="tree-checkbox" ${row.checked ? 'checked' : ''} type="checkbox"/>
        <label
           style="${this.createStyleString(inputStyles)}"
           check-box
           node-id="${row.node.id}"
           node-type="${row.node.type}"
           class="tree-checkbox-label"
           for="${row.node.id}">
         </label>
         <lable half-check style="${row.halfChecked ? '' : 'display:none'}"  node-id="${row.node.id}" node-type="${row.node.type}" class="tree-half-checkbox"></lable>
     `;

      return `
        <div class="group-node" node-id="${row.node.id}" node-type="${row.node.type}" style="${this.createStyleString(styles)}">
          <div class="${row.expand ? 'triangle-down' : 'triangle-right'}" node-type="${row.node.type}" node-id="${row.node.id}"></div>
          ${this.loadMode === LOAD_MODE.SPLIT ? '' : input}
           ${row.i18n ? this.$t(row.i18n) : row.name} ${this.loadMode === LOAD_MODE.SPLIT ? '' : `(${row.amount})`}
        </div>
      `;
    },
    createEntityRow(row) {
      const styles = {
        'padding-left' : `${30 + row.level * 15}px`,
      };

      return `<div class="entity-node" node-pid="${row.node.parentId}" node-id="${row.node.id}" node-type="${row.node.type}" style="${this.createStyleString(styles)}">
                <div node-id="${row.node.id}" node-pid="${row.node.parentId}" node-type="${row.node.type}">
                  <input id="${row.node.id}" class="tree-checkbox" ${row.checked ? 'checked' : ''} type="checkbox"/>
                  <label
                    check-box node-id="${row.node.id}"
                    node-pid="${row.node.parentId}"
                    node-type="${row.node.type}"
                    class="${this.disabled.indexOf(row.node.id) > -1 ? 'tree-checkbox-disabled' : 'tree-checkbox-label'}"
                    for="${row.node.id}">

                    <div class="avatar" node-id="${row.node.id}" node-pid="${row.node.parentId}" node-type="${row.node.type}">
                       ${this.getAvatar(row)}
                    </div>
                    <div class="name-content" node-id="${row.node.id}" node-pid="${row.node.parentId}" node-type="${row.node.type}">
                       <span class="name" node-id="${row.node.id}" node-pid="${row.node.parentId}" node-type="${row.node.type}">${row.name}</span>
                       <span class="number" node-id="${row.node.id}" node-pid="${row.node.parentId}" node-type="${row.node.type}">${row.number}</span>
                     </div>

                  </label>
                </div>
              </div>`;
    },
    createRow(tree) {
      return tree.map((n) => (this.isOrg(n) ? this.createGroupRow(n) : this.createEntityRow(n)));
    },
    isOrg(node) {
      return node.node.type.indexOf('ORG') > -1;
    },
    toggleGroup(id) {
      this.treeStore.toggle(id, this.getChild, true).then(() => {
        this.updateTreeViews();
      });
    },
    getChecked() {
      return this.treeStore.getChecked();
    },
    clear() {
      this.treeStore.clear();
      this.updateTreeViews();
    },
    search(text) {
      return this.treeStore.search(text);
    },
    getAsyncCheckedNode(id) {
      return this.treeStore.getAsyncCheckedNode(id);
    },
    cancelChecked(id) {
      this.treeStore.cancelChecked(id);
      this.updateTreeViews();
    },
    getNode(id) {
      return this.treeStore.getNode(id);
    },
    setCheckedList(checkedList) {
      return this.treeStore.setCheckedList(checkedList).then((checked) => {
        this.updateTreeViews();

        return checked;
      });
    },
    createTreeViews(store) {
      this.cluster = null;

      const cluster = new Clusterize({
        rows      : this.createRow(store.tree),
        scrollId  : 'tree-scroll-area',
        contentId : 'tree-content-area',
      });

      cluster.refresh();

      this.$refs['tree-content'].removeAttribute('tabindex');

      cluster._isVue = true;

      this.cluster = cluster;

      this.$emit('ready');
    },
    createTree(options) {
      // TODO api 接口
      options.loadMode = this.loadMode;
      options.disabled = this.disabled;

      this.treeStore = new TreeStore(options);

      this.createTreeViews(this.treeStore);
    },
  },
  created() {
    this.treeStore = null;
  },
  beforeDestroy() {
    this.treeStore = null;
    if (this.cluster) this.cluster.destroy();
  },
};
</script>

<style lang="less">
#tree-scroll-area {
  height: 100%;
  width: 100%;
}
#tree-content-area {
  user-select: none;
  min-height: 100%;
  min-width: 100%;
  outline: none;
  height: 100%;
  width: max-content;
  &:focus {
    outline: none;
    border:none
  }
  &:after {
    outline: none;
    border:none;
  }
  &:before {
    outline: none;
    border:none;
  }
}

#tree-content-area:focus {
  border: 1px solid #ccc
}

.group-node {
  height:40px;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover{
    background-color: #d6daebcc;
  }
}

.entity-node {
  height: 56px;
  display: flex;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
  &:hover {
    background-color: #d6daebcc;
  }
  .avatar{
    height: 32px;
    width: 32px;
    background: #55638C;
    border-radius: 50%;
    margin: 0 10px;
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .name-content{
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    justify-content: center;
    .name{
      font-size: 14px;
      height: 20px;
      line-height: 20px;
    }
    .number {
      font-size: 12px;
      color: #777777;
      height: 20px;
      line-height: 20px;
    }
  }
}
.tree-half-checkbox::before{
  content: '';
  border: 4px #4a5fc4 solid;
  display: inline-block;
  border-radius: 2px;
}
.tree-half-checkbox {
  height: 16px;
  width: 16px;
  border: 1px solid silver;
  margin-right: 10px;
  text-align: center;
  vertical-align: middle;
  background-color: #fff;
  border-radius: 2px;
  line-height: 12px;
  &:hover {
    border: 1px solid #4a5fc4;
  }
}
.tree-checkbox {
  &[type="checkbox"] {
    clip:rect(0,0,0,0);
    display: none;
  }
  &[type="checkbox"]:checked+.tree-checkbox-label::before {
    content: '\2713';
    color: #fff;
    background: #4a5fc4;
    border-color:#4a5fc4;
    border-radius: 2px;
    text-align: center;
  }
}
.tree-checkbox-disabled {
  cursor: pointer;
  display: flex;
  line-height: 14px;
  align-items: center;
  margin-left: 16px;
}
.tree-checkbox-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  line-height: 14px;
}
.tree-checkbox-label::before {
  content: '\a0';
  display: inline-block;
  border: 1px solid silver;
  width: 16px;
  height: 16px;
  font-weight: bold;
  background: #fff;
  border-radius: 2px;
  font-size: 10px;
}
.tree-checkbox-label:hover {
  &::before {
    border: 1px solid #4a5fc4;
  }
}

.triangle-right {
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-left: 6px solid #999999;
  border-bottom: 4px solid transparent;
  margin-right: 12px;
}
.triangle-down {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #999999;
  margin-right: 10px;
}
</style>
