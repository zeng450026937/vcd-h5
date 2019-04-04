<template>
  <a-layout id="frequent-contact" class="h-full w-full">

    <div class="flex flex-col h-full">
      <div class="h-14 border-b">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <a-iconfont v-if="currentGroup !== 'rootNode'" type="icon-left"
                        title="返回"
                        class="text-grey-dark text-xs mr-2 no-dragable cursor-pointer hover:text-purple-dark"
                        @click="goBack"></a-iconfont>
            <span>{{currentGroupName}}</span>
            <a-iconfont v-if="currentGroup === 'rootNode' && rootGroup.length<100"
                        title="添加常用联系人分组"
                        class="ml-4 text-indigo cursor-pointer no-dragable"
                        type="icon-tianjiafenzu"
                        theme="filled" @click="addGroup"></a-iconfont>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <div class="flex h-full m-4 bg-white border">
        <div class="h-full border-r overflow-y-auto px-1 py-1 w-2/5">
          <div v-if="currentGroup === 'rootNode' && currents.length <= 0"
               class="flex flex-col h-full justify-center items-center">
            <common-empty image="empty-contact" text="暂未添加常用联系人"/>
            <a-button type="primary" ghost class="mt-8" @click="addGroup">添加分组</a-button>
          </div>
          <contact-list
              v-else
              :storeName="storeName"
              :store="store"
              :currentGroup="currentGroup"
              :contact-list="currents"
              enable-keyboard
              :audio-icon="false"
              @toGroup="goBack"
              @check="handleCheck">
            <a-dropdown slot-scope="{item}"
                        slot="more"
                        :trigger="['click']">

              <a-iconfont
                  v-if="item.isGroup"
                  @click.stop=""
                  type="icon-gengduo1"
                  title="更多"
                  class="mr-2 text-indigo cursor-pointer text-sm">
              </a-iconfont>

              <a-iconfont
                  v-else
                  type="icon-gengduo1"
                  title="更多"
                  class="mr-2 text-indigo cursor-pointer text-sm">
              </a-iconfont>

              <a-menu slot="overlay" v-if="item.isGroup">
                <a-menu-item @click="editGroup(item)">
                  编辑分组
                </a-menu-item>
                <a-menu-item @click="removeGroup(item)">
                  删除分组
                </a-menu-item>
              </a-menu>
              <a-menu slot="overlay" v-else>
                <a-sub-menu title="移动该联系人至" key="test">
                  <template v-if="groupList.length > 1">
                    <a-menu-item v-for="(group, index) in groupList"
                                 v-if="group.id !== currentGroup"
                                 :key="index"
                                 @click="moveContact(group, item)">
                      {{group.name}}
                    </a-menu-item>
                  </template>
                  <a-menu-item class="cursor-not-allowed text-black9" v-else>暂无其他分组</a-menu-item>
                </a-sub-menu>

                <a-menu-item @click="removeContact(item)">
                  移除该常用联系人
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </contact-list>
        </div>
        <div class="flex flex-grow bg-white justify-center w-3/5">
          <contact-info :user="currentUser"
                        :store="store"
                        :group="groupInfo"
                        @toGroup="goBack"/>
        </div>
      </div>
      <frequent-contact-drawer ref="contactDrawer"
                               :modal-type="modalType"/>
    </div>
  </a-layout>
</template>

<script>
/* eslint-disable no-loop-func */
import AppHeader from '../../../components/Main/MainHeader.vue';
import CommonEmpty from '../../../components/Shared/CommonEmpty.vue';
import ContactInfo from '../../../components/Main/Contact/ContactInfo.vue';
import FrequentContactDrawer from '../../../components/Main/Contact/FrequentContactDrawer.vue';
import ContactList from '../../../components/Main/Contact/ContactList.vue';

export default {
  name       : 'FrequentContact',
  components : {
    AppHeader,
    ContactInfo,
    FrequentContactDrawer,
    ContactList,
    CommonEmpty,
  },
  data() {
    return {
      currentUser   : {},
      selectedGroup : {},
      modalType     : 'add',
      currentGroup  : 'rootNode',
      storeName     : 'favoriteStore',
    };
  },
  beforeCreate() {
    this.$rtc.contact.favorite.doSync().then(() => {});
  },
  destroyed() {
    this.$popup.destroy(this.ensureModal);
  },
  computed : {
    store() {
      return this.$model.contact.favoriteStore;
    },
    groupInfo() {
      return {
        company : this.rootNode.name,
        group   : this.currentGroupName,
        amount  : this.getAmount(this.currentGroup),
      };
    },
    rootGroup() {
      return this.store.rootGroup;
    },
    rootNode() {
      return this.store.rootNode;
    },
    currents() {
      if (this.currentGroup === 'rootNode') return this.rootGroup;

      return this.store.getChild(this.currentGroup);
    },
    currentGroupName() {
      if (this.currentGroup === 'rootNode') return this.rootNode.name;

      const currentGroup = this.store.getNode(this.currentGroup);

      if (!currentGroup) return '';

      return this.store.getNode(this.currentGroup).name;
    },
    frequentContacts() {
      return this.$model.contact.favorite;
    },
    groupList() {
      return this.rootGroup;
    },
  },
  methods : {
    getAmount(id) {
      const node = this.store.getNode(id);

      return node ? node.amount : 0;
    },
    editGroup(group) {
      this.modalType = 'edit';
      this.$refs.contactDrawer.updateGroupInfo({
        groupName   : group.name,
        checkedList : this.store.getOffspringNoGroup(group.id),
        editedGroup : group,
      });

      this.$refs.contactDrawer.visible = true;
    },
    addGroup() {
      this.modalType = 'add';
      const { contactDrawer } = this.$refs;

      contactDrawer.visible = true;
      contactDrawer.groupName = '';
      contactDrawer.checkedKeys = [];
    },
    genEnsurePopup(content, ensureFn, cancelFn) {
      this.$popup.destroy(this.ensureModal);
      this.ensureModal = this.$popup.prepared('ensureModal', { content });
      this.ensureModal.vm.$on('cancel', () => {
        this.ensureModal.$off('cancel');
        cancelFn();
      });
      this.ensureModal.vm.$on('ok', () => {
        this.ensureModal.$off('ok');
        this.ensureModal.hide();
        ensureFn();
      });
      this.ensureModal.display();
    },
    removeGroup(group) {
      this.genEnsurePopup('确认删除当前分组?', () => {
        // 删除当前分组
        this.$rtc.contact.favorite.categoryDelete({ id: group.id }).then(() => {
          this.$message.success('删除成功');
        });
      }, () => {});
    },
    goBack() {
      this.currentGroup = 'rootNode';
      this.currentUser = {};
    },
    handleCheck(contact) {
      if (contact.isGroup) {
        this.currentGroup = contact.id;
      }
      else {
        this.currentUser = contact;
      }
    },
    moveContact(group, contact) {
      this.$rtc.contact.favorite.add({
        type        : contact.type,
        contactsId  : contact.id,
        categoryIds : [ group.id ],
      }).then(async() => {
        const currentGroup = this.store.getNode(contact.parentId);

        await this.deleteContact(contact, currentGroup);

        this.$rtc.contact.favorite.doSync().then(() => {
          this.$message.success('移动成功');
        });
      }).catch(() => {
        this.$message.error('移动失败，可能目标分组已经存在此联系人，请重试');
      });
    },

    deleteContact(contact, group) {
      return this.$rtc.contact.favorite.delete({
        relations : [ {
          categoryId : group.id,
          contacts   : [ { contactsId: contact.id, type: contact.type } ],
        } ],
      });
    },

    removeContact(contact) {
      const group = this.store.getNode(contact.parentId);

      this.genEnsurePopup('确认删除当前常用联系人?', () => {
        // 删除当前联系人
        this.deleteContact(contact, group).then(() => {
          this.$rtc.contact.favorite.doSync().then(() => {
            this.$message.success('删除成功');
          });
        }).catch(() => {
          this.$message.error('删除失败，请重试');
        });
      }, () => {
      });
    },
  },
  watch : {
    frequentContacts : {
      handler(val) {
        this.selectedGroup = val;
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">

</style>
