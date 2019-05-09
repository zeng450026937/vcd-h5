<template>
  <div class="flex flex-col h-full items-center justify-center">
    <div class="mt-4">
      <img src="../../assets/LOGO_VCD_2.png">
    </div>
    <div class="mt-5 text-base leading-loose">
      {{$t('setting.about.aboutName')}}
    </div>
    <div class="mt-1 text-black6 text-xs leading-tight">
      {{$t('setting.about.versionName')}}： {{currentVersion}}
    </div>
    <div class="update-status-describe" v-if="status !==3">
      <span class="tip">{{$t(`setting.about.updateStatusMap.${statusName}`)}}</span>
      <div v-if="status===4 || status ===3">
        <a-progress class="progress" :percent="percent" size="small" status="active" />
      </div>
    </div>

    <div class="mt-5 w-1/2 text-center" v-if="status === 3">
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
    <copyright></copyright>
  </div>
</template>

<script>
import Copyright from './Copyright.vue';

export default {
  name       : 'update-panel',
  components : {
    Copyright,
  },
  data() {
    return {
      statusNameList : [ 
        'checking', 'finded', 'none', 'downloaded', 'downloading',
      ],
    };
  },

  sketch : {
    ns    : 'setting',
    props : [ 'autoUpdate' ],
  },

  computed : {
    currentVersion() {
      return this.$model.application.version;
    },
    status() {
      return this.$model.updater.status;
    },
    progress() {
      return this.$model.updater.progress;
    },
    lastSuccessfulCheck() {
      return this.$model.updater.lastSuccessfulCheck;
    },
    percent() {
      return this.progress 
        ? Math.ceil(this.progress.percent) 
        : this.status === 3 // ready
          ? 100 
          : 0;
    },
    statusName() {
      return this.statusNameList[this.status];
    },
  },

  methods : {
    checkUpdate() {
      this.$dispatch('updater.checkForUpdates');
    },
    quitAndInstall() {
      this.$dispatch('updater.quitAndInstallUpdate');
    },
    handleUserProtocol() {
      this.$message.warning('用户协议还没做好哦');
    },
    handlePrivacy() {
      this.$message.warning('隐私政策还没做好哦');
    },
  },

  mounted() {
    this.checkUpdate();
  },
};
</script>
<style lang="less">
  .update-status-describe {
    background: #F0F2F8;
    border-radius: 4px;
    width: 320px;
    height: 36px;
    font-size: 12px;
    margin-top: 20px;
    text-align: center;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    .tip {
      color: #333333;
    }
    .progress {
      position: absolute;
      left: -15px;
      bottom: -4px;
     .ant-progress-outer {
       padding: 0;
       .ant-progress-bg {
         height: 4px !important;
       }
       .ant-progress-inner {
         background: #D8D8D8;
       }
     }
      .ant-progress-text {
        display: none;
      }
    }
  }
</style>
