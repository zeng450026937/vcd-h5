<template>
  <a-layout id="local-contact" class="h-full">
    <div class="flex flex-col h-full">
      <div class="h-14 border-b">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>本地联系人</span>
            <a-iconfont class="ml-4 text-indigo cursor-pointer no-dragable"
                        title="添加本地联系人"
                        type="icon-tianjialianxiren"
                        @click="addLocalContact"/>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <div class="flex h-full m-4 bg-white border">
        <div class="h-full border-r overflow-y-auto px-1 py-1"
             style="width: 280px">
          <contact-list
              enable-keyboard
              :contact-list="gapLocalContact"
              @clickItem="clickItem">
            <a-dropdown slot-scope="{item}"
                        slot="more"
                        @click.stop=""
                        :trigger="['click']">
              <a-iconfont type="icon-gengduo1"
                          title="更多"
                          class="mr-2 text-indigo cursor-pointer text-base"/>
              <a-menu slot="overlay">
                <a-menu-item @click="editContact(item)">
                  <a-iconfont type="icon-bianji"/>
                  <span>编辑该联系人</span>
                </a-menu-item>
                <a-menu-item @click="deleteContact(item)">
                  <a-iconfont type="icon-shanchu"/>
                  <span>删除该联系人</span>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </contact-list>
        </div>
        <div class="flex flex-grow bg-white justify-center">
          <contact-info :user="currentUser" :group="groupInfo"
                        style="width: 368px"/>
        </div>
      </div>
      <local-contact-drawer ref="localContactDrawer" :type="drawerType"/>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import ContactInfo from './ContactInfo.vue';
import ContactList from './ContactList.vue';
import LocalContactDrawer from './LocalContactDrawer.vue';

export default {
  name       : 'LocalContact',
  components : {
    AppHeader,
    ContactInfo,
    ContactList,
    LocalContactDrawer,
  },
  data() {
    return {
      currentUser : {},
      drawerType  : '',
    };
  },
  created() {
    this.$dispatch('storage.initData');
  },
  destroyed() {
    this.$popup.destroyAll();
  },
  computed : {
    localContacts() {
      return this.$model.storage.localContactGroup.items;
    },
    gapLocalContact() {
      const list = [];
      const tmp = this.localContacts;

      tmp.sort((c1, c2) => (c1.group < c2.group ? -1 : 1));
      let preGapText = '';

      tmp.forEach((contact, index) => {
        if (preGapText !== contact.group) {
          preGapText = contact.group;
          list.push({
            id      : index,
            isGap   : true,
            gapText : preGapText,
          });
        }
        list.push(contact);
      });
      
      return list;
    },
    groupInfo() {
      return {
        group  : '本地联系人',
        amount : this.localContacts.length,
      };
    },
  },
  methods : {
    editContact(item) {
      this.$refs.localContactDrawer.visible = true;
      this.$refs.localContactDrawer.form.$nextTick(() => {
        this.drawerType = 'edit';
        this.$refs.localContactDrawer.editedContact = item;
      });
    },
    deleteContact(item) {
      this.ensureModal = this.$popup.prepared('ensureModal', { content: `确认删除用户 ${item.name}?` });
      this.ensureModal.vm.$on('cancel', () => {});
      this.ensureModal.vm.$on('ok', () => {
        this.$dispatch('storage.deleteData', { id: item.id }).then(() => {
          this.$refs.localContactDrawer.visible = false;
          this.$message.success('删除成功');
          this.ensureModal.hide();
        });
      });
      this.ensureModal.display();
    },
    addLocalContact() {
      this.$refs.localContactDrawer.visible = true;
      this.$refs.localContactDrawer.form.$nextTick(() => {
        this.drawerType = 'add';
      });
    },
    clickItem(contact) {
      this.currentUser = contact;
    },
  },
};
</script>
