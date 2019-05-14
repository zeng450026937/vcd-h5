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
    closeTab() {
      const { currentUser } = this.$model.conference;

      return currentUser.isOnHold() || currentUser.isCastViewer();
    },
  },
  watch : {
    closeTab : {
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
