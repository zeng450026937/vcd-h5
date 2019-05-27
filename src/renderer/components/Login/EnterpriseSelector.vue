<template>
  <a-modal
      v-model="visible"
      centered
      destroyOnClose
      :maskClosable="false"
      :closable="false"
      :title="null"
      :footer="null"
      :width="380"
      wrapClassName="enterprise-selector-modal"
      @ok="handleOk"
  >
    <div class="flex w-full flex-col">
      <span class="leading-normal text-center text-base">Hi，请选择您想登陆的企业</span>

      <a-select placeholder="请选择"
                class="mt-8"
                @change="handleChange">
        <a-select-option v-for="(account, index) in accountInfos"
                         :key="index"
                         :value="index"
        >{{account.partyInfo.name}}</a-select-option>
      </a-select>
      <div class="mt-10 text-center">
        <a-button type="primary"
                  :disabled="!selectedAccount"
                  style="margin-right: 10px"
                  @click="handleOk">确认</a-button>
        <a-button @click="visible = false" style="margin-left: 10px">取消</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name : 'EnterpriseSelector',
  data() {
    return {
      visible         : false,
      accountInfos    : [],
      selectedAccount : '',
    };
  },
  methods : {
    handleOk() {
      this.$emit('selected', this.selectedAccount);
      this.visible = false;
    },
    handleChange(val) {
      this.selectedAccount = this.accountInfos[val];
    },
  },
};
</script>

<style lang="less">
.enterprise-selector-modal {
  .ant-modal-body {
    @apply px-10 py-6;
  }
}
</style>
