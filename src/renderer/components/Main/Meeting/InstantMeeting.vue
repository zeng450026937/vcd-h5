<template>
  <a-layout id="instant-meeting" class="h-full w-full">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <div v-if="contacts"
                 class="text-base font-medium"
            >{{`${contacts.name}（${contacts.amount}）`}}
            </div>
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
                        self-checked
                        @onCheck="onCheck"
                        @onPush="onPush"
                        @onPop="onPop"
          ></contact-tree>
        </div>
        <div class="flex mx-2 justify-center items-center">
          <a-iconfont type="icon-right" class="text-grey text-3xl cursor-pointer"/>
        </div>
        <div class="flex w-1/2 bg-white overflow-hidden border">
          <div class="w-full flex flex-col">
            <div class="border-b">
              <div class="flex flex-col">
                <div class="flex h-10 items-center px-3">
                  <span class="flex flex-grow text-sm leading-normal">{{selectedContact.length || 0}}/100</span>
                  <span v-if="selectedContact.length > 1"
                        class="flex text-indigo text-xs cursor-pointer leading-tight"
                        @click="clearAll">全部清空</span>
                </div>
              </div>
            </div>
            <template v-if="!selectedContact.length">
              <common-empty class="mt-10 text-grey"
                            image="empty-contact"
                            text="当前只有本人加入会议"/>
            </template>
            <contact-list v-else
                          :contactList="selectedContact"
                          :video-icon="false"
                          :audio-icon="false"
                          delete-icon highlightSelected
                          hide-popup
                          self-un-deleted
                          @deleteContact="deleteContact"
            ></contact-list>
          </div>
        </div>
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
import PlainTree from '../../Common/CommonTree/index.vue';

export default {
  name       : 'InstantMeeting',
  components : {
    AppHeader,
    ContactTree,
    ContactList,
    CommonEmpty,
    PlainTree,
  },
  data() {
    return {
      enterPopup      : '',
      checkedKeys     : [ ],
      selectedContact : [ ],
    };
  },
  computed : {
    currentContact() {
      return this.$model.contact.currentContact;
    },
    contacts() {
      return this.$model.contact.phoneBook;
    },
  },
  mounted() {
  },
  methods : {
    deleteContact(contact) {
      const { checkedKeys, unCheckSearchResult } = this.$refs.contactTree;

      let parent = contact;
      const i = this.selectedContact.findIndex((c) => c.id === contact.id);

      if (i >= 0) this.selectedContact.splice(i, 1);

      while (parent) {
        const index = checkedKeys.findIndex((c) => c === parent.id);

        if (index >= 0) checkedKeys.splice(index, 1);
        parent = parent.parent;
      }
      // 取消勾选搜索结果
      unCheckSearchResult(contact);
    },
    enterMeeting() {
      const list = [];

      this.selectedContact.forEach((item) => {
        list.push({
          requestUri : item.number,
        });
      });
      this.$rtc.conference.meetnow(list, { subject: `${this.$rtc.account.username} 的视频会议` });
    },
    onCheck(selectedContact) {
      this.selectedContact = selectedContact;
    },
    onPush(contact) {
      this.selectedContact.push(contact);
    },
    onPop(contact) {
      if (contact.id === this.currentContact.id) return;
      const index = this.selectedContact.findIndex((c) => c.id === contact.id);

      if (index > -1) this.selectedContact.splice(index, 1);
    },
    clearAll() {
      this.selectedContact = [ this.currentContact ];
      this.$refs.contactTree.checkedKeys = [ this.currentContact.id ];
      this.$refs.contactTree.unCheckSearchResult();
    },
  },
  watch : {
    currentContact : {
      handler(val) {
        if (val && this.checkedKeys.length <= 0) {
          this.checkedKeys.push(this.currentContact.id);
          this.selectedContact.push(this.currentContact);
        }
      },
      immediate : true,
    },
  },
};
</script>

<style>

</style>
