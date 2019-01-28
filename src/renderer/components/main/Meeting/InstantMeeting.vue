<template>
  <a-layout id="instant-meeting" class="h-full">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>即时会议</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="flex h-full m-4">

        <div class="w-1/2 bg-white overflow-hidden">
          <contact-tree ref="contactTree"
                        :checked="checkedKeys"
                        @onCheck="onCheck"></contact-tree>
        </div>
        <div class="flex mx-3 justify-center items-center">
          <a-icon type="right" class="text-grey text-2xl cursor-pointer"/>
        </div>
        <div class="flex w-1/2 bg-white overflow-hidden">
          <div class="w-full flex flex-col">
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
      <div class="flex flex-grow"></div>
      <a-divider class="my-0"/>
      <div class="flex justify-center items-center py-2 bg-white">
        <a-button large type="primary"
                  :disabled="selectedContact.length <= 0"
                  class="w-24 text-sm"
                  @click="enterMeeting"
        >开始会议</a-button>
      </div>
    </div>
  </a-layout>
</template>

<script>
/* eslint-disable no-loop-func */

import AppHeader from '../MainHeader.vue';
import ContactTree from '../Contact/ContactTree.vue';
import ContactList from '../Contact/ContactList.vue';

export default {
  name       : 'InstantMeeting',
  components : {
    AppHeader,
    ContactTree,
    ContactList,
  },
  data() {
    return {
      enterPopup      : '',
      checkedKeys     : [],
      selectedContact : [],
    };
  },
  methods : {
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
    enterMeeting() {
      this.$message.info('入会成功');
      // this.enterPopup = this.$popup.prepared('loadingModal').display();
      // this.enterPopup.vm.$on('cancel', () => {
      //   this.$popup.destroy(this.enterPopup);
      // });
    },
    cancelEnter() {
      console.warn('Enter Canceled');
    },
    onCheck(selectedContact) {
      this.selectedContact = selectedContact;
    },
    clearAll() {
      this.selectedContact = [];
      this.$refs.contactTree.checkedKeys = [];
    },
  },
};
</script>

<style scoped>

</style>
