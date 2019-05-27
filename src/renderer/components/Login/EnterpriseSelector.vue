<template>
  <div id="enterprise-selector">
    <div class="flex flex-col h-full">
      <span class="title">选择您想要登陆的企业</span>
      <div class="enterprise-list">
        <div class="enterprise-item"
                  :class="{'border-indigo text-indigo': selectedEnterprise === enterprise}"
                  v-for="(enterprise, index) in enterpriseList"
                  :key="index" @click="selectedEnterprise = enterprise">
          <span :title="enterprise">{{enterprise}}</span>
        </div>
      </div>
      <div class="footer">
        <a-button type="primary" @click="selectEnterprise">确认</a-button>
        <a-button @click="$emit('closeSelector')">返回登陆</a-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name : 'EnterpriseSelector',
  data() {
    return {
      enterpriseList : [
        '厦门网络技术股份有限公司',
        '中国建筑第八工程局',
        '中国石油股份有限责任公司',
        '小米股份有限责任公司',
        '神奇测试企业公司',
        '神奇测试企业公司神奇测试企业公司神奇测试企业公司神奇测试企业公司',
        '神奇测试企业公司神奇测试企业公司神奇测试企业公司神奇测试企业公司神奇测试企业公司神奇测试企业公司神奇测试企业公司神奇测试企业公司神奇测试企业公司',
        '神奇测试11111111111111111111111111111111111111111111111111企业公司',
        '神奇测试企5aaaaaaaaaaaaaaaaaaaaaaaa11aaaaaaaaaaa业公司',
        '神奇测试企5aaaaaaaaaaaaaaaaaaaaa111aaaaaaaaaaaaaa业公司',
        '神奇测试企5aaaaaaaaaaaaaaaaaaaaaaaaaaaaa222aaaaaa业公司',
        '神奇测试企-----------5aaaaaaaaaaaaaaaaaaaaa111aaaaaaaaaaaaaa业公司',
      ],
      selectedEnterprise : '',
    };
  },
  methods : {
    selectEnterprise() {
      console.warn(this.selectedEnterprise);
    },
  },
};
</script>

<style lang="less">
#enterprise-selector {
  @apply h-full;
  .title {
    width: 320px;
    @apply self-center text-base leading-loose font-bold mt-10;
  }
  .enterprise-list {
    @apply flex flex-col flex-grow h-1 items-center mt-10 overflow-y-auto;
    .enterprise-item {
      width: 320px;
      font-size: 14px;
      flex-shrink: 0;
      @apply mb-5 h-9 flex justify-center items-center border cursor-pointer rounded-sm leading-normal px-4;
      >span{
        @apply truncate;
      }
    }
  }
  .footer {
    @apply flex justify-center items-center h-12 border-t;
    > button {
      min-width: 96px;
      @apply mx-2;
    }
  }
}
</style>
