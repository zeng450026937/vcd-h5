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
  computed : {
    isOnHold() {
      return this.$model.conference.currentUser.isOnHold();
    },
  },
  watch : {
    isOnHold : {
      handler(val) {
        if (val) {
          this.$model.conference.sketch.isInConferenceMain = true;
        }
      },
      immediate : true,
    },
  },
};
</script>
