<template>
  <div class="flex flex-col h-full items-center">
    <div class="mt-4">
      <a-avatar class="cursor-pointer rounded-lger hover:shadow yealink-logo-color"
                shape="square"
                :size="128">
        <span class="text-xl">{{$t('setting.about.logoText')}}</span>
      </a-avatar>
    </div>
    <div class="mt-5 text-base leading-loose">
      {{$t('setting.about.aboutName')}}
    </div>
    <div class="mt-1 text-black6 text-xs leading-tight">
      {{$t('setting.about.versionName')}}： {{currentVersion}}
    </div>
    <div class="mt-1 text-black6 text-xs leading-tight">
      {{$t(`setting.about.updateStatusMap.${statusName}`)}}
    </div>
    <div v-if="status===4 || status ===3" class="mt-1 w-1/2">
      <a-progress :percent="percent" size="small" status="active" />
    </div>
    <div class="mt-5 w-1/2">
      <a-button
          v-if="status!==3"
          :disabled="status!==2"
          @click="checkUpdate"
          class="w-60 h-9"
          type="primary">
        {{$t('setting.about.checkUpdate')}}
      </a-button>

      <a-button
          v-if="status===3"
          @click="quitAndInstall"
          class="w-60 h-9"
          type="primary">
        {{$t('setting.about.exitAndInstall')}}
      </a-button>

    </div>
    <div class="mt-5">
      <a-switch v-model="autoUpdate" size="small" />
      <span class="ml-2">{{$t('setting.about.autoUpdate')}}</span>
    </div>
    <div class="flex text-indigo mt-5 items-center text-xs">
      <span class="cursor-pointer" @click="handleUserProtocol">{{$t('setting.about.userProtocol')}}</span>
      <a-divider class="mx-4" type="vertical"></a-divider>
      <span class="cursor-pointer" @click="handlePrivacy">{{$t('setting.about.privacy')}}</span>
    </div>
    <p class="mt-5 text-xs leading-tight text-black9 mb-3">
      Copyright © 2018 Yealink Inc. All rights reserved.
    </p>
  </div>
</template>

<script>
import updater from '../../updater';

export default {
  name : 'update-panel',
  data() {
    return {
      status              : updater.status,
      currentVersion      : window.autoUpdater.appVersion,
      lastSuccessfulCheck : null,
      progress            : null,
      statusNameList      : [ 'checking', 'finded', 'none', 'downloaded', 'downloading' ],
    };
  },
  destroyed() {
  },
  sketch : {
    ns    : 'setting1.about',
    props : [ 'autoUpdate' ],
  },
  computed : {
    percent() {
      if (this.status === 3) return 100;
      
      return this.progress ? Number(this.progress.percent.toFixed(2)) : 0;
    },
    statusName() {
      return this.statusNameList[this.status];
    },
  },
  methods : {
    checkUpdate() {
      updater.checkForUpdates();
    },
    onDidChange({ status, lastSuccessfulCheck }) {
      this.lastSuccessfulCheck = lastSuccessfulCheck;
      this.status = status;
    },
    onProgress(progress) {
      this.progress = progress;
    },
    onError() {
      this.status = updater.status;
    },
    quitAndInstall() {
      updater.quitAndInstallUpdate();
    },
    handleUserProtocol() {
      this.$message.warning('用户协议还没做好哦');
    },
    handlePrivacy() {
      this.$message.warning('隐私政策还没做好哦');
    },
  },
  mounted() {
    updater.autoInstallOnAppQuit = this.autoUpdate;
    updater.on('error', this.onError);
    updater.on('did-change', this.onDidChange);
    updater.on('progress', this.onProgress);
    if (updater.status === 4) return; // 如果 更新下载中 则不检查更新
    this.checkUpdate();
  },
  watch : {

  },
  beforeDestroy() {
    updater.off('error', this.onError);
    updater.off('did-change', this.onDidChange);
    updater.off('progress', this.onProgress);
  },
};
</script>

<style>
.yealink-logo-color {
  background-color:#06B676
}
</style>
