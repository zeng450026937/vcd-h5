<template>
  <a-layout id="tab-setting-conference" class="bg-white">
    <div class="flex flex-col px-4">
      <div class="flex flex-col">
        <span class="text-sm leading-tight">画面布局</span>
        <div class="flex mt-3 justify-between px-1">
          <div class="layout layout-one-more">
            <a-iconfont type="icon-n"/>
          </div>
          <div class="layout layout-average">
            <a-iconfont type="icon-dengfen" />
          </div>
          <div class="layout layout-one">
            <a-iconfont type="icon-danfangquanping" />
          </div>
        </div>
      </div>
      <div class="flex mt-6">
        <a-switch size="small" defaultChecked/>
        <span class="text-sm leading-tight ml-3">入会和离开的提示</span>
      </div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name : 'TabSettingConference',
};
</script>

<style lang="less">
#tab-setting-conference {
  .layout {
    display: flex;
    width: 64px;
    height: 36px;
    cursor: pointer;
    .anticon {
      width: 100%;
      color: #999999;
      svg{
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
