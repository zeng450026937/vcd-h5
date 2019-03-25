<template>
  <div id="hold-item-group">
    <template v-for="(hold,index) in holdList">
      <hold-item :key="hold.id"
                 :is-top="hold.id === currentHold"
                 :info="hold"
                 :index="index"
                 ref="hold"
                 @contentClicked="currentHold = hold.id"/>
    </template>
  </div>
</template>

<script>
import HoldItem from './HoldItem.vue';

export default {
  name       : 'HoldItemGroup',
  components : {
    HoldItem,
  },
  data() {
    return {
      currentHold : '1',
    };
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize);
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'updateHoldPosition' ],
  },
  computed : {
    holdList() {
      return this.holdedChannels.map((channel, index) => ({
        id : `${index + 1}`,
        ...channel,
      }));
    },
    holdedChannels() {
      return this.$rtc.call.holdedChannels || [];
    },
  },
  methods : {
    onWindowResize() {
      this.updateHoldPosition = true;
    },
  },
  watch : {
    updateHoldPosition(val) {
      if (val) {
        this.$refs.hold.forEach((element) => {
          element.$refs.draggableElement.updatePosition();
        });
      }
      this.updateHoldPosition = false;
    },
  },
};
</script>

<style scoped>

</style>
