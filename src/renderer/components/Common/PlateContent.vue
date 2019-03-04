<template>
  <div id="plate-content" class="flex flex-wrap justify-between">
    <div v-for="n in dialPanel"
         :key="n.num"
         class="mb-3 text-center"
         :class="{'mx-6': n.isCenter}">
      <div class="flex justify-center">
        <div class="w-14 h-14">
          <a-button class="w-full h-full"
                    @click="clickNumber(n.num)"
                    @long-press="longPressNumber(n.alpha)">
            <div class="flex flex-col justify-center items-center h-full">
              <span class="text-xl">{{n.num}}</span>
              <span v-if="!hideAlpha" class="text-xs text-black6">{{n.alpha}}</span>
            </div>
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name  : 'PlateContent',
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
        { num: '*', alpha: '. @' },
        { num: '0', alpha: '+', isCenter: true },
        { num: '#', alpha: '' },
      ],
    };
  },
  methods : {
    clickNumber(num) {
      this.$emit('inputNumber', num);
    },
    longPressNumber(alpha) {
      console.warn(alpha);
    },
  },
};
</script>

<style scoped>

</style>
