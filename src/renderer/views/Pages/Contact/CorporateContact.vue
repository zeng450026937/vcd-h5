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
          <div class="flex">
            <div class="ml-4 mt-2 mb-2 flex w-1 flex-grow">
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
                          :selected-contact="selectedContact"
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
                  <a-sub-menu key="test">
                    <span slot="title">{{$t('contact.frequent.addAs')}}</span>
                    <template v-if="favoriteGroup.length > 0">
                      <a-menu-item v-for="(group, index) in favoriteGroup"
                                   :key="index"
                                   @click="addToFavorite(group, item)">{{group.name}}
                      </a-menu-item>
                    </template>
                    <a-menu-item v-else
                                 class="cursor-not-allowed text-black9"
                    >{{$t('contact.frequent.noGroup')}}</a-menu-item>
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
  sketch : {
    ns    : 'ui',
    props : [ 'currentPhoneBookGroup', 'currentPhoneBookContact' ],
  },
  data() {
    return {
      breadcrumbs : [],
    };
  },
  computed : {
    isCloud() {
      return this.$model.login.sketch.isCloud;
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
    rootNode() {
      return this.store.rootNode;
    },
    rootGroup() {
      return this.store.rootGroup;
    },
    groupInfo() {
      return {
        company : this.rootNode.name,
        group   : this.currentGroupName,
        amount  : this.currentGroupAmount,
      };
    },
    currentGroupName() {
      const node = this.store.getNode(this.currentGroup) || {};

      return node.i18n ? this.$t(node.i18n) : node.name;
    },
    currentGroupAmount() {
      const node = this.store.getNode(this.currentGroup) || {};

      return node.amount;
    },
    selectedGroup() {
      return this.store.getNode(this.currentGroup);
    },
    currentGroupList() {
      if (this.currentGroup === 'rootNode') return this.rootGroup;

      return this.store.getChild(this.currentGroup);
    },

    favoriteGroup() {
      return this.$model.contact.favoriteStore.rootGroup;
    },
    currentGroup : {
      get() {
        return this.currentPhoneBookGroup;
      },
      set(val) {
        this.currentPhoneBookGroup = val;
      },
    },
    selectedContact : {
      get() {
        return this.currentPhoneBookContact;
      },
      set(val) {
        this.currentPhoneBookContact = val;
      },
    },
  },
  methods : {
    toGroup(path) {
      this.breadcrumbChange(path);
    },
    breadcrumbChange(item) {
      this.currentGroup = item.id;
      this.selectedContact = {};
    },
    async handleCheck(item) {
      if (!item.isGroup) return this.selectedContact = item;

      this.selectedContact = {};

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
        const group = this.store.getNode(val);

        if (!group) return [];

        this.breadcrumbs = this.store.findBranchWithSelf(group).map((i) => ({
          text : i.i18n ? this.$t(i.i18n) : i.name,
          id   : i.id,
        })).reverse();
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
