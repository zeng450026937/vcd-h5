<template>
  <a-layout id="lock-conference" class="bg-white w-full">
    <div class="flex flex-col p-5">
      <p class="leading-normal">
      {{isLocked
        ? $t('conversation.lock.unLockTips')
        : $t('conversation.lock.lockTips')
      </p>
      <template v-if="!isLocked">
        <a-select v-model="selectedOptions"
                  :getPopupContainer="selectContainer"
                  class="mt-5">
          <a-select-option v-for="option in allowedOptions"
                           :key="option.permission"
                           :value="option.permission"
          >{{option.label}}</a-select-option>
        </a-select>
        <a-checkbox class="mt-3"
                    :checked="attendeeLobbyBypass"
                    @change="attendeeLobbyBypass = !attendeeLobbyBypass"
        >{{$t('conversation.lock.invitedUser')}}</a-checkbox>
      </template>
      <a-button type="primary" class="mt-16"
                :disabled="!currentIsPresenter"
                @click="lockOrUnlockConference">
        <a-iconfont :type="isLocked ? 'icon-jiesuo' : 'icon-suoding'"/>
      {{isLocked
        ? $t('conversation.lock.unLock')
        : $t('conversation.lock.lock')}}
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
        { label: this.$t('conversation.lock.presenter'), permission: 'closedAuthenticated' },
        { label: this.$t('conversation.lock.all'), permission: 'openAuthenticated' },
      ],
    };
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'selectedOptions', 'attendeeLobbyBypass' ],
  },
  computed : {
    selectContainer() {
      return () => this.$el;
    },
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
    },
  },
  watch : {
    isLocked(val) {
      if (!val) {
        this.$rtc.conference.conference.lobby.allow();
      }
    },
  },
};
</script>
