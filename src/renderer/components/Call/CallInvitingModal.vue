<template>
  <a-modal
      :destroyOnClose="true"
      :visible="visible"
      style="left: 32px"
      centered
      destroy-on-close
      :width=728
      :closable=false
      :getContainer="getContainer"
      @ok="handleOk"
      @cancel="handleCancel"
      wrapClassName="conference-inviting-modal"
  >
    <template slot="footer">
      <a-button :loading="confirmLoading"
                key="submit"
                type="primary"
                @click="handleOk">
        {{$t('common.controls.ensure')}}
      </a-button>
      <a-button key="back"
                @click="handleCancel"
                class="ml-4">
        {{$t('common.controls.cancel')}}
      </a-button>
    </template>
    <a-tabs v-model="currentTab" class="inviting-tabs">
      <a-tab-pane :tab="$t('conversation.invite.inviteContact')" key="inviteUser">
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
      <a-tab-pane :tab="$t('conversation.invite.inviteOthers')" key="inviteOther">
        <div style="height: 420px;">
          <div class="flex flex-col items-center justify-center h-full">
            <div class="flex">
              <span class="leading-normal mt-1">{{$t('conversation.invite.protocol')}}</span>
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
import transfer from '../transfer/index.vue';

export default {
  name  : 'CallInvitingModal',
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
      protocols       : [ 'SIP', 'H.323', 'RTMP', 'SFB(Lync)' ],
      protocol        : 'H.323',
      address         : '',
      currentTab      : 'inviteUser', // inviteUser inviteOther
      copyBtn         : null,
    };
  },
  sketch : [
    {
      ns    : 'conference.sketch',
      props : [ 'isVideoConference' ],
    },
    {
      ns    : 'call',
      props : [ 'isVideoCall' ],
    },
  ],
  computed : {
    isCloud() {
      return this.$model.account.serverType === 'cloud';
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
    numberTitle() {
      return this.protocol === 'RTMP'
        ? this.$t('conversation.invite.address')
        : this.$t('conversation.invite.number');
    },
    inputPlaceholder() {
      switch (this.protocol) {
        case 'SIP':
        case 'H.323':
          return this.$t('conversation.invite.inputIpOrUri');
        case 'RTMP':
          return this.$t('conversation.invite.inputRTMP');
        case 'SFB(Lync)':
          return this.$t('conversation.invite.inputSFB');
        default:
          return '';
      }
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
        this.inviteOther();
      }
    },
    inviteUser() {
      const users = this.selectedContact.map((user) => ({
        requestUri : `sip:${user.number}`,
      }));

      this.$dispatch('call.upgrade', users)
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
      && protocol !== 'RTMP'
        ? address : prefix + address;
      const user = {
        requestUri : _address,
      };

      this.$dispatch('call.upgrade', user)
        .then(() => {
          this.confirmLoading = false;
          this.visible = false;
          // this.isVideoConference = this.isVideoCall;
        }).catch(() => {
          this.confirmLoading = false;
        });
    },
    handleCancel() {
      this.confirmLoading = false;
      this.visible = false;
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
