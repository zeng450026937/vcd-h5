<template>
  <a-layout id="tab-chatting" class="h-full bg-white">
    <div class="flex flex-col h-full">
      <div class="display-message-content flex flex-grow h-1">
        <tab-chatting-message-content @select-target="selectTarget"/>
      </div>
      <div class="send-message-content border-t" style="height: 140px">
        <div class="h-full p-3 flex flex-col">
          <div>
            <div class="flex items-center">
              <span class="whitespace-no-wrap text-xs leading-tight">{{$t('conversation.chat.sendTo')}}</span>
              <a-select v-model="target" class="w-full ml-2">
                <a-select-option v-for="(user, index) in targetList"
                                 :value="user.entity"
                                 :key="index">{{user.displayText}}</a-select-option>
              </a-select>
            </div>
          </div>
          <div class="flex mt-2 h-full">
            <div class="w-5/6 mr-2">
              <a-textarea :value="message"
                          :placeholder="$t('conversation.chat.inputMessage')"
                          @keydown.enter.prevent=""
                          @keyup.enter.prevent = 'sendMessage'
                          @change="onMessageInputed"
                          class="h-full"/>
            </div>
            <div class="w-1/6 bg-grey-light">
              <a-button type="primary"
                        class="w-full h-full p-0 text-xs"
                        :class="{'bg-disabled': isSendingDisabled}"
                        :disabled="isSendingDisabled || !message"
                        @click="sendMessage">
                <span v-if="isSendingDisabled" class="text-base text-white">{{timeout}}</span>
                <a-iconfont v-else type="icon-fasong" class="text-base"/>
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import TabChattingMessageContent from './TabChattingMessageContent.vue';

export default {
  name       : 'TabChatting',
  components : {
    TabChattingMessageContent,
  },
  data() {
    return {
      message           : '',
      target            : 'all',
      isSendingDisabled : false,
      timeout           : 3,
      sendingTimer      : null,
    };
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'isInConferenceMain' ],
  },
  computed : {
    userList() {
      return this.$model.conference.member.userList.filter((user) => !user.isCurrentUser()
        && !user.isOnHold()
        && !user.isCastViewer()
        && user.endpoint.some((point) => point['@session-type'] === 'chat'));
    },
    targetList() {
      const targetList = [ {
        entity      : 'all',
        displayText : this.$t('conversation.chat.all'),
      } ];

      if (!this.isCastViewer) {
        targetList.push(...this.userList);
      }

      return targetList;
    },
    isOnHold() {
      return this.$model.conference.currentUser.isOnHold();
    },
    isCastViewer() {
      return this.$model.conference.currentUser.isCastViewer();
    },
  },
  methods : {
    onMessageInputed(e) {
      const { value } = e.target;

      if (value.length <= 100) {
        this.message = value;
      }
    },
    sendMessage(e) {
      if (this.isSendingDisabled || !this.message || this.isOnHold) return;
      this.$model.conference.chat.sendMessage(this.$t('conversation.chat.me'), this.target, this.message, 'send');
      this.message = '';
      this.isSendingDisabled = true;
      this.sendingTimer = setInterval(() => {
        this.timeout--;
        if (this.timeout === 0) {
          clearInterval(this.sendingTimer);
          this.timeout = 3;
          this.isSendingDisabled = false;
        }
      }, 1000);
    },
    selectTarget(target) {
      this.target = target;
    },
  },
  watch : {
    isOnHold : {
      handler(val) {
        if (val) {
          this.isInConferenceMain = true;
        }
      },
      immediate : true,
    },
  },
};
</script>
