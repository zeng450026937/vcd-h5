<template>
  <a-layout id="contact-tree" class="h-full bg-white border">

    <a-input v-model="searchText"
             placeholder="搜索"
             class="h-10 rounded-none border-none">
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
    <div class="overflow-y-auto h-full border-t">
      <a-tree
          v-show="!searchText"
          checkable
          class="contact-tree mx-2"
          v-model="checkedKeys"
          :autoExpandParent="autoExpandParent"
          :expandedKeys="expandedKeys"
          :selectedKeys="selectedKeys"
          :treeData="treeData"
          :loadData="onLoadData"
          @check="onCheck"
          @expand="onExpand"
          @select="onSelect"
      >
        <div slot="title" slot-scope="contact"
             class="flex items-center h-14">
          <div>
            <a-avatar v-if="!contact.parent.isUser"
                      :size="32"
                      class="text-white">
              <a-iconfont :type="contact.avatar"/>
            </a-avatar>
            <a-avatar v-if="contact.parent.isUser"
                      :size="32">{{contact.nick}}
            </a-avatar>
          </div>

          <div class="flex flex-col truncate ml-2 justify-center">
            <span class="text-sm leading-none truncate">{{contact.title}}</span>
            <span class="text-xs opacity-75 leading-none mt-1">{{contact.number}}</span>
          </div>
        </div>
      </a-tree>
      <contact-search
          ref="contactSearch"
          v-if="searchText"
          :checked-keys="checkedKeys"
          :search-text="searchText"
          @onCheck="onSearchResultChecked"/>
    </div>

  </a-layout>
</template>

<script>
import ContactSearch from './ContactSearch.vue';

export default {
  name       : 'ContactTree',
  components : {
    ContactSearch,
  },
  props : {
    checked : {
      type : Array,
      default() {
        return [];
      },
    },
    selfChecked : { //
      type    : Boolean,
      default : false,
    },
    maxChecked : {
      type    : Number,
      default : 100,
    },
  },
  data() {
    return {
      searchText       : '',
      expandedKeys     : [],
      autoExpandParent : true,
      selectedKeys     : [],
      checkedKeys      : [],
    };
  },
  computed : {
    treeData() {
      const { formattedPhoneBook } = this.$model.contact;
      
      return formattedPhoneBook && formattedPhoneBook.items;
    },
    currentContact() {
      return this.$model.contact.currentContact;
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
    async onLoadData(treeNode) {
      if (treeNode.dataRef.isGroup) {
        await treeNode.dataRef.addChildNodes();
      }

      return Promise.resolve();
    },
    onExpand(expandedKeys, info) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onSelect(selectedKeys, info) {
      const hasChildren = info.node.$children.length > 0;
      const isContact = !info.node.dataRef.isGroup;

      if (hasChildren && !isContact) {
        info.node.onExpand(info.nativeEvent);
      }
      else {
        info.node.onCheck(info.nativeEvent);
      }
    },
    onCheck(checkedKeys, info) {
      // if (info.node.dataRef.isSelf && this.selfChecked) return;

      const checkedContact = [];

      let hasSelf = false;

      info.checkedNodes.every((contact) => { // 选出 maxChecked 个
        const dataRef = contact.data.props;

        if (!dataRef.isGroup) {
          checkedContact.push(dataRef);
          if (dataRef.isSelf) hasSelf = true;
        }
        
        return checkedContact.length < this.maxChecked;
      });

      if (this.currentContact && this.selfChecked && !hasSelf) {
        checkedContact.splice(this.maxChecked - 1); // 能选中的最大值为 100
        checkedContact.unshift(this.currentContact); // 插入自己
      }
      if (this.checkedKeys.length >= this.maxChecked || !hasSelf) { // 选中的联系人数据超过100的话
        this.checkedKeys = checkedContact.map((c) => c.id); // 设置为上面过滤之后的100个联系人
      }
      this.$emit('onCheck', checkedContact);
    },
    onSearchResultChecked(contact) {
      if (contact.checked) {
        this.$emit('onPush', contact);
        this.checkedKeys.push(contact.id);
      }
      else {
        if (contact.isSelf) {
          contact.checked = true;
          
          return;
        }
        const index = this.checkedKeys.findIndex((key) => key === contact.id);

        if (index > -1) this.checkedKeys.splice(index, 1);
        this.$emit('onPop', contact);
      }
    },
    unCheckSearchResult(contact) { // 不传递参数则表示全部取消选择
      if (!this.searchText) return;
      const { remoteContacts } = this.$refs.contactSearch;

      if (!contact) {
        remoteContacts.forEach((c) => c.checked = false);
        if (this.selfChecked) {
          const selfId = this.checkedKeys[0];
          const result = remoteContacts.find((c) => c.id === selfId);

          if (result) {
            result.checked = true;
          }
        }
      }
      else {
        const result = remoteContacts.find((c) => c.id === contact.id);

        if (result) {
          result.checked = false;
        }
      }
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
          &_open, &_close{
            margin: 8px 6px 8px 0 !important;
          }
          .ant-tree-switcher-icon{
            font-size: 16px;
            color: #999;
          }
        }
        > .ant-tree-node-content-wrapper {
          width: 75%;
          margin: 8px 4px !important;
          /*padding: 0 8px;*/
        }
      }
    }

    .ant-tree-switcher-noop {
      width: 30px;
    }

    li {
      padding: 0;

      .ant-tree-checkbox {
        margin: 20px 0 0 0 !important;
      }

      .ant-tree-node-content-wrapper {
        &-normal {
          width: 75%;
          height: auto;
          margin: 0 8px;

          .ant-tree-title {
            display: block;
            height: auto;
          }
        }
      }
    }
  }
</style>
