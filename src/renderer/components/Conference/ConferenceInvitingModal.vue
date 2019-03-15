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
        <span v-else class="leading-tight cursor-pointer text-green items-center">
          <a-iconfont type="icon-tongguo" class="text-base"/>
          <span class="text-xs ml-1">复制成功!</span>
        </span>
      </div>
      <a-button key="submit" type="primary" :loading="confirmLoading" @click="handleOk">
        确定
      </a-button>
      <a-button key="back" @click="handleCancel" class="ml-4">取消</a-button>
    </template>
    <a-tabs v-model="currentTab" class="inviting-tabs">
      <a-tab-pane tab="邀请联系人" key="inviteUser">
        <div style="height: 420px;">
          <div class="flex h-full p-5">

            <div class="w-1/2 bg-white overflow-hidden">
              <contact-tree ref="contactTree"
                            :checked="checkedKeys"
                            @onCheck="onCheck"
                            @onPush="onPush"
                            @onPop="onPop"></contact-tree>
            </div>
            <div class="flex mx-3 justify-center items-center">
              <a-iconfont type="right" class="text-grey text-2xl cursor-pointer"/>
            </div>
            <div class="flex w-1/2 bg-white overflow-hidden">
              <div class="w-full flex flex-col border">
                <div class="border-b">
                  <div class="flex flex-col">
                    <div class="flex h-10 items-center px-3">
                      <span class="flex flex-grow text-sm">{{selectedContact.length || 0}}/100</span>
                      <span v-if="selectedContact.length > 0"
                            class="flex text-indigo text-xs cursor-pointer"
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
                <!--<p class="mt-3 leading-tight text-xs">{{inputPlaceholder}}</p>-->
              </div>
            </div>
            <div class="flex items-center mt-10">
              <span class="leading-normal">{{numberTitle}}</span>
              <a-input :placeholder="inputPlaceholder"
                       ref="numberInput"
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
        requestUri  : `sip:${user.number}`, // 用户uri
        uid         : user.id, // 用户uid
        displayText : user.name, // 邀请后，用户的显示名字
        type        : 'audio-video', // 邀请类型，包括 audio | video | audio-video
      }));

      this.$rtc.conference.conference.addUserBatch(users)
        .then(() => {
          this.$message.info('邀请发送成功');
          this.confirmLoading = false;
          this.visible = false;
        })
        .catch(() => {
          this.confirmLoading = false;
          this.visible = false;
        });
    },
    inviteOther() {
      const { address, protocol } = this;

      if (!address) return;
      const prefix = protocol === 'H.323' ? 'h323:' : 'sip:';

      const _address = address.startsWith(prefix)
      && protocol !== 'rtmp'
        ? address : prefix + address;

      const user = protocol === 'rtmp'
        ? {
          session : [
            {
              '@session-type'     : 'audio-video',
              'rtmp-url'          : _address,
              'video-data-layout' : 'VideoBig',
              'max-video-fs'      : '720P',
            },
          ],
        } : { requestUri: _address };

      this.$rtc.conference.invite(user).then(() => {
        this.$message.info('邀请成功');
        this.confirmLoading = false;
        this.visible = false;
      }).catch(() => {
        this.confirmLoading = false;
        this.visible = false;
      });
    },
    handleCancel() {
      this.visible = false;
    },
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
    onCheck(selectedContact) {
      this.selectedContact = selectedContact;
    },
    onPush(contact) {
      this.selectedContact.push(contact);
    },
    onPop(contact) {
      const index = this.selectedContact.findIndex((c) => c.id === contact.id);

      if (index > -1) this.selectedContact.splice(index, 1);
    },
    clearAll() {
      this.selectedContact = [];
      this.$refs.contactTree.checkedKeys = [];
      this.$refs.contactTree.unCheckSearchResult();
    },
    copyConferenceInfo() {
      const { description } = this.$rtc.conference.information;
      const meetingInfo = {
        subject          : description.subject,
        conferenceNumber : description.conferenceNumber,
        attendeePin      : description.attendeePin,
      };

      copy(JSON.stringify(meetingInfo)).then(() => {
        this.showCopySuccess = true;
        setTimeout(() => {
          this.showCopySuccess = false;
        }, 3000);
      });
    },
  },
  watch : {
    async currentTab(val) {
      if (val === 'inviteOther') {
        await this.$nextTick();
        await this.$refs.numberInput.$nextTick();
        this.$refs.numberInput.focus();
      }
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
