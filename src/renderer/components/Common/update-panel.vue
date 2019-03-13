<template>
  <div class="flex flex-col h-full items-center">
    <div class="mt-4">
      <a-avatar class="cursor-pointer rounded-lger hover:shadow yealink-logo-color"
                shape="square"
                :size="128">
        <span class="text-xl">Yealink</span>
      </a-avatar>
    </div>
    <div class="mt-5 text-base leading-loose">
      Yealink VC Desktop
    </div>
    <div class="mt-1 text-black6 text-xs leading-tight">
      版本号： {{currentVersion}}
    </div>
    <div class="mt-1 text-black6 text-xs leading-tight">
      {{statusDesc}}
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
        检查更新
      </a-button>

      <a-button
          v-if="status===3"
          @click="quitAndInstall"
          class="w-60 h-9"
          type="primary">
        退出并安装
      </a-button>

    </div>
    <div class="mt-5">
      <a-switch v-model="isAutoUpdate" size="small"/>
      <span class="ml-2">自动更新</span>
    </div>
    <div class="flex text-indigo mt-5 items-center text-xs">
      <span class="cursor-pointer">用户协议</span>
      <a-divider class="mx-4" type="vertical"></a-divider>
      <span class="cursor-pointer">隐私政策</span>
    </div>
    <p class="mt-5 text-xs leading-tight text-black9">
      Copyright © 2018 Yealink Inc. All rights reserved.
    </p>
  </div>
</template>

<script>

import updater from '../../updater';

const updateStatus = {
  0 : '开始检查更新',
  1 : '发现一个可用更新',
  2 : '没有可用更新',
  3 : '更新下载完成',
  4 : '更新下载中',
};

export default {
  name : 'update-panel',
  data() {
    return {
      updateStatus,
      status              : updater.status,
      isAutoUpdate        : true,
      currentVersion      : window.autoUpdater.appVersion,
      lastSuccessfulCheck : null,
      progress            : null,
    };
  },
  watch : {
    isAutoUpdate(val) {
      this.$storage.insert('AUTO_UPDATE', { isAutoUpdate: val });
    },
  },
  computed : {
    statusDesc() {
      return this.updateStatus[this.status];
    },
    percent() {
      if (this.status === 3) return 100;
      
      return this.progress ? Number(this.progress.percent.toFixed(2)) : 0;
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
  },
  mounted() {
    if (!this.$storage.query('AUTO_UPDATE')) {
      this.$storage.insert('AUTO_UPDATE', { isAutoUpdate: true });
    }
    // updater.autoInstallOnAppQuit = this.isAutoUpdate = this.$storage.query('AUTO_UPDATE').isAutoUpdate;
    // updater.on('error', this.onError);
    // updater.on('did-change', this.onDidChange);
    // updater.on('progress', this.onProgress);
    // if (updater.status === 4) return; // 如果 更新下载中 则不检查更新
    // this.checkUpdate();
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
