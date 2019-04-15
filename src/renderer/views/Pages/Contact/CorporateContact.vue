<template>
  <a-layout id="corporate-contacts" class="h-full w-full">
    <div class="flex flex-col h-full">
      <div class="border-b">
        <div class="flex flex-col bg-white min-h-18 dragable">
          <div class="flex">
            <div class="h-4 ml-4 mt-4">
              <div v-if="rootNode"
                   class="text-base font-semibold pb-2"
              >{{`${rootNode.name} ${rootNode.amount? '('+ rootNode.amount + ')' : '' }`}}
              </div>
            </div>
            <div class="flex flex-grow"></div>
            <div class="flex flex-row text-grey-darkest items-center justify-end cursor-pointer">
              <app-header class="text-grey-dark"/>
            </div>
          </div>
          <div>
            <div class="ml-4 mt-2 mb-2">
              <a-breadcrumb>
                <a-breadcrumb-item v-for="(crumb,index) in breadcrumbs"
                                   :key="crumb.id"
                                   class="cursor-pointer text-xs no-dragable"
                                   :class="{'text-indigo': index !==  breadcrumbs.length -1}">
                  <span @click="breadcrumbChange(crumb)">{{crumb.text}}</span>
                </a-breadcrumb-item>
              </a-breadcrumb>
            </div>
          </div>

        </div>
      </div>
      <div class="flex h-full m-4 bg-white border">
        <div class="border-r w-2/5">
          <div class="h-full p-1 overflow-y-hidden">
            <contact-list :contact-list="currentGroupList"
                          :load-mode="loadMode"
                          :current-group="currentGroup"
                          :store="store"
                          enable-keyboard
                          @toGroup="toGroup"
                          @check="handleCheck">
              <a-dropdown v-if="!isCloud && !item.isGroup && !item.isVMR"
                          slot-scope="{item}"
                          slot="more"
                          :trigger="['click']">
                <a-iconfont type="icon-gengduo1"
                            class="mr-2 text-indigo cursor-pointer text-sm"></a-iconfont>
                <a-menu slot="overlay">
                  <a-sub-menu title="添加为常用联系人" key="test">
                    <template v-if="favoriteGroup.length > 0">
                      <a-menu-item v-for="(group, index) in favoriteGroup"
                                   :key="index"
                                   @click="addToFavorite(group, item)">{{group.name}}
                      </a-menu-item>
                    </template>
                    <a-menu-item class="cursor-not-allowed text-black9" v-else>暂无分组</a-menu-item>
                  </a-sub-menu>
                </a-menu>
              </a-dropdown>
            </contact-list>
          </div>
        </div>
        <div class="flex flex-grow w-3/5 bg-white justify-center">
          <contact-info :user="selectedContact"
                        :store="store"
                        :group="groupInfo"
                        @toGroup="toGroup"/>
        </div>

      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../../../components/Shared/CommonHeader.vue';
import ContactList from '../../../components/Main/Contact/ContactList.vue';
import ContactInfo from '../../../components/Main/Contact/ContactInfo.vue';

export default {
  name       : 'CorporateContact',
  components : {
    AppHeader,
    ContactList,
    ContactInfo,
  },
  data() {
    return {
      breadcrumbs     : [],
      selectedContact : {},
      currentGroup    : 'rootNode',
    };
  },
  computed : {
    groupInfo() {
      return {
        company : this.rootNode.name,
        group   : this.currentGroupName,
        amount  : this.currentGroupAmount,
      };
    },
    LOAD_MODE() {
      return this.$model.contact.LOAD_MODE;
    },
    loadMode() {
      return this.$model.contact.loadMode;
    },
    store() {
      return this.$model.contact.phoneBookStore;
    },
    currentGroupName() {
      return this.store.getNode(this.currentGroup).name;
    },
    currentGroupAmount() {
      return this.store.getNode(this.currentGroup).amount;
    },
    selectedGroup() {
      return this.store.getNode(this.currentGroup);
    },
    rootGroup() {
      return this.store.rootGroup;
    },
    currentGroupList() {
      if (this.currentGroup === 'rootNode') return this.rootGroup;

      return this.store.getChild(this.currentGroup);
    },
    rootNode() {
      return this.store.rootNode;
    },
    favoriteGroup() {
      return this.$model.contact.favoriteStore.rootGroup;
    },
    isCloud() {
      return this.$model.account.serverType === 'cloud';
    },
  },
  methods : {
    toGroup(path) {
      this.breadcrumbChange(path);
    },
    breadcrumbChange(item) {
      const index = this.breadcrumbs.findIndex((b) => b.id === item.id);

      this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
      this.currentGroup = item.id;
      this.selectedContact = {};
    },
    async handleCheck(item) {
      if (!item.isGroup) {
        this.selectedContact = item;

        return;
      }

      this.breadcrumbs.push({
        id   : item.id,
        text : item.name,
      });

      if (this.loadMode === this.LOAD_MODE.SPLIT) {
        await this.$model.contact.getAsyncChildNodes({ parentId: item.id });
      }

      this.currentGroup = item.id;
    },
    addToFavorite(group, contact) { // 添加当前联系人到常用联系人分组
      this.$rtc.contact.favorite.add({
        type        : contact.node.type,
        contactsId  : contact.id,
        categoryIds : [ group.id ],
      }).then(() => {
        this.$message.success('添加成功');
      }).catch(() => {});
    },

  },
  watch : {
    currentGroup : {
      handler(val) {
        if (val && this.breadcrumbs.length === 0) {
          this.breadcrumbs.push({
            id   : this.rootNode.id,
            text : this.rootNode.name,
          });
        }
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
  .avatar-popover {
    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner-content {
      padding: 0;
    }
  }

</style>
