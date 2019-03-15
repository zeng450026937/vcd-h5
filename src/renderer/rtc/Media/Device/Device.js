import Vue from 'vue';

export default Vue.extend({
  data() {
    return {
      deviceId : null,
      groupId  : null,
      kind     : null,
      label    : null,
      quality  : null,
    };
  },
  computed : {
    id() {
      return this.deviceId + this.groupId;
    },
    constraints() {
      return {
        deviceId : this.deviceId,
        groupId  : this.groupId,
      };
    },
  },
});
