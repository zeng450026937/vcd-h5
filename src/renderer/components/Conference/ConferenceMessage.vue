<template>
  <div>
    <!--<div class="message-wrapper flex flex-col items-end"-->
         <!--:class="{'opacity-0': hideMessage}">-->
      <!--<div v-for="(message, index) in messageTextList" :key="index"-->
           <!--class="mb-1 flex message-item rounded">-->
        <!--<span class="px-3 py-1">{{message}}</span>-->
      <!--</div>-->
    <!--</div>-->
  </div>
</template>

<script>
export default {
  name : 'ConferenceMessage',
  data() {
    return {
      hideMessage      : true,
      hideMessageTimer : null,
    };
  },
  // destroyed() {
  //   if (this.hideMessageTimer) clearTimeout(this.hideMessageTimer);
  // },
  computed : {
    // messageTextList() {
    //   if (!this.showMessage) return [];
    //
    //   const { messageTextList } = this.$model.conference;
    //
    //   return messageTextList.length > 3 ? messageTextList.slice(messageTextList.length - 3) : messageTextList;
    // },
    // showMessage() {
    //   return this.$model.conference.showMessage;
    // },
  },
  watch : {
    // messageTextList : {
    //   handler() {
    //     // 来了新消息
    //     if (!this.hideMessage && this.hideMessageTimer) {
    //       clearTimeout(this.hideMessageTimer);
    //     }
    //     this.hideMessage = false;
    //
    //     this.hideMessageTimer = setTimeout(() => {
    //       this.hideMessage = true;
    //       this.$model.conference.messageTextList = [];
    //     }, 3000);
    //   },
    //   immediate : false,
    // },
  },
};
</script>

<style lang="less">
/*#conference-message {*/
  /*.message-wrapper {*/
    /*transition: all ease-in-out .5s;*/
  /*}*/
  /*.message-item {*/
    /*background: rgba(0,0,0,0.30);*/
    /*span {*/
      /*font-size: 12px;*/
      /*color: #FFFFFF;*/
      /*text-align: right;*/
      /*line-height: 20px;*/
    /*}*/
  /*}*/
/*}*/
</style>
