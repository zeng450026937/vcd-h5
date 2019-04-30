<template>
  <a-modal
      :visible="visible"
      style="left: 32px"
      centered
      :width=400
      :closable=false
      :getContainer="getContainer"
      wrapClassName="conference-leaving-modal"
      :footer="null"
  >
    <div class="flex flex-col items-center px-12 pb-4">
      <h4 class="mt-5 leading-loose">{{isPresenter
        ? $t('conversation.controls.terminateOrLeave')
        : $t('conversation.controls.ensureLeave') }}</h4>
      <a-button v-if="isPresenter" class="mt-5 bg-red-light text-white border-transparent"
                block @click="endedConference">{{$t('conversation.controls.terminateConference')}}</a-button>
      <a-button class="mt-5 bg-main-theme text-white border-transparent" block
                @click="leaveConference">{{isPresenter
        ? $t('conversation.controls.justLeaveConference')
        : $t('conversation.controls.leaveConference')}}</a-button>
      <a-button class="mt-5" block @click="cancel">{{$t('conversation.controls.cancel')}}</a-button>
    </div>
  </a-modal>
</template>

<script>
export default {
  name  : 'ConferenceLeavingModal',
  props : {
    getContainer : {
      type    : Function,
      default : () => document.body,
    },
  },
  data() {
    return {
      visible : false,
    };
  },
  computed : {
    isPresenter() {
      return this.$model.conference.isPresenter;
    },
  },
  methods : {
    leaveConference() {
      this.$rtc.conference.leave().then(() => {
        this.visible = false;
      });
    },
    cancel() {
      this.visible = false;
    },
    endedConference() { // 结束会议 - 主持人
      this.$rtc.conference.conference.deleteConference().then((result) => {
        this.visible = false;
        // 成功
      }).catch((e) => {
        // 失败
      });
    },
  },
};
</script>
