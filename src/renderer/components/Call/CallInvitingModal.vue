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
      <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleOk">
        确定
      </a-button>
      <a-button key="back" @click="handleCancel" class="ml-4">取消</a-button>
    </template>
    <a-tabs v-model="currentTab" class="inviting-tabs">
      <a-tab-pane tab="邀请联系人" key="inviteUser">
        <div style="height: 420px;">
          <div class="flex h-full p-5">

            <div class="w-1/2 bg-white overflow-hidden shadow">
              <contact-tree ref="contactTree"
                            :checked="checkedKeys"
                            @onCheck="onCheck"></contact-tree>
            </div>
            <div class="flex mx-3 justify-center items-center">
              <a-iconfont type="right" class="text-grey text-2xl cursor-pointer"/>
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
      <a-tab-pane tab="邀请其他" key="inviteOther">
        <div style="height: 420px;">
          <div class="flex flex-col items-center justify-center h-full">
            <div class="flex">
              <span class="leading-normal mt-1">协议</span>
              <div class="flex flex-col ml-5" style="width: 280px;">
                <a-select v-model="protocol">
                  <a-select-option v-for="protocol in protocols" :key="protocol" :value="protocol">
                    {{protocol}}
                  </a-select-option>
                </a-select>
              </div>
            </div>
            <div class="flex items-center mt-10">
              <span class="leading-normal">{{numberTitle}}</span>
              <a-input :placeholder="inputPlaceholder"
                       v-model="address"
                       style="width: 280px;" class="ml-5"/>
            </div>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script>
/* eslint-disable no-loop-func */
import copy from 'clipboard-copy';
import ContactTree from '../Main/Contact/ContactTree.vue';
import ContactList from '../Main/Contact/ContactList.vue';

export default {
  name       : 'CallInvitingModal',
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
      protocols       : [ 'SIP', 'H.323', 'rtmp', 'SfB(Lync)' ],
      protocol        : 'H.323',
      address         : '',
      currentTab      : 'inviteUser', // inviteUser inviteOther
      copyBtn         : null,
    };
  },
  computed : {
    numberTitle() {
      return this.protocol === 'rtmp' ? '地址' : '号码';
    },
    inputPlaceholder() {
      switch (this.protocol) {
        case 'SIP':
        case 'H.323':
          return '请输入IP地址或者URI';
        case 'rtmp':
          return '地址以rtmp://或rtmps://开头';
        case 'SfB(Lync)':
          return '请输入SfB(Lync)账号信息';
        default:
          return '';
      }
    },
  },
  methods : {
    handleOk() {
      if (this.confirmLoading) return;
      this.confirmLoading = true;

      if (this.currentTab === 'inviteUser') {
        // 邀请联系人
        this.inviteUser();
      }
      else {
        // 邀请其他
        this.inviteOther();
      }
    },
    inviteUser() {
      const users = this.selectedContact.map((user) => ({
        requestUri : `sip:${user.ip}`,
      }));

      this.$rtc.call.upgrade(users)
        .then(() => {
          this.confirmLoading = false;
          this.visible = false;
        })
        .catch(() => {
          this.confirmLoading = false;
        });
    },
    inviteOther() {
      const { address, protocol } = this;

      if (!address) return;
      const prefix = protocol === 'H.323' ? 'h323:' : 'sip:';

      const _address = address.startsWith(prefix)
      && protocol !== 'rtmp'
        ? address : prefix + address;
      const user = {
        requestUri : _address,
      }

      this.$rtc.call.upgrade(user).then(() => {
        this.confirmLoading = false;
        this.visible = false;
      }).catch(() => {
        this.confirmLoading = false;
      });
    },
    handleCancel() {
      this.confirmLoading = false;
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
