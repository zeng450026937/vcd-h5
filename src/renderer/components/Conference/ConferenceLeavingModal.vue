<template>
  <a-modal
      :visible="visible"
      style="left: 32px"
      centered
      :width=400
      :closable=false
      wrapClassName="conference-leaving-modal"
      :footer="null"
  >
    <div class="flex flex-col items-center px-12 pb-4">
      <h4 class="mt-5 leading-loose">{{isPresenter ? '您要结束会议还是离开会议?' : '您确定要离开会议?'}}</h4>
      <a-button v-if="isPresenter" class="mt-5" type="danger" block @click="endedConference">结束会议</a-button>
      <a-button class="mt-5" type="primary" block
                @click="leaveConference">{{isPresenter ? '离开会议，会议继续进行' : '离开会议'}}</a-button>
      <a-button class="mt-5" block @click="cancel">取消</a-button>
    </div>
  </a-modal>
</template>

<script>
export default {
  name : 'ConferenceLeavingModal',
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
    closeMeeting() {

    },
    leaveConference() {
      this.visible = false;
      this.$rtc.conference.leave();
    },
    cancel() {
      this.visible = false;
    },
    endedConference() { // 结束会议 - 主持人
      this.$rtc.conference.conference.deleteConference().then((result) => {
        // 成功
      }).catch((e) => {
        // 失败
      });
      this.visible = false;
    },
  },
};
</script>

<style scoped>

</style>
