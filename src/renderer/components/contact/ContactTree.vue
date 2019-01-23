<template>
  <a-layout id="contact-tree" class="h-full bg-white">
    <a-input-search
        placeholder="搜索"
        class="h-10 mb-2"
    ></a-input-search>
    <div class="overflow-y-auto h-full px-2">
      <a-tree
          checkable
          :autoExpandParent="autoExpandParent"
          v-model="checkedKeys"
          @check="onCheck"
          :selectedKeys="selectedKeys"
          :treeData="treeData"
          class="contact-tree"
          :loadData="onLoadData"
      >
        <div slot="title" slot-scope="contact" class="flex h-full items-center">
          <a-avatar v-if="!contact.parent.isUser"
                    :icon="contact.avatar"
                    :size="32"
                    class="text-white bg-indigo-dark"/>
          <a-avatar v-if="contact.parent.isUser"
                    :size="32"
                    :class="{[`bg-${contact.avatar}`]: true}"
          >{{contact.name.substr(-2, 2)}}
          </a-avatar>

          <div class="flex flex-col ml-2 justify-center">
            <span class="text-sm leading-none">{{contact.title}}</span>
            <span class="text-xs opacity-75 leading-none mt-1">{{contact.ip}}</span>
          </div>
        </div>
      </a-tree>
    </div>

  </a-layout>
</template>

<script>

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
      expandedKeys     : [],
      autoExpandParent : true,
      selectedKeys     : [],
      checkedKeys      : [],
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
      console.warn(treeNode);
      if (treeNode.dataRef.isGroup) {
        treeNode.dataRef.addChildNodes();
      }
    },
    onCheck(checkedKeys, info) {
      console.warn(info);
      const checkedContact = [];

      info.checkedNodes.forEach((c) => {
        const dataRef = c.data.props;

        if (!dataRef.isGroup) {
          // dataRef.vnode = info.node;
          checkedContact.push(dataRef);
        }
      });
      this.$emit('onCheck', checkedContact);
    },
  },
};
</script>

<style lang="less">
  .contact-tree {
    .ant-tree-treenode-switcher{
      &-open, &-close {
        > .ant-tree-checkbox {
          margin: 12px 0 12px 0 !important;
        }
        > .ant-tree-switcher{
          margin: 8px 6px 8px 0 !important;
        }
        > .ant-tree-node-content-wrapper {
          margin: 8px 0 8px 0 !important;
          padding: 0 8px;
        }
      }
    }
    li{
      padding: 0;
      .ant-tree-checkbox {
        margin: 20px 0 0 0 !important;
      }
      .ant-tree-node-content-wrapper {
        &-normal {
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
