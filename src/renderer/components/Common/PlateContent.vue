<template>
  <div id="plate-content" class="flex flex-wrap justify-between">
    <div v-for="n in dialPanel"
         :key="n.num"
         class="mb-3 text-center"
         :class="{'mx-6': n.isCenter}">
      <div class="flex justify-center"
           v-long-press="800"
           @long-press-start="onLongPressed(n)"
           @long-press-stop="onLongPressedEnd(n)">

        <div v-if="!n.isStart || hideAlpha" class="w-14 h-14">
          <a-button :id="`plate-${n.num}`" class="w-full h-full">
            <div class="flex flex-col justify-center items-center h-full">
              <span class="text-xl">{{n.num}}</span>
              <span v-if="!hideAlpha" class="text-xs text-black6">{{n.alpha}}</span>
            </div>
          </a-button>
        </div>
        <a-popconfirm v-else
                      :visible="showStarSwitch"
                      overlayClassName="plate-popconfirm"
                      placement="top"
                      okText="."
                      cancelText="@"
                      @visibleChange="handleVisibleChange"
                      @confirm="clickPoint"
                      @cancel="clickAt">
          <span slot="icon" />
          <div class="w-14 h-14">
            <a-button :id="`plate-${n.num}`"
                      class="w-full h-full">
              <div class="flex flex-col justify-center items-center h-full">
                <span class="text-xl">{{n.num}}</span>
                <span v-if="!hideAlpha" class="text-xs text-black6">{{n.alpha}}</span>
              </div>
            </a-button>
          </div>
        </a-popconfirm>
      </div>
    </div>
  </div>
</template>

<script>
import LongPress from 'vue-directive-long-press';

export default {
  name       : 'PlateContent',
  directives : {
    'long-press' : LongPress,
  },
  props : {
    hideAlpha : {
      type    : Boolean,
      default : false,
    },
  },
  data() {
    return {
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
        { num: '*', alpha: '. @', isStart: true },
        { num: '0', alpha: '+', isCenter: true },
        { num: '#', alpha: '' },
      ],
      isLongPressed    : false,
      showStarSwitch   : false,
      isAfterLongPress : false,
    };
  },
  methods : {
    showClickAnimation(val) {
      const ele = document.getElementById(`plate-${val}`);

      if (ele) document.getElementById(`plate-${val}`).click();
      
      return !!ele;
    },
    clickPoint() {
      this.$emit('inputNumber', '.');
      this.showStarSwitch = false;
    },
    clickAt() {
      this.$emit('inputNumber', '@');
      this.showStarSwitch = false;
    },
    longPressNumber(alpha) {
      console.warn(alpha);
    },
    onLongPressed(num) {
      this.isLongPressed = true;
      this.isAfterLongPress = true;
      if (num.num === '0') {
        this.$emit('inputNumber', num.alpha);
      }
      else if (num.num === '*') {
        this.showStarSwitch = true;
      }
      else {
        this.$emit('inputNumber', num.num);
      }
    },
    onLongPressedEnd(n) {
      if (this.showStarSwitch && n.num === '*') return;

      if (!this.isLongPressed) {
        this.$emit('inputNumber', n.num);
      }
      this.isLongPressed = false;
    },
    handleVisibleChange(visible) {
      if (!this.isAfterLongPress) {
        this.showStarSwitch = false;
      }
      this.isAfterLongPress = false;
    },
  },
};
</script>
<style lang="less">
  .plate-popconfirm{
    .ant-popover-inner-content{
      padding: 0;
    }
    .ant-popover-message{
      display: none;
    }
    .ant-popover-buttons{
      margin-bottom: 0px;
      background-color: white;
      button {
        margin-left: 0px;
        width: 32px;
        height: 32px;
        background-color: transparent;
        border: transparent;
        color: #333333;
      }
    }
  }
</style>
