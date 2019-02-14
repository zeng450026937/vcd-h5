<template>
  <a-layout id="tab-member-view" class="h-full overflow-y-auto">
    <member-list/>
  </a-layout>
</template>

<script>
import MemberList from './MemberList.vue';

export default {
  name       : 'TabMemberView',
  components : {
    MemberList,
  },
};
</script>

<style scoped>

</style>
