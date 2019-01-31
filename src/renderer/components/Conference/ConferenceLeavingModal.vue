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
      <h4 class="mt-5 leading-loose">{{isInLeaving ? '您确定要离开会议?' : '您要结束会议还是离开会议?'}}</h4>
      <a-button v-if="!isInLeaving" class="mt-5" type="danger" block @click="isInLeaving = true">结束会议</a-button>
      <a-button class="mt-5" type="primary" block
                @click="leaveConference">{{isInLeaving ? '离开会议' : '离开会议，会议继续进行'}}</a-button>
      <a-button class="mt-5" block @click="cancel">取消</a-button>
    </div>
  </a-modal>
</template>

<script>
export default {
  name : 'ConferenceLeavingModal',
  data() {
    return {
      visible     : false,
      isInLeaving : false,
    };
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
      this.isInLeaving = false;
    },
  },
};
</script>

<style scoped>

</style>
