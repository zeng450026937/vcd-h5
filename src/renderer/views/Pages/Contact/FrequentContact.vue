<template>
  <a-layout id="frequent-contact" class="h-full w-full">

    <div class="flex flex-col h-full">
      <div class="h-14 border-b">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <a-iconfont v-if="currentGroup !== 'rootNode'" type="icon-left"
                        :title="$t('contact.button.back')"
                        class="text-grey-dark text-xs mr-2 no-dragable cursor-pointer hover:text-indigo-dark"
                        @click="goBack"></a-iconfont>
            <span class="font-semibold">{{currentGroupName}}</span>
            <a-iconfont v-if="currentGroup === 'rootNode' && rootGroup.length<100"
                        :title="$t('contact.frequent.addFrequentGroup')"
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
            <common-empty image="empty-contact" :text="$t('contact.frequent.noFrequent')"/>
            <a-button type="primary" ghost class="mt-8" @click="addGroup">
              {{$t('contact.frequent.addGroup')}}
            </a-button>
          </div>
          <contact-list
              v-else
              :storeName="storeName"
              :store="store"
              :currentGroup="currentGroup"
              :selected-contact="currentUser"
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
                  :title="$t('contact.common.more')"
                  class="mr-2 text-indigo cursor-pointer text-sm">
              </a-iconfont>

              <a-iconfont
                  v-else
                  type="icon-gengduo1"
                  :title="$t('contact.common.more')"
                  class="mr-2 text-indigo cursor-pointer text-sm">
              </a-iconfont>

              <a-menu slot="overlay" v-if="item.isGroup">
                <a-menu-item @click="editGroup(item)">
                  {{$t('contact.frequent.editGroup')}}
                </a-menu-item>
                <a-menu-item @click="removeGroup(item)">
                  {{$t('contact.frequent.deleteGroup')}}
                </a-menu-item>
              </a-menu>
              <a-menu slot="overlay" v-else>
                <a-sub-menu key="test">
                  <span slot="title">{{$t('contact.frequent.moveContact')}}</span>
                  <template v-if="groupList.length > 1">
                    <a-menu-item v-for="(group, index) in groupList"
                                 v-if="group.id !== currentGroup"
                                 :key="index"
                                 @click="moveContact(group, item)">
                      {{group.name}}
                    </a-menu-item>
                  </template>
                  <a-menu-item class="cursor-not-allowed text-black9" v-else>
                    {{$t('contact.frequent.noOtherGroup')}}
                  </a-menu-item>
                </a-sub-menu>

                <a-menu-item @click="removeContact(item)">
                  {{$t('contact.frequent.removeContact')}}
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
      <frequent-contact-drawer ref="contactDrawer" :modal-type="modalType"/>
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
  sketch : {
    ns    : 'ui',
    props : [ 'currentFavoriteGroup', 'currentFavoriteContact' ],
  },
  data() {
    return {
      modalType : 'add',
      storeName : 'favoriteStore',
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
      if (this.currentGroup === 'rootNode') {
        if (this.rootNode.i18n) return this.$t(this.rootNode.i18n);

        return this.rootNode.name;
      }

      const currentGroup = this.store.getNode(this.currentGroup);

      if (!currentGroup) return '';

      const group = this.store.getNode(this.currentGroup);

      if (group.i18n) return this.$t(group.i18n);

      return this.store.getNode(this.currentGroup).name;
    },
    frequentContacts() {
      return this.$model.contact.favorite;
    },
    groupList() {
      return this.rootGroup;
    },
    currentGroup : {
      get() {
        return this.currentFavoriteGroup;
      },
      set(val) {
        this.currentFavoriteGroup = val;
      },
    },
    currentUser : {
      get() {
        return this.currentFavoriteContact;
      },
      set(val) {
        this.currentFavoriteContact = val;
      },
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
      this.genEnsurePopup(this.$t('contact.message.confirmDeleteGroup'), () => {
        // 删除当前分组
        this.$rtc.contact.favorite.categoryDelete({ id: group.id }).then(() => {
          this.$message.success(this.$t('contact.message.deleteSuccess'));
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
          this.$message.success(this.$t('contact.message.moveSuccess'));
        });
      }).catch(() => {
        this.$message.error(this.$t('contact.message.moveFailed'));
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

      this.genEnsurePopup(this.$t('contact.message.sureToDelFreContact'), () => {
        // 删除当前联系人
        this.deleteContact(contact, group).then(() => {
          this.$rtc.contact.favorite.doSync().then(() => {
            this.$message.success(this.$t('contact.message.deleteSuccess'));
          });
        }).catch(() => {
          this.$message.error(this.$t('contact.message.deleteFailed'));
        });
      }, () => {
      });
    },
  },
  watch : {

  },
};
</script>

<style lang="less">

</style>
