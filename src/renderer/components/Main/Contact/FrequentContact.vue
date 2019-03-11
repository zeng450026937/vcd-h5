<template>
  <a-layout id="frequent-contact" class="h-full">

    <div class="flex flex-col h-full">
      <div class="h-14 border-b">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <a-iconfont v-if="!selectedGroup.isRoot" type="icon-left"
                        title="返回"
                        class="text-grey-dark text-xs mr-2 no-dragable cursor-pointer hover:text-purple-dark"
                        @click="goBack"/>
            <span>{{selectedGroup.name}}</span>
            <a-iconfont v-if="selectedGroup.isRoot"
                        title="添加常用联系人分组"
                        class="ml-4 text-indigo cursor-pointer no-dragable"
                        type="icon-tianjiafenzu"
                        theme="filled" @click="addGroup"/>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <div class="flex h-full m-4 bg-white border">
        <div class="h-full border-r overflow-y-auto px-1 py-1 w-2/5">
          <div v-if="selectedGroup.isRoot && currents.length <= 0"
               class="flex flex-col h-full justify-center items-center">
            <common-empty image="empty-contact" text="暂未添加常用联系人"/>
            <a-button type="primary" ghost
                      class="mt-8"
                      @click="addGroup">添加分组</a-button>
          </div>
          <contact-list
              v-else
              :contact-list="currents"
              enable-keyboard
              :audio-icon="false"
              @clickItem="clickItem">
            <a-dropdown slot-scope="{item}"
                        slot="more"
                        :trigger="['click']">
              <a-iconfont type="icon-gengduo1"
                          title="更多"
                      class="mr-2 text-indigo cursor-pointer text-sm"
                      @click.stop="moreOption(item)"/>
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
                                 v-if="group.id !== item.parent.id"
                                 :key="index"
                                 @click="moveContact(group, item)">{{group.name}}</a-menu-item>
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
                        :group="groupInfo"
                        @toGroup="toGroup"/>
        </div>
      </div>
      <frequent-contact-drawer ref="contactDrawer"
                               :modal-type="modalType"/>
    </div>
  </a-layout>
</template>

<script>
/* eslint-disable no-loop-func */
import AppHeader from '../MainHeader.vue';
import CommonEmpty from '../../Shared/CommonEmpty.vue';
import ContactInfo from './ContactInfo.vue';
import FrequentContactDrawer from './FrequentContactDrawer.vue';
import ContactList from './ContactList.vue';

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
    };
  },
  mounted() {
    this.$rtc.contact.favorite.doSync().then(() => {});
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
    groupList() {
      return this.frequentContacts.items;
    },
  },
  methods : {
    editGroup(group) {
      this.modalType = 'edit';

      const { contactDrawer } = this.$refs;

      contactDrawer.visible = true;
      contactDrawer.groupName = group.name;
      contactDrawer.editedGroup = group;
      contactDrawer.groupName = group.name;
      contactDrawer.checkedKeys = group.items.map((g) => g.id);
      contactDrawer.selectedContact = group.items;
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
    moveContact(group, contact) {
      this.$rtc.contact.favorite.add({
        type        : contact.type,
        contactsId  : contact.id,
        categoryIds : [ group.id ],
      }).then(() => {
        this.$rtc.contact.favorite.doSync().then(() => {
          this.$message.success('移动成功');
        });
      }).catch(() => {
        this.$message.error('移动失败，请重试');
      });
    },
    removeContact(contact) {
      const group = contact.parent;

      this.genEnsurePopup('确认删除当前常用联系人?', () => {
        // 删除当前联系人
        this.$rtc.contact.favorite.delete({
          relations : [ {
            categoryId : group.id,
            contacts   : [ { contactsId: contact.id, type: contact.type } ],
          } ],
        }).then(() => {
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
