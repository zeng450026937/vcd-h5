<template>
  <div id="tree-scroll-area" class="overflow-auto">
    <div>
      <a-button @click="printData"/>
    </div>
    <div ref="tree-content" id="tree-content-area" @click="handleClick">
      <loading></loading>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Clusterize from 'clusterize.js';
import contactDB from '../../database/contact';
import TreeStore from './tree-store';
import Loading from './loading.vue';

let treeStore;

export default {
  name : 'tree',
  data() {
    return {
      tree     : [],
      treeDate : [],
    };
  },
  components : {
    Loading,
  },
  methods : {
    printData() {
      console.warn(this.treeStore);
    },
    async genAsyncGroup() {
      const rootGroup = await contactDB.getChild('phoneBook', 'rootNode');

      rootGroup.forEach((node) => {
        node.level = 0;
        node.expand = false;
      });
    },
    handleClick(e) {
      const id = e.target.getAttribute('node-id');
      const type = e.target.getAttribute('node-type');
      const isCheckboxElm = e.target.getAttribute('check-box') != null;

      if (type == null) return;

      const isOrg = type.indexOf('ORG') > -1;

      if (isOrg) {
        if (isCheckboxElm) {
          const checked = !e.target.parentElement.querySelector('input').checked;

          this.checkGroup(id, checked);
        }
        else {
          this.toggleGroup(id);
        }
      }
      else {
        const checked = !e.target.parentElement.querySelector('input').checked;

        this.checkEntity(id, checked);
      }
    },
    checkEntity(id, checked) {
      treeStore.checkNode(id, checked).then((checkeds) => {
        console.log(checkeds);
        this.updateTreeViews();
      });
    },
    checkGroup(id, checked) {
      console.time('check group cost time:');
      treeStore.checkOffspring(id, checked).then((checkeds) => {
        console.log(checkeds);
        console.timeEnd('check group cost time:');
        console.time('update tree view cost time:');
        this.updateTreeViews();
        console.timeEnd('update tree view cost time:');
      });
    },

    updateTreeViews() {
      this.cluster.update(this.createRow(treeStore.tree));
    },

    createStyleString(styles) {
      let result = '';

      Object.keys(styles).forEach((key) => {
        result += `${key}:${styles[key]}`;
      });

      return result;
    },
    createGroupRow(row) {
      const styles = {
        'padding-left' : `${10 + row.level * 15}px`,
      };

      return `
        <div class="group-node" node-id="${row.node.id}" node-type="${row.node.type}" style="${this.createStyleString(styles)}">
          <div class="${row.expand ? 'triangle-down' : 'triangle-right'}" node-type="${row.node.type}" node-id="${row.node.id}"></div>
          <input id="${row.node.id}" class="tree-checkbox" ${row.checked ? 'checked' : ''} type="checkbox"/>
          <label check-box node-id="${row.node.id}" node-type="${row.node.type}" class="tree-checkbox-label" for="${row.node.id}">
           ${row.attributes.name}
           </label>
        </div>
      `;
    },

    createEntityRow(row) {
      const styles = {
        'padding-left' : `${10 + row.level * 15}px`,
      };

      return `<div class="entity-node" node-id="${row.node.id}" node-type="${row.node.type}" style="${this.createStyleString(styles)}">
                <div>
                  <input id="${row.node.id}" class="tree-checkbox" ${row.checked ? 'checked' : ''} type="checkbox"/>
                  <label check-box node-id="${row.node.id}" node-type="${row.node.type}" class="tree-checkbox-label" for="${row.node.id}">
                    ${row.attributes.name}
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
    createTreeViews(tree) {
      treeStore = new TreeStore(tree);
      this.treeStore = treeStore;

      this.cluster = new Clusterize({
        rows      : this.createRow(treeStore.tree),
        scrollId  : 'tree-scroll-area',
        contentId : 'tree-content-area',
      });
      this.$refs['tree-content'].removeAttribute('tabindex');
    },

    getData() {
      const tenW = 'http://10.83.1.205/api/v3/external/phonebook/sync?dataVersion=0&permissionVersion=0&username=9663&password=eD1YJ3%2Bf2IIytaBumaJJMw%3D%3D&type=STAFF%2CDEVICE%2CVMR%2CEXTERNAL_CONTACTS';
      const normal = 'https://10.200.112.165/api/v3/external/phonebook/sync?dataVersion=0&permissionVersion=0&username=9100&password=S5cOqZDnHmI1FIOJYl%2Fy8Q%3D%3D&type=STAFF%2CDEVICE%2CVMR%2CEXTERNAL_CONTACTS';

      return axios.get(normal);
    },
    toggleGroup(id) {
      treeStore.toggle(id).then(() => {
        this.updateTreeViews();
      });
    },
  },
  async mounted() {
    const originTree = this.$rtc.contact.phonebook.list; // await this.getData();

    this.treeDate = originTree;

    this.createTreeViews(originTree);
  },
};
</script>

<style lang="less">
@import '~clusterize.js/clusterize.css';
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
  padding: 10px 20px;
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
  height:36px;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover{
    background-color: #d6daebcc;
  }
}

.entity-node {
  height: 36px;
  display: flex;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
  &:hover {
    background-color: #d6daebcc;
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
.tree-checkbox-label {
  cursor: pointer;
}
.tree-checkbox-label::before {
  content: '\a0';
  display: inline-block;
  border: 1px solid silver;
  width: 18px;
  height: 18px;
  font-weight: bold;
  background: #fff;
}

.triangle-right {
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-left: 6px solid #000000a6;
  border-bottom: 4px solid transparent;
  margin-right: 6px;
}
.triangle-down {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #000000a6;
  margin-right: 6px;
}
</style>
