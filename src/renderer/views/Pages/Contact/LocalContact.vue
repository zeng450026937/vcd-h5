<template>
  <a-layout id="local-contact" class="h-full w-full">
    <div class="flex flex-col h-full">
      <div class="h-14 border-b">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>{{$t('contact.local.describe')}}</span>
            <a-iconfont class="ml-4 text-indigo cursor-pointer no-dragable"
                        :title="$t('contact.local.title.add')"
                        type="icon-tianjialianxiren"
                        @click="addLocalContact"></a-iconfont>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <div class="flex h-full m-4 bg-white border">
        <div class="border-r w-2/5">
          <div class="h-full p-1 overflow-y-hidden">
            <div v-if="localContacts.length <= 0"
                 class="flex flex-col h-full justify-center items-center">
              <common-empty image="empty-contact" :text="$t('contact.local.title.noContact')"/>
              <a-button type="primary" ghost
                        class="mt-8"
                        @click="addLocalContact">{{$t('contact.common.add')}}
              </a-button>
            </div>

            <contact-list
                v-else
                enable-keyboard
                :contact-list="localContacts"
                :selected-contact="currentUser"
                @check="handleCheck">
              <a-dropdown slot-scope="{item}"
                          slot="more"
                          @click.stop=""
                          :trigger="['click']">
                <a-iconfont type="icon-gengduo1"
                            :title="$t('contact.common.more')"
                            class="mr-2 text-indigo cursor-pointer text-base"></a-iconfont>
                <a-menu slot="overlay">
                  <a-menu-item @click="editContact(item)">
                    <a-iconfont type="icon-bianji"></a-iconfont>
                    <span>{{$t('contact.button.editContact')}}</span>
                  </a-menu-item>
                  <a-menu-item @click="deleteContact(item)">
                    <a-iconfont type="icon-shanchu"></a-iconfont>
                    <span>{{$t('contact.button.deleteContact')}}</span>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </contact-list>
          </div>
        </div>
        <!--<div class="flex flex-grow bg-white justify-center w-2/5">-->
          <!--<contact-info :user="currentUser" :group="groupInfo"/>-->
        <!--</div>-->

        <div class="flex flex-grow w-3/5 bg-white justify-center">
          <contact-info :user="currentUser" :group="groupInfo"/>
        </div>

      </div>
      <local-contact-drawer @submit-success="handleSubmit" ref="localContactDrawer" :type="drawerType"/>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../../../components/Main/MainHeader.vue';
import CommonEmpty from '../../../components/Shared/CommonEmpty.vue';
import ContactInfo from '../../../components/Main/Contact/ContactInfo.vue';
import ContactList from '../../../components/Main/Contact/ContactList.vue';
import LocalContactDrawer from '../../../components/Main/Contact/LocalContactDrawer.vue';

export default {
  name       : 'LocalContact',
  components : {
    AppHeader,
    ContactInfo,
    CommonEmpty,
    ContactList,
    LocalContactDrawer,
  },
  data() {
    return {
      currentUser : {},
      drawerType  : '',
      maxContacts : 200,
    };
  },
  created() {
    this.$dispatch('contact.local.initData');
  },
  destroyed() {
    this.$popup.destroyAll();
  },
  computed : {
    localContacts() {
      const list = this.$model.contact.local.localContactGroup.items;

      list.forEach((n) => n.isLocal = true);

      return list;
    },
    groupInfo() {
      return {
        group  : this.$t('contact.local.describe'),
        amount : this.localContacts.length,
      };
    },
  },
  methods : {
    editContact(item) {
      this.$refs.localContactDrawer.visible = true;
      this.$refs.localContactDrawer.form.$nextTick(() => {
        this.drawerType = 'edit';
        this.$refs.localContactDrawer.form.setFieldsValue({
          number : item.number,
          email  : item.email,
          name   : item.name,
          phone  : item.phone,
        });
        this.$refs.localContactDrawer.editedContact = item;
      });
    },
    deleteContact(item) {
      this.ensureModal = this.$popup.prepared('ensureModal', { content: this.$t('contact.message.confirmDelete', { name: item.name }) });
      this.ensureModal.vm.$on('cancel', () => {});
      this.ensureModal.vm.$on('ok', () => {
        this.$dispatch('contact.local.deleteData', { id: item.id }).then(() => {
          this.$refs.localContactDrawer.visible = false;
          this.$message.success(this.$t('contact.message.deleteSuccess'));
          this.ensureModal.hide();
          this.currentUser = {};
        });
      });
      this.ensureModal.display();
    },
    addLocalContact() {
      if (this.localContacts.length >= this.maxContacts) {
        return this.$message.info(
          this.$t(
            'contact.message.addContact',
            { number: this.maxContacts }
          ),
        );
      }
      this.$refs.localContactDrawer.visible = true;
      this.$refs.localContactDrawer.form.$nextTick(() => {
        this.drawerType = 'add';
        this.$refs.localContactDrawer.form.setFieldsValue({ number: '', email: '', name: '', phone: '' });
      });
    },
    handleCheck(contact) {
      this.currentUser = contact;
    },
    handleSubmit() {
      this.updateCurrentUserInfo();
    },
    updateCurrentUserInfo() {
      if (!this.currentUser) return;

      const id = this.currentUser.id;

      this.currentUser = this.localContacts.find((n) => n.id === id);
    },
  },
};
</script>
