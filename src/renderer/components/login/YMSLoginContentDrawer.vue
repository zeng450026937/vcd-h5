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
    <div name="title" class="pt-12">
      <div>设置</div>
      <div>
        <a-tabs defaultActiveKey="1">
          <a-tab-pane tab="基本设置" key="1">
            <div class="flex h-full flex-col">
              <a-input
                  v-model="proxy"
                  placeholder='地址'
                  class="h-10 mb-4"
              >
                <a-icon slot="prefix" type='global'/>
              </a-input>

              <a-input
                  v-model="proxyPort"
                  placeholder='端口'
                  class="h-10"
              >
                <a-icon slot="prefix" type='api'/>
              </a-input>
              <div class="flex flex-grow"></div>
              <div class="flex mt-12">
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
              <div class="mt-16">
                <a-avatar class="cursor-pointer hover:shadow bg-blue"
                          shape="square"
                          icon="cloud"
                          :size="84"/>
              </div>
              <div class="mt-8 text-base">
                Yealink VC Desktop
              </div>
              <div class="mt-2 text-grey-dark text-sm">
                版本号： 1.0.9-alpha
              </div>
              <div class="mt-6 w-3/5">
                <a-button class="w-full" type="primary">检查更新</a-button>
              </div>
              <div class="mt-6">
                <a-checkbox>更新时提醒我</a-checkbox>
              </div>
              <div class="flex flex-grow"></div>
              <div class="flex text-blue mt-16 items-center">
                <span class="cursor-pointer">用户协议</span>
                <a-divider class="mx-4" type="vertical"></a-divider>
                <span class="cursor-pointer">隐私政策</span>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </a-drawer>
</a-layout>
</template>

<script>
export default {
  name : 'YMSLoginContentDrawer',
  data() {
    return {
      visible   : false,
      proxy     : '10.200.112.165',
      proxyPort : 5060,
    };
  },
};
</script>

<style lang="less">
.yms-login-content-drawer {
  z-index: 4;
}
</style>
