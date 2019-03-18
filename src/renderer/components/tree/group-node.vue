<template>
  <div class="group-node" :style="{'margin-left':`${data.level *15}px`}" @click="handleClick">
    {{data.attributes.name}} (level {{data.level}})
  </div>

</template>

<script>
export default {
  name    : 'group-node',
  props   : [ 'data' ],
  methods : {
    handleClick() {
      this.$emit('click');
    },
  },
};
</script>

<style scoped>
.group-node {
  height:30px;
  line-height: 30px;
  cursor: pointer;
}
</style>
