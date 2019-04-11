<template>
  <div id="instant-meeting" class="flex flex-col h-full  w-full">

    <app-header :title="`${rootNode.name || ''} ${rootNode.amount? '('+ rootNode.amount + ')' : '' }`"/>

    <a-divider class="my-0"/>
    <div class="flex flex-col h-full meeting-transfer-content">
      <transfer
          :disabled="disabled"
          :load-failed="dataLoadFailed"
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
</template>

<script>
/* eslint-disable no-loop-func */

import AppHeader from '../../../components/Main/MainHeader.vue';
import CommonEmpty from '../../../components/Shared/CommonEmpty.vue';
import ContactTree from '../../../components/Main/Contact/ContactTree.vue';
import ContactList from '../../../components/Main/Contact/ContactList.vue';
import transfer from '../../../components/transfer/index.vue';

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
    dataLoadFailed() {
      return this.$model.contact.phoneBookLoadFailed;
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
    disabled() {
      return this.currentUser ? [ this.currentUser.id ] : [];
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
      let users;

      try {
        users = this.$refs.transfer.getChecked()
          .map((item) => ({ requestUri: item.number }));
      }
      catch (e) {
        users = [];
      }


      this.$dispatch('meeting.meetnow', { users });
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
          data : this.contacts,
        });
      });
    },
  },
};
</script>

<style lang="less">
  #instant-meeting {
    background: #f0f2f8;
    .meeting-transfer-content {
      margin: 16px 64px;
    }
  }
</style>
