<template>
  <div class="entity-node"  :style="{'margin-left':`${data.level *15}px`}">
    <input type="checkbox" v-model="data.checked">
    <span class="entity-node" @click="handleClick">
      {{data.attributes.name}} (level {{data.level}})
    </span>
  </div>

</template>

<script>
export default {
  name    : 'entity-node',
  props   : [ 'data' ],
  methods : {
    handleClick() {
      this.$emit('click');
    },
  },
};
</script>

<style scoped>
.entity-node {
  height: 30px;
  color: red;
  cursor: pointer;
}
</style>
