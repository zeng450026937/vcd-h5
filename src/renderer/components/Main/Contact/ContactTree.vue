<template>
  <a-layout id="contact-tree" class="h-full bg-white border">

    <a-input v-model="searchText"
             placeholder="搜索"
             class="h-10 rounded-none border-none"
             @change="onChange">
      <div slot="suffix">
        <a-iconfont
            v-show="searchText"
            type="icon-guanbi"
            class="text-sm text-black9 text-base cursor-pointer mr-2 hover:text-red"
            @click="searchText = ''"/>
        <a-iconfont
            type="icon-sousuo"
            class="text-sm text-black9 text-base"/>
      </div>

    </a-input>
    <div class="overflow-y-auto h-full px-2 border-t">
      <a-tree
          checkable
          class="contact-tree"
          v-model="checkedKeys"
          :autoExpandParent="autoExpandParent"
          :expandedKeys="expandedKeys"
          :selectedKeys="selectedKeys"
          :treeData="treeData"
          :loadData="onLoadData"
          @check="onCheck"
          @expand="onExpand"
      >
        <div slot="title" slot-scope="contact" class="flex h-full items-center">
          <div>
            <a-avatar v-if="!contact.parent.isUser"
                      :size="32"
                      class="text-white bg-indigo-dark">
              <a-iconfont :type="contact.avatar"/>
            </a-avatar>
            <a-avatar v-if="contact.parent.isUser"
                      :size="32"
                      :class="{[`bg-${contact.avatar}`]: true}"
            >{{contact.name.substr(-2, 2)}}
            </a-avatar>
          </div>

          <div class="flex flex-col truncate ml-2 justify-center">
            <span class="text-sm leading-none truncate">{{contact.title}}</span>
            <span class="text-xs opacity-75 leading-none mt-1">{{contact.ip}}</span>
          </div>
        </div>
      </a-tree>
    </div>

  </a-layout>
</template>

<script>
const getParentKey = (key, tree) => {
  let parentKey;

  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];

    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      }
      else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  
  return parentKey;
};

export default {
  name  : 'ContactTree',
  props : {
    checked : {
      type : Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      searchText       : '',
      expandedKeys     : [],
      autoExpandParent : true,
      selectedKeys     : [],
      checkedKeys      : [],
      dataList         : [],
    };
  },
  computed : {
    treeData() {
      return this.$model.contact.formattedPhoneBook.items;
    },
  },
  watch : {
    checked : {
      handler(val) {
        this.checkedKeys = val;
      },
      immediate : true,
    },
  },
  methods : {
    onLoadData(treeNode) {
      if (treeNode.dataRef.isGroup) {
        treeNode.dataRef.addChildNodes();
      }
      
      return Promise.resolve();
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onCheck(checkedKeys, info) {
      const checkedContact = [];

      info.checkedNodes.forEach((c) => {
        const dataRef = c.data.props;

        if (!dataRef.isGroup) {
          checkedContact.push(dataRef);
        }
      });
      this.$emit('onCheck', checkedContact);
    },

    onChange(e) {
      // if (this.dataList.length <= 0) {
      //   const generateList = (data) => {
      //     for (let i = 0; i < data.length; i++) {
      //       const node = data[i];
      //       const key = node.key;
      //
      //       this.dataList.push({ key, title: key });
      //       if (node.children) {
      //         generateList(node.children, node.key);
      //       }
      //     }
      //   };
      //
      //   generateList(this.treeData);
      // }
      //
      // const value = e.target.value;
      // const expandedKeys = this.dataList.map((item) => {
      //   if (item.key.indexOf(value) > -1) {
      //     return getParentKey(item.key, this.treeData);
      //   }
      //
      //   return null;
      // }).filter((item, i, self) => item && self.indexOf(item) === i);
      //
      // Object.assign(this, {
      //   expandedKeys,
      //   searchValue      : value,
      //   autoExpandParent : true,
      // });
    },
  },
};
</script>

<style lang="less">
  #contact-tree {
    .ant-input-affix-wrapper {
      input {
        padding-right: 60px;
      }
    }
    .ant-tree-treenode-switcher{
      &-open, &-close {
        > .ant-tree-checkbox {
          margin: 12px 0 12px 0 !important;
        }
        > .ant-tree-switcher{
          margin: 8px 6px 8px 0 !important;
          .ant-tree-switcher-icon{
            font-size: 16px;
            color: #999;
          }
        }
        > .ant-tree-node-content-wrapper {
          margin: 8px 0 8px 0 !important;
          padding: 0 8px;
        }
      }
    }
    .ant-tree-switcher-noop {
      width: 30px;
    }
    li{
      padding: 0;
      .ant-tree-checkbox {
        margin: 20px 0 0 0 !important;
      }
      .ant-tree-node-content-wrapper {
        &-normal {
          width: 80%;
          height: 56px !important;
          padding: 0 8px;
          .ant-tree-title {
            display: block;
            height: 100%;
          }
        }
      }
    }
  }
</style>
