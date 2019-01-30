<template>
  <a-modal
      :visible="visible"
      style="top: 70px;left: 32px"
      :width=728
      :closable=false
      @ok="handleOk"
      @cancel="handleCancel"
      wrapClassName="conference-inviting-modal"
  >
    <template slot="footer">
      <div class="absolute" style="line-height: 30px">
        <span v-if="!showCopySuccess" class="text-indigo leading-tight text-xs cursor-pointer"
              @click="copyConferenceInfo">复制会议信息</span>
        <span v-else class="leading-tight text-xs cursor-pointer"
              @click="copyConferenceInfo">复制成功!</span>
      </div>
      <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleOk">
        确定
      </a-button>
      <a-button key="back" @click="handleCancel" class="ml-4">取消</a-button>
    </template>
    <a-tabs defaultActiveKey="1" class="inviting-tabs">
      <a-tab-pane tab="邀请联系人" key="1">
        <div style="height: 420px;">
          <div class="flex h-full p-5">

            <div class="w-1/2 bg-white overflow-hidden shadow">
              <contact-tree ref="contactTree"
                            :checked="checkedKeys"
                            @onCheck="onCheck"></contact-tree>
            </div>
            <div class="flex mx-3 justify-center items-center">
              <a-icon type="right" class="text-grey text-2xl cursor-pointer"/>
            </div>
            <div class="flex w-1/2 bg-white overflow-hidden shadow">
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
        </div>
      </a-tab-pane>
      <a-tab-pane tab="邀请其他" key="2">
        <div style="height: 420px;">
          <div class="flex flex-col items-center justify-center h-full">
            <div class="flex">
              <span class="leading-normal mt-1">协议</span>
              <div class="flex flex-col ml-5" style="width: 280px;">
                <a-select defaultValue="H.322">
                  <a-select-option value="H.322">H.322</a-select-option>
                  <a-select-option value="SIP">SIP</a-select-option>
                  <a-select-option value="SfB">SfB</a-select-option>
                </a-select>
                <p class="mt-3 leading-tight text-xs">这里有一段协议说明文字，说明了当前协议具体的作用以及用发等等描叙文字</p>
              </div>
            </div>
            <div class="flex items-center mt-10">
              <span class="leading-normal">号码</span>
              <a-input placeholder="请输入IP地址或者URL" style="width: 280px;" class="ml-5"/>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script>
/* eslint-disable no-loop-func */

import ContactTree from '../Main/Contact/ContactTree.vue';
import ContactList from '../Main/Contact/ContactList.vue';

export default {
  name       : 'ConferenceInvitingModal',
  components : {
    ContactTree,
    ContactList,
  },
  data() {
    return {
      visible         : false,
      confirmLoading  : false,
      checkedKeys     : [],
      selectedContact : [],
      showCopySuccess : false,
    };
  },
  methods : {
    handleOk() {
      this.confirmLoading = true;

      setTimeout(() => {
        this.confirmLoading = false;
      }, 1000);
    },
    handleCancel() {
      this.visible = false;
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
    onCheck(selectedContact) {
      this.selectedContact = selectedContact;
    },
    clearAll() {
      this.selectedContact = [];
      this.$refs.contactTree.checkedKeys = [];
    },
    copyConferenceInfo() {
      this.showCopySuccess  = true;
      setTimeout(()=> {
        this.showCopySuccess = false
      }, 3000)
    },
  },
};
</script>

<style lang="less">
.conference-inviting-modal {
  .ant-modal-body {
    padding: 0;
    .ant-tabs-top-bar {
      margin: 0;
    }
  }
  .ant-modal-footer {
    text-align: center;
  }
  .inviting-tabs{
    .ant-tabs-nav-scroll {
      text-align: center;
    }
  }
}
</style>
