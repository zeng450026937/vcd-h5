<template>
  <a-layout id="instant-meeting" class="h-full w-full">

    <div class="flex flex-col h-full">

      <app-header :title="`${rootNode.name || ''} ${rootNode.amount? '('+ rootNode.amount + ')' : '' }`"/>

      <a-divider class="my-0"/>
        <div class="flex flex-col h-full m-4">
          <transfer
              :search="searchContact"
              :max-checked="100"
              :getChild="getAsyncChildNodes"
              :loadMode="loadMode"
              ref="transfer">
          </transfer>
        </div>
        <div class="flex flex-grow"></div>
      <a-divider class="my-0"/>

      <div class="h-12">
        <div class="flex justify-center items-center py-2 bg-white">
          <a-button large type="primary"
                    class="w-24 text-sm"
                    @click="enterMeeting"
          >开始会议
          </a-button>
        </div>
      </div>

    </div>

  </a-layout>
</template>

<script>
/* eslint-disable no-loop-func */

import AppHeader from '../MainHeader.vue';
import CommonEmpty from '../../Shared/CommonEmpty.vue';
import ContactTree from '../Contact/ContactTree.vue';
import ContactList from '../Contact/ContactList.vue';
import transfer from '../../transfer/index.vue';

export default {
  name       : 'InstantMeeting',
  components : {
    AppHeader,
    ContactTree,
    ContactList,
    CommonEmpty,
    transfer,
  },
  data() {
    return {
      enterPopup      : '',
      checkedKeys     : [ ],
      selectedContact : [ ],
    };
  },
  watch : {
    dataLoaded(val) {
      if (val) {
        this.create();
      }
    },
  },
  computed : {
    dataLoaded() {
      return this.$model.contact.phoneBookLoaded;
    },
    loadMode() {
      return this.$model.contact.loadMode;
    },
    store() {
      return this.$model.contact.phoneBookStore;
    },
    contacts() {
      return this.$model.contact.phoneBookStore.originTree;
    },
    currentUser() {
      return this.$model.contact.currentUser;
    },
    rootNode() {
      if (!this.store) {
        return {
          name : '',
        };
      }

      return this.store.rootNode;
    },
  },
  mounted() {
    if (this.dataLoaded) {
      this.create();
    }
  },
  methods : {
    getAmount(id) {
      return this.store.getAmount(id);
    },
    enterMeeting() {
      const checked = this.$refs.transfer.getChecked()
        .map((item) => ({ requestUri: item.number }));

      this.$dispatch('meeting.meetnow', {
        checked,
        options : {
          subject : `${this.$rtc.account.username} 的视频会议`,
        },
      });
    },
    getAsyncChildNodes(id) {
      return this.$model.contact.getAsyncChildNodes(id);
    },
    searchContact(val) {
      return this.$model.contact.findContacts(val);
    },
    create() {
      setTimeout(() => {
        this.$refs.transfer.create({
          data           : this.contacts,
          defaultChecked : this.currentUser,
        });
      });
    },
  },
};
</script>

<style>

</style>
