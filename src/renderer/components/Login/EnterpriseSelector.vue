<template>
  <div id="enterprise-selector">
    <div class="flex flex-col" style="width: 320px">
      <span class="leading-loose text-2xl">Hi，请选择您想登陆的企业</span>

      <a-select placeholder="请选择"
                class="mt-8"
                @change="handleChange">
        <a-select-option v-for="(account, index) in accountInfos"
                         :key="index"
                         :value="index"
        >{{account.partyInfo.name}}</a-select-option>
      </a-select>
      <a-checkbox @change="onChange" class="leading-normal mt-3 text-black6">下次登录时不再提醒</a-checkbox>
      <div class="mt-14 text-center">
        <a-button type="primary"
                  :disabled="!selectedAccount"
                  class="h-9"
                  style="margin-right: 10px; width: 150px"
                  @click="handleOk">确认</a-button>
        <a-button class="h-9"
                  style="margin-left: 10px; width: 150px"
                  @click="cancel">返回</a-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name  : 'EnterpriseSelector',
  props : {
    accountInfos : {
      type     : Array,
      required : true,
    },
  },
  data() {
    return {
      selectedAccount : '',
    };
  },
  methods : {
    handleOk() {
      this.$emit('selected', this.selectedAccount);
    },
    cancel() {
      this.$emit('cancel');
    },
    handleChange(val) {
      this.selectedAccount = this.accountInfos[val];
    },
    onChange() {

    }
  },
};
</script>

<style lang="less">
#enterprise-selector {
  @apply flex flex-col flex-grow mb-9 justify-center items-center;
}
</style>
