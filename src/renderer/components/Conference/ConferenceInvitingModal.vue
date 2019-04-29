<template>
  <a-modal
      :destroyOnClose="true"
      :visible="visible"
      style="left: 32px"
      centered
      :width=728
      :closable=false
      :getContainer="getContainer"
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
      <a-button
          :disabled="isInviteDisabled"
          key="submit"
                type="primary"
                :loading="confirmLoading"
                @click="handleOk">
        确定
      </a-button>
      <a-button key="back" @click="handleCancel" class="ml-4">取消</a-button>
    </template>
    <a-tabs v-model="currentTab" class="inviting-tabs">
      <a-tab-pane tab="邀请联系人" key="inviteUser">
        <div style="height: 420px;">
          <div class="flex h-full p-5">
            <transfer
                :disabled="disabled"
                :load-failed="dataLoadFailed"
                @change="handleChange"
                :search="searchContact"
                :max-checked="100"
                :getChild="getAsyncChildNodes"
                :loadMode="loadMode"
                ref="transfer">
            </transfer>
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
                       v-model.trim="address"
                       @keyup.enter="handleOk"
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
import transfer from '../transfer/index.vue';

export default {
  name  : 'ConferenceInvitingModal',
  props : {
    getContainer : {
      type    : Function,
      default : () => document.body,
    },
  },
  components : {
    transfer,
  },
  data() {
    return {
      visible         : false,
      confirmLoading  : false,
      checkedKeys     : [],
      selectedContact : [],
      showCopySuccess : false,
      protocol        : 'H.323',
      address         : '',
      currentTab      : 'inviteUser', // inviteUser inviteOther
      copyBtn         : null,
    };
  },
  computed : {
    isCloud() {
      return this.$model.account.serverType === 'cloud';
    },
    protocols() {
      const protocols = [ 'SIP', 'H.323', 'RTMP', 'SFB(Lync)' ];

      if (this.isCloud) protocols.push('亿联云账号');
      
      return protocols;
    },
    currentUser() {
      return this.$model.contact.currentUser;
    },
    disabled() {
      return this.currentUser ? [ this.currentUser.id ] : [];
    },
    dataLoaded() {
      if (this.isCloud) return this.$model.contact.phoneBookLoaded;

      return this.$model.contact.phoneBookLoaded && this.$model.contact.favoriteLoaded;
    },
    dataLoadFailed() {
      if (this.isCloud) return this.$model.contact.phoneBookLoadFailed;

      return this.$model.contact.phoneBookLoadFailed || this.$model.contact.favoriteLoadFailed;
    },
    loadMode() {
      return this.$model.contact.loadMode;
    },
    store() {
      if (this.isCloud) return this.$model.contact.phoneBookStore;

      return this.$model.contact.mixContactStore;
    },
    contacts() {
      return this.store.originTree.filter((n) => !n.isVMR);
    },
    isInviteDisabled() {
      if (this.currentTab === 'inviteUser') {
        return this.selectedContact.length <= 0;
      }
      else {
        return !this.address || !this.protocol;
      }
    },
    numberTitle() {
      return this.protocol === 'RTMP' ? '地址' : '号码';
    },
    inputPlaceholder() {
      switch (this.protocol) {
        case 'SIP':
        case 'H.323':
          return '请输入IP地址或URI';
        case '亿联云账号':
          return '请输入9位云账号';
        case 'RTMP':
          return '请输入RTMP地址';
        case 'SFB(Lync)':
          return '请输入SfB (Lync)账号';
        default:
          return '';
      }
    },
  },
  methods : {
    getAsyncChildNodes(id) {
      return this.$model.contact.getAsyncChildNodes(id);
    },
    searchContact(val) {
      return this.$model.contact.findContacts(val);
    },
    create() {
      if (this.$refs.transfer) {
        this.$refs.transfer.create({
          data : this.contacts,
        });
      }
    },
    handleChange(data) {
      data._isVue = true;
      this.selectedContact = data;
    },
    handleOk() {
      if (this.confirmLoading) return;
      this.confirmLoading = true;

      if (this.currentTab === 'inviteUser') {
        // 邀请联系人
        this.inviteUser();
      }
      else {
        // 邀请其他
        if (!this.address) return;
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
          this.$message.info('已邀请');
          this.confirmLoading = false;
          this.visible = false;
        })
        .catch(() => {
          this.confirmLoading = false;
          this.visible = false;
        });
    },
    inviteOther() {
      if (this.$rtc.conference.information.users.user.findIndex((user) => user.phone === this.address) >= 0) {
        this.$message.info('该成员已在会议中');
        this.confirmLoading = false;
        
        return;
      }
      this.$message.info('已邀请');
      this.$dispatch('conference.invite.invite', { protocol: this.protocol, address: this.address }).then(() => {
        this.$message.info('邀请成功');
        this.confirmLoading = false;
        this.address = '';
      }).catch((err) => {
        this.$message.info('邀请失败,请重试');
        this.confirmLoading = false;
      });
    },
    handleCancel() {
      this.visible = false;
    },


    copyConferenceInfo() {
      const { recordId } = this.$rtc.conference.information;

      this.$model.schedule.fetchMailTemplate(recordId).then((val) => {
        copy(val);
        this.showCopySuccess = true;
        setTimeout(() => {
          this.showCopySuccess = false;
        }, 3000);
      });
    },
  },
  watch : {
    dataLoaded(val) {
      if (val) {
        this.$nextTick(() => {
          this.create();
        });
      }
    },
    visible(val) {
      if (val && this.dataLoaded) {
        this.$nextTick(() => {
          this.create();
        });
      }
      else {
        this.currentTab = 'inviteUser';
      }
    },
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
