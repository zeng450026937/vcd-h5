<template>
  <a-modal
      :visible="visible"
      :width=328
      :closable=false
      :footer="null"
      :getContainer="getContainer"
      centered
      destroy-on-close
      style="left: 32px"
      wrapClassName="conference-plate-modal"
      @cancel="visible = false"
  >
    <div class="flex flex-col">
      <div class="flex h-12 border-b justify-center items-center">
        <span class="text-base">拨号盘</span>
        <a-iconfont type="icon-guanbi"
                    class="absolute cursor-pointer hover:text-red"
                    style="right: 26px"
                    @click="visible = false"/>
      </div>
      <div style="padding: 0 50px; margin-top: 30px">
        <a-input ref="numberInput" :value="plateContent" @input="inputPlateContent"/>
      </div>
      <plate-content @inputNumber="clickNumber" hide-alpha class="mt-5"
                     style="padding: 0 50px 18px 50px;"/>
    </div>
  </a-modal>
</template>

<script>
import PlateContent from '../Common/PlateContent.vue';

export default {
  name  : 'ConferencePlateModal',
  props : {
    getContainer : {
      type    : Function,
      default : () => document.body,
    },
  },
  components : {
    PlateContent,
  },
  data() {
    return {
      visible : false,
    };
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'plateContent' ],
  },
  methods : {
    inputPlateContent(e) {
      this.plateContent = e.target.value.replace(/[^0-9*#]+/, '');
      if (/[0-9*#]+/.test(e.data)) {
        this.$rtc.conference.sendDTMF(e.data);
      }
    },
    clickNumber(num) {
      this.plateContent = this.plateContent === null ? num : this.plateContent += num;
      this.$rtc.call.sendDTMF(num);
      this.$refs.numberInput.focus();
    },
  },
  watch : {
    async visible(val) {
      if (val) {
        await this.$nextTick();
        await this.$refs.numberInput.$nextTick();
        this.$refs.numberInput.focus();
      }
    },
  },
};
</script>

<style lang="less">
.conference-plate-modal {
  .ant-modal-content {
    box-shadow: 0 4px 12px 0 rgba(0,0,0,0.20);
    border-radius: unset;
  }
  .ant-modal-body {
    padding: 0 !important;
  }
}
</style>
