<template>
  <a-layout id="tab-setting" class="h-full w-full bg-white">
    <a-tabs defaultActiveKey="1" class="setting-tabs">
      <a-tab-pane :tab="$t('conversation.setting.conference')" key="1">
        <tab-setting-conference/>
      </a-tab-pane>
      <a-tab-pane :tab="$t('conversation.setting.media')" key="2" forceRender>
        <tab-setting-media/>
      </a-tab-pane>
    </a-tabs>
  </a-layout>
</template>

<script>
import TabSettingConference from './TabSettingConference.vue';
import TabSettingMedia from './TabSettingMedia.vue';

export default {
  name       : 'TabSetting',
  components : {
    TabSettingConference,
    TabSettingMedia,
  },
};
</script>

<style lang="less">
#tab-setting {
  .ant-tabs-nav-scroll {
    text-align: center;
    .ant-tabs-tab {
      padding: 10px 16px;
    }
  }
}
</style>
