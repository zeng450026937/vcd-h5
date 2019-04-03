<template>
  <a-modal
      :visible="visible"
      :width=328
      :closable=false
      :footer="null"
      :getContainer="getContainer"
      centered
      style="left: 32px"
      wrapClassName="conference-plate-modal"
      @cancel="visible = false"
  >
    <div class="flex flex-col">
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
  name  : 'CallPlateModal',
  props : {
    getContainer : {
      type : Function,
      default() {
        return () => document.body;
      },
    },
  },
  components : {
    PlateContent,
  },
  data() {
    return {
      visible   : false,
      dialPanel : [
        { num: '1', alpha: '' },
        { num: '2', alpha: 'ABC', isCenter: true },
        { num: '3', alpha: 'DEF' },
        { num: '4', alpha: 'GHI' },
        { num: '5', alpha: 'JKL', isCenter: true },
        { num: '6', alpha: 'MNO' },
        { num: '7', alpha: 'PQRS' },
        { num: '8', alpha: 'TUV', isCenter: true },
        { num: '9', alpha: 'WXYZ' },
        { num: '*', alpha: '. @' },
        { num: '0', alpha: '+', isCenter: true },
        { num: '#', alpha: '' },
      ],
      plateContent : '',
    };
  },
  methods : {
    inputPlateContent(e) {
      this.plateContent = e.target.value.replace(/[^0-9*#]+/, '');
      if (/[0-9*#]+/.test(e.data)) {
        this.$rtc.call.sendDTMF(e.data);
      }
    },
    clickNumber(num) {
      this.plateContent = this.plateContent === null ? num : this.plateContent += num;
      this.$rtc.call.sendDTMF(num);
    },
  },
};
</script>

<style lang="less">
.conference-plate-modal {
  .ant-modal-body {
  }
}
</style>
