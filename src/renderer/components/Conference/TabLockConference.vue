<template>
  <a-layout class="bg-white">
    <div class="flex flex-col p-5">
      <p class="leading-normal">
      {{isConferenceLocked ? '会议解锁后，新的参会成员可以直接进入会议。' : '会议锁定后，以下新的参会成员可直接进入会议，无需在会议大厅中等'}}
      </p>
      <template v-if="!isConferenceLocked">
        <a-select defaultValue="host" class="mt-5">
          <a-select-option value="host">主持人</a-select-option>
          <a-select-option value="member">参会成员</a-select-option>
        </a-select>
        <a-radio class="mt-3">受邀成员</a-radio>
      </template>
      <a-button type="primary" class="mt-16" @click="lockOrUnlockConference">
        <a-iconfont :type="isConferenceLocked ? 'icon-jiesuo' : 'icon-suoding'"/>
      {{isConferenceLocked ? '解锁会议' : '锁定会议'}}
      </a-button>
    </div>
  </a-layout>
</template>

<script>
export default {
  name : 'TabLockConference',
  data() {
    return {
      isConferenceLocked : false,
    };
  },
  methods : {
    lockOrUnlockConference() {
      this.isConferenceLocked = !this.isConferenceLocked;
    },
  },
};
</script>

<style scoped>

</style>
