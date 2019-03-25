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
    const holdList = [
      {
        id       : '1',
        subject  : '来自张三的视频会议',
        interval : '12:00:03',
      },
      {
        id       : '2',
        subject  : '来自李四的视频会议',
        interval : '12:00:03',
      },
    ];
      
    return {
      currentHold : '1',
      holdList,
    };
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize);
  },
  methods : {
    onWindowResize() {
      this.$refs.hold.forEach((element) => {
        element.$refs.draggableElement.updatePosition();
      });
    },
  },
};
</script>

<style scoped>

</style>
