<template>
  <a-layout id="call-record-info" class="h-full">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <a-iconfont  type="left"
                     class="text-grey-dark text-xs mr-2 no-dragable cursor-pointer hover:text-purple-dark"
                     @click="goBack"/>
            <span>通话详情</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0 "/>
      <div class="h-full m-4 bg-white flex items-center flex-col">
        <div class="flex flex-col h-full" style="width: 440px;">
          <div>
            <div class="flex py-5 items-center w-full border-b" style="width: 440px">
              <div class="flex flex-col truncate">
                <div class="font-semibold leading-normal text-base items-center truncate">
                  匿名
                </div>
                <div class="mt-2 text-xs leading-tight text-black-lightest opacity-75 whitespace-normal">
                  这里是个性签名，限制最多50个字，字太多可以显示两行，保证两行能显示50个字
                </div>
              </div>
              <div class="flex flex-grow"></div>
              <div class="ml-16">
                <a-avatar :size="72" class="bg-indigo-dark">
                  <span class="text-lg">匿名</span>
                </a-avatar>
              </div>
            </div>
          </div>
          <div>
            <div class="flex flex-col py-5 border-b">
              <div>
                <a-row class="text-xs">
                  <a-col :span="24" class="leading-tight">
                    <a-row>
                      <a-col :span="2">账号</a-col>
                      <a-col :span="8">60987623</a-col>
                      <a-col :span="2">邮箱</a-col>
                      <a-col :span="8">zhangjq@yealink.com</a-col>
                    </a-row>
                  </a-col>
                  <a-col :span="24" class="mt-3 leading-tight">
                    <a-row>
                      <a-col :span="2">手机</a-col>
                      <a-col :span="8">13110987623</a-col>
                      <a-col :span="2">部门</a-col>
                      <a-col :span="8" class="text-indigo cursor-pointer"
                             @click="showEditDrawer = true">解决方案部(设为本地联系人)</a-col>
                    </a-row>
                  </a-col>
                </a-row>
              </div>
            </div>
          </div>
          <div class="flex flex-col my-1 flex-grow overflow-y-auto">
            <div v-for="record in recordList" :key="record.date">
              <div class="text-semibold mt-3 leading-normal">{{record.date}}</div>
              <a-row class="mt-3 text-xs leading-tight" v-for="(event, index) in record.events" :key="index">
                <a-col :span="5">{{event.date}}</a-col>
                <a-col :span="14">{{event.text}}</a-col>
                <a-col :span="5">{{event.lastTime}}</a-col>
              </a-row>
            </div>
          </div>
        </div>

        <div class="flex justify-center py-2 border-t w-full">
          <a-button class="ml-4"
                    type="primary">
            <a-iconfont type="icon-shipin"/>
            视频通话
          </a-button>
          <a-button class="ml-4"
                    type="primary">
            <a-iconfont type="icon-yuyin"/>
            音频通话
          </a-button>
        </div>
      </div>
    </div>

    <div>
      <a-drawer
          title="添加为本地联系人"
          :closable="false"
          width=360
          placement="right"
          @close="showEditDrawer = false"
          :visible="showEditDrawer"
          wrapClassName="add-local-contact-drawer"
      >
        <div class="flex h-full flex-col flex-grow mx-5">
          <a-row class="mt-5 flex items-center">
            <a-col :span="4">姓名</a-col>
            <a-col :span="20">
              <a-input
                  placeholder='姓名'
              >
              </a-input>
            </a-col>
          </a-row>
          <a-row class="mt-5 flex items-center">
            <a-col :span="4">账号</a-col>
            <a-col :span="20">
              <a-input
                  placeholder='账号'
              >
              </a-input>
            </a-col>
          </a-row>
          <a-row class="mt-5 flex items-center">
            <a-col :span="4">手机</a-col>
            <a-col :span="20">
              <a-input
                  placeholder='手机'
              >
              </a-input>
            </a-col>
          </a-row>
          <a-row class="mt-5 flex items-center">
            <a-col :span="4">邮箱</a-col>
            <a-col :span="20">
              <a-input
                  placeholder='邮箱'
              >
              </a-input>
            </a-col>
          </a-row>

        </div>
        <div class="flex h-12 border-t justify-center items-center">
          <a-button @click="showEditDrawer = false" type="primary">
            确定
          </a-button>
          <a-button @click="showEditDrawer = false" class="ml-4">
            取消
          </a-button>
        </div>
      </a-drawer>
    </div>

  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';

const recordList = [
  {
    date   : '今天',
    events : [
      {
        date : '15:30',
        type : 'video-miss',
        text : '来自菠萝吹雪的未接通视频通话',
      },
      {
        date     : '15:30',
        type     : 'video-in',
        text     : '来自橙留香的视频通话',
        lastTime : '30分51秒',
      },
      {
        date : '15:30',
        type : 'video-miss',
        text : '来自橙留香的未接通视频通话',
      },
    ],

  },
  {
    date   : '昨天',
    events : [
      {
        date     : '15:30',
        type     : 'video-in',
        text     : '来自橙留香的视频通话',
        lastTime : '30分51秒',
      },
      {
        date : '15:30',
        type : 'video-miss',
        text : '来自橙留香的未接通视频通话',
      },
      {
        date : '15:30',
        type : 'audio-out',
        text : '与陆小果进行通话',
      },
    ],

  },
  {
    date   : '2018/12/26 15:30',
    events : [
      {
        date     : '15:30',
        type     : 'video-in',
        text     : '来自橙留香的视频通话',
        lastTime : '30分51秒',
      },
      {
        date : '15:30',
        type : 'video-miss',
        text : '来自橙留香的未接通视频通话',
      },
      {
        date : '15:30',
        type : 'audio-out',
        text : '与陆小果进行通话',
      },
    ],
  },
];

export default {
  name       : 'CallRecordInfo',
  components : {
    AppHeader,
  },
  data() {
    return {
      recordList,
      showEditDrawer : false,
    };
  },
  methods : {
    goBack() {
      this.$router.back();
    },
  },
};
</script>

<style lang="less">
.add-local-contact-drawer {
  .ant-drawer-wrapper-body {
    display: flex;
    flex-direction: column;
  }
  .ant-drawer-header {
    padding: 13px 18px;
  }
  .ant-drawer-body {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    padding: 0;
  }
}
</style>
