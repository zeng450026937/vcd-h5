<template>
  <a-layout id="frequent-contact" class="h-full">

    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <a-icon  v-if="!selectedGroup.isRoot" type="left"
                     class="text-grey-dark text-xs mr-2 no-dragable cursor-pointer hover:text-purple-dark"
                     @click="goBack"/>
            <span>{{selectedGroup.name}}</span>
            <a-icon v-if="selectedGroup.isRoot"
                    class="ml-4 text-indigo cursor-pointer no-dragable"
                    type="folder-add"
                    theme="filled" @click="addGroup"/>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="flex h-full m-3 bg-white shadow">
        <div class="h-full w-2/5 border-r overflow-y-auto px-1 py-1">
          <div v-if="selectedGroup.isRoot && currents.length <= 0"
               class="flex flex-col h-full justify-center items-center">
            <span class="text-sm text-grey-dark">暂未添加常用联系人</span>
            <a-button type="primary" ghost
                      class="mt-8"
                      @click="addGroup">添加分组</a-button>
          </div>
          <contact-list
              v-else
              :contact-list="currents"
              :audio-icon="false"
              @clickItem="clickItem">
            <a-dropdown slot-scope="{item}"
                        slot="more"
                        :trigger="['click']">
              <a-icon type="ellipsis"
                      class="mr-2 text-indigo cursor-pointer text-sm"
                      @click.stop="moreOption(item)"/>
              <a-menu slot="overlay" v-if="item.isGroup">
                <a-menu-item @click="editGroup(item)">
                  <a-icon type="edit" />
                  <span>编辑分组</span>
                </a-menu-item>
                <a-menu-item @click="deleteGroup(item)">
                  <a-icon type="delete" />
                  <span>删除分组</span>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </contact-list>
        </div>
        <div class="h-full w-3/5">
          <contact-info :user="currentUser" :group="groupInfo" @toGroup="toGroup"/>
        </div>
      </div>
      <a-drawer
          :title="modalTitle"
          placement="right"
          :width="648"
          :closable="false"
          @close="showDrawer = false"
          :visible="showDrawer"
          wrapClassName = "frequent-contact-drawer"
      >
        <div class="flex flex-col h-full w-full">
          <div class="flex flex-col p-5 flex-grow">
            <div>
              <a-input placeholder="请输入分组名称" v-model="groupName"/>
            </div>
            <div class="flex flex-grow mt-5">
              <div class="w-1/2 shadow-md">
                <contact-tree ref="contactTree"
                              :checked="checkedKeys"
                              @onCheck="onCheck"></contact-tree>
              </div>
              <div class="flex w-1/2">
                <div class="flex w-1/6 justify-center items-center">
                  <a-icon type="right" class="text-grey text-2xl cursor-pointer"/>
                </div>
                <div class="w-5/6 shadow-md flex flex-col">
                  <div class="border-b">
                    <div class="flex flex-col">
                      <div class="flex h-10 items-center px-3">
                        <span class="flex flex-grow text-sm">{{selectedContact.length || 0}}/100</span>
                        <span class="flex text-indigo text-xs cursor-pointer"
                              :class="{'text-grey cursor-not-allowed': selectedContact.length <= 0}"
                              @click="clearAll">全部清空</span>
                      </div>
                    </div>
                  </div>
                  <contact-list :contactList="selectedContact"
                                :video-icon="false"
                                :audio-icon="false"
                                delete-icon highlightSelected
                                @deleteContact="deleteContact"
                  ></contact-list>
                </div>
              </div>
            </div>

          </div>
          <div>
            <div class="flex h-14 border-t justify-center">
              <a-button type="primary" class="mx-2" @click="ensure">确定</a-button>
              <a-button class="mx-2" @click="showDrawer = false">取消</a-button>
            </div>
          </div>
        </div>
      </a-drawer>
    </div>
  </a-layout>
</template>

<script>
/* eslint-disable no-loop-func */
import AppHeader from '../MainHeader.vue';
import ContactInfo from './ContactInfo.vue';
import ContactList from './ContactList.vue';
import ContactTree from './ContactTree.vue';

export default {
  name       : 'FrequentContact',
  components : {
    AppHeader,
    ContactInfo,
    ContactList,
    ContactTree,
  },
  data() {
    return {
      currentUser     : {},
      showDrawer      : false,
      selectedGroup   : {},
      selectedContact : [],
      groupName       : '',
      checkedKeys     : [],
      modalType       : '', // add or edit
      editedGroup     : {},
    };
  },
  destroyed() {
    this.$popup.destroy(this.ensureModal);
  },
  computed : {
    groupInfo() {
      return {
        company : this.frequentContacts && this.frequentContacts.name,
        group   : this.selectedGroup.name,
        amount  : this.selectedGroup.amount,
      };
    },
    currents() {
      return (this.selectedGroup && this.selectedGroup.items) ? this.selectedGroup.items : [];
    },
    frequentContacts() {
      return this.$model.contact.favorite;
    },
    modalTitle() {
      return this.modalType === 'add' ? '添加分组' : '更新分组';
    },
  },
  methods : {
    editGroup(group) {
      this.modalType = 'edit';
      this.showDrawer = true;
      this.editedGroup = group;
      this.groupName = group.name;
      this.checkedKeys = group.items.map((g) => g.id);
      this.selectedContact = group.items;
    },
    addGroup() {
      this.groupName = '';
      this.checkedKeys = [];
      this.modalType = 'add';
      this.showDrawer = true;
    },
    deleteGroup(group) {
      this.genEnsurePopup('确认删除当前分组?', () => {
        // 删除当前分组
        this.$rtc.contact.favorite.categoryDelete({ id: group.id }).then(() => {
          this.$rtc.contact.favorite.doSync().then(() => {
            this.$message.success('删除成功');
          });
        });
      }, () => {});
    },
    moreOption(item) {
      console.warn(item);
    },
    goBack() {
      this.selectedGroup = this.selectedGroup.parent;
    },
    toGroup(path) {
      this.selectedGroup = path.length <= 1
        ? this.frequentContacts
        : this.frequentContacts.items.find((c) => c.id === path[1].id);
    },
    clickItem(contact) {
      if (contact.isGroup) {
        this.selectedGroup = contact;
      }
      else {
        this.currentUser = contact;
      }
    },
    onCheck(selectedContact) {
      this.selectedContact = selectedContact;
    },
    deleteContact(contact) {
      const { checkedKeys } = this.$refs.contactTree;
      let parent = contact;
      const i = this.selectedContact.findIndex((c) => c.id === contact.id);

      if (i >= 0) this.selectedContact.splice(i, 1);

      while (parent) {
        const index = checkedKeys.findIndex((c) => c === parent.id);

        if (index >= 0) checkedKeys.splice(index, 1);
        parent = parent.parent;
      }
    },
    clearAll() {
      if (this.selectedContact.length <= 0) return;
      this.genEnsurePopup('确认清除所有的联系人?', () => {
        this.selectedContact = [];
        this.$refs.contactTree.checkedKeys = [];
      }, () => {});
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
    async ensure() {
      if (this.modalType === 'edit') {
        await this.$rtc.contact.favorite.categoryEdit({
          id       : this.editedGroup.id,
          name     : this.groupName,
          contacts : this.selectedContact.map((c) => ({
            contactsId : c.id,
            type       : c.type,
          })),
        });
      }
      else {
        await this.$rtc.contact.favorite.categoryAdd({
          groupName : this.groupName,
          contacts  : this.selectedContact.map((c) => ({
            contactsId : c.id,
            type       : c.type,
          })),
        });
      }
      this.$rtc.contact.favorite.doSync().then(() => {
        this.$message.success(this.modalType === 'edit' ? '更新成功' : '添加成功');
        this.showDrawer = false;
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
  .frequent-contact-drawer {
    .ant-drawer-wrapper-body {
      display: flex;
      flex-direction: column;
    }
    .ant-drawer-header {
      padding: 13px 18px;
    }
    .ant-drawer-body {
      display: flex;
      height: 100%;
      padding: 0;
    }
  }
</style>
