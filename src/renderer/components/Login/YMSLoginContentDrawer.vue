<template>
  <a-layout id="yms-login-content-drawer">
    <a-drawer
        width=360
        placement="right"
        wrapClassName="yms-login-content-drawer"
        :closable="false"
        @close="visible = false"
        :visible="visible"
    >
      <a-tabs defaultActiveKey="1">
        <a-tab-pane tab="基本设置" key="1">
          <div class="flex h-full flex-col px-5">
            <span class="mb-3 leading-normal mt-2">代理服务器设置</span>
            <a-input v-model="proxy" placeholder='地址'>
            </a-input>
            <div class="mt-4"></div>

            <a-input v-model="proxyPort" placeholder='端口'>
            </a-input>
            <div class="flex mt-10">
              <a-button class='w-1/2 mr-1'
                        type="primary"
                        @click="visible = false">
                确定
              </a-button>
              <a-button class='w-1/2 ml-1'
                        @click="visible = false">
                取消
              </a-button>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane tab="关于" key="2">
          <div class="flex flex-col h-full items-center ">
            <div class="mt-6">
              <a-avatar class="cursor-pointer hover:shadow bg-green-light"
                        shape="square"
                        :size="128">
                  <span class="text-xl">Yealink</span>
              </a-avatar>
            </div>
            <div class="mt-5 text-base leading-loose">
              Yealink VC Desktop
            </div>
            <div class="mt-1 text-black-lightest text-xs leading-tight">
              版本号： 1.0.9-alpha
            </div>
            <div class="mt-10 w-3/5">
              <a-button class="w-full h-9" type="primary">检查更新</a-button>
            </div>
            <div class="mt-6">
              <a-switch size="small"/>
              <span class="ml-2">自动更新</span>
            </div>
            <div class="flex text-indigo mt-10 items-center text-xs">
              <span class="cursor-pointer">用户协议</span>
              <a-divider class="mx-4" type="vertical"></a-divider>
              <span class="cursor-pointer">隐私政策</span>
            </div>
            <p class="mt-9 text-xs leading-tight text-black-lightest">
              Copyright © 2018 Yealink Inc. All rights reserved.
            </p>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-drawer>
  </a-layout>
</template>

<script>
export default {
  name : 'YMSLoginContentDrawer',
  data() {
    return {
      visible   : false,
      proxy     : '',
      proxyPort : 5060,
    };
  },
};
</script>

<style lang="less">
.yms-login-content-drawer {
  .ant-drawer-body {
    padding: 0;
    height: 100%;
    .ant-tabs-nav-scroll{
      text-align: center;
    }
    /*.ant-tabs-line {*/
      /*height: 100%;*/
      /*.ant-tabs-content{*/
        /*height: 100%;*/
        /*.ant-tabs-tabpane {*/
          /*height: 100%;*/
        /*}*/
      /*}*/
    /*}*/
  }
}
</style>
