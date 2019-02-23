<template>
  <a-modal
      :visible="visible"
      :width=328
      :closable=false
      :footer="null"
      centered
      style="left: 32px"
      wrapClassName="conference-plate-modal"
      @cancel="visible = false"
  >
    <div class="flex flex-col">
      <a-input v-model="callNumber"/>
      <div class="flex flex-wrap mt-3 justify-between">
        <div v-for="n in dialPanel"
             :key="n.num"
             class="mb-3 text-center"
             :class="{'mx-10': n.isCenter}">
          <div class="flex justify-center">
            <div class="w-14 h-14">
              <a-button class="w-full h-full"
                        @click="clickNumber(n.num)">
                <div class="flex flex-col justify-center items-center h-full">
                  <span class="text-xl">{{n.num}}</span>
                  <span class="text-xs text-grey-darker">{{n.alpha}}</span>
                </div>
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name : 'ConferencePlateModal',
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
      callNumber : '',
    };
  },
  methods : {
    clickNumber(num) {
      this.callNumber = this.callNumber === null ? num : this.callNumber += num;
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
