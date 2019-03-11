<template>
  <a-layout class="bg-white w-full">
    <div class="flex flex-col p-5">
      <p class="leading-normal">
      {{isLocked ? '会议解锁后，新的参会成员可以直接进入会议。' : '会议锁定后，以下新的参会成员可直接进入会议，无需在会议大厅中等'}}
      </p>
      <template v-if="!isLocked">
        <a-select v-model="selectedOptions" class="mt-5">
          <a-select-option v-for="option in allowedOptions"
                           :key="option.permission"
                           :value="option.permission"
          >{{option.label}}</a-select-option>
        </a-select>
        <a-checkbox class="mt-3" v-model="attendeeLobbyBypass">受邀人员</a-checkbox>
      </template>
      <a-button type="primary" class="mt-16"
                :disabled="!currentIsPresenter"
                @click="lockOrUnlockConference">
        <a-iconfont :type="isLocked ? 'icon-jiesuo' : 'icon-suoding'"/>
      {{isLocked ? '解锁会议' : '锁定会议'}}
      </a-button>
    </div>
  </a-layout>
</template>

<script>
export default {
  name : 'TabLockConference',
  data() {
    return {
      allowedOptions : [
        { label: '主持人', permission: 'closedAuthenticated' },
        { label: '组织内所有人', permission: 'openAuthenticated' },
      ],
      selectedOptions     : 'closedAuthenticated',
      attendeeLobbyBypass : true,
    };
  },
  computed : {
    currentIsPresenter() { // current => the current login user
      return this.$model.conference.isPresenter;
    },
    admissionPolicy() {
      return this.lockState.admissionPolicy;
    },
    lockState() {
      return this.$rtc.conference.information.state.getLock();
    },
    isLocked() {
      return this.admissionPolicy !== 'anonymous';
    },
  },
  methods : {
    lockOrUnlockConference() {
      const { state } = this.$rtc.conference.information;
      const permission = this.isLocked ? 'anonymous' : this.selectedOptions;

      state.setLock({
        locked              : this.lockState.locked,
        admissionPolicy     : permission,
        autopromote         : this.lockState.autopromote,
        attendeeLobbyBypass : this.attendeeLobbyBypass,
      });
      // if (!this.isLocked) {
      //   this.$emit('close');
      // }
    },
  },
};
</script>
