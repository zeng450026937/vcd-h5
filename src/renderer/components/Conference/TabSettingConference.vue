<template>
  <a-layout id="tab-setting-conference" class="bg-white">
    <div class="flex flex-col px-4">
      <div v-if="isDefault && isPresenter" class="flex flex-col mb-5">
        <span class="text-sm leading-tight">{{$t('conversation.setting.layout')}}</span>
        <div class="flex mt-3 justify-between px-1">
          <div v-for="layout in layoutList" :key="layout.value"
               class="layout"
               @click="selectLayout(layout.value)">
            <a-iconfont :type="layout.icon"
                        :class="{'text-indigo': layout.value === currentLayout}"/>
          </div>
        </div>
      </div>
      <div class="flex items-center">
        <a-switch size="small" v-model="showMessage"/>
        <span class="text-sm leading-tight ml-3">{{$t('conversation.setting.conferenceTips')}}</span>
      </div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name : 'TabSettingConference',
  data() {
    return {
      layoutList : [
        {
          value : 'SpeechExcitation',
          icon  : 'icon-n',
        },
        {
          value : 'Equality',
          icon  : 'icon-dengfen',
        },
        {
          value : 'Exclusive',
          icon  : 'icon-danfangquanping',
        },
      ],
    };
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ '', 'showMessage' ],
  },
  computed : {
    isDefault() {
      return this.$model.conference.profile === 'default';
    },
    isPresenter() { // current => the current login user
      return this.$model.conference.isPresenter;
    },
    currentLayout() {
      return this.$rtc.conference.videoLayout;
    },
  },
  methods : {
    selectLayout(layout) {
      this.$rtc.conference.information.view.setLayout({
        'video-layout'                : layout,
        'video-max-view'              : 5,
        'video-speech-ex-sensitivity' : 2,
        'video-round-interval'        : 2,
      });
    },
  },
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
