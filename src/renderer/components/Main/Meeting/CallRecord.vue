<template>
  <a-layout id="call-record" class="h-full">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>通话记录（5）</span>
          </div>
          <div class="no-dragable flex items-center">
            <a-radio-group size="small" defaultValue="all" buttonStyle="solid">
              <a-radio-button value="all" class="text-xs">所有通话</a-radio-button>
              <a-radio-button value="un-receive" class="text-xs">未接来电</a-radio-button>
            </a-radio-group>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="flex m-4 h-full bg-white">
        <a-table align="center"
                 class="px-1 bg-white h-full w-full"
                 :columns="recordColumns"
                 :dataSource="recordList"
        >
          <!--<span slot="titleLastTime">持续时间 <a-icon type="clock-circle" /></span>-->
          <div class="flex items-center" slot="name" slot-scope="text, record">
            <div class="cursor-pointer ml-4">
              <a-avatar v-if="record.type.startsWith('audio')" class="bg-indigo-dark">{{text.substr(-2,2)}}</a-avatar>
              <a-avatar v-else class="bg-indigo" icon="team"></a-avatar>
            </div>
            <span class="ml-2 text-sm">{{text}}</span>
          </div>

          <div class="flex items-center"
               slot="type" slot-scope="text"
               :class="text|typeFilter|klass">
            <a-icon :type='text|typeFilter|icon'
                    class="text-sm"
                    theme="filled"/>
            <span class="ml-2 text-xs">{{text|typeFilter|text}}</span>
          </div>

          <div class="flex justify-center text-sm" slot="operation" slot-scope="text, record">
            <a-icon type='video-camera' theme="filled"
                    class="text-indigo cursor-pointer hover:text-blue"/>
            <a-icon type='phone' theme="filled"
                    class="text-indigo cursor-pointer hover:text-blue mx-5"/>
            <a-icon type='right'
                    class="text-indigo cursor-pointer hover:text-blue"
                    @click="clickMore"/>
          </div>
        </a-table>
      </div>
      <div></div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../MainHeader.vue';
import { MAIN } from '../../../router/constants';

const recordList = [
  {
    name     : '陆小果的视频会议',
    type     : 'video-miss',
    lastTime : '',
    date     : '今天 14：30',
  },
  {
    name     : '橙留香',
    type     : 'audio-miss',
    lastTime : '',
    date     : '今天 14：30',
  },
  {
    name     : '陆小果',
    type     : 'audio-out',
    lastTime : '30分51秒',
    date     : '今天 14：30',
  },
  {
    name     : '菠萝吹雪的视频会议',
    type     : 'video-out',
    lastTime : '30分51秒',
    date     : '今天 14：30',
  },
  {
    name     : '陆小果',
    type     : 'audio-in',
    lastTime : '30分51秒',
    date     : '今天 14：30',
  },
  {
    name     : '菠萝吹雪的视频会议',
    type     : 'video-in',
    lastTime : '30分51秒',
    date     : '今天 14：30',
  },
];
const recordColumns = [
  {
    title       : '名称',
    dataIndex   : 'name',
    scopedSlots : { customRender: 'name' },
  },
  {
    title       : '类型',
    dataIndex   : 'type',
    scopedSlots : { customRender: 'type' },
  },
  {
    title     : '持续时间',
    dataIndex : 'lastTime',
    // slots     : { title: 'titleLastTime' },
  },
  {
    title     : '时间',
    dataIndex : 'date',
  },
  {
    title       : '',
    dataIndex   : 'operation',
    scopedSlots : { customRender: 'operation' },
  },
];

export default {
  name       : 'CallRecord',
  components : {
    AppHeader,
  },
  data() {
    return {
      // video-miss audio-miss audio-out video-out audio-in video-in
      recordColumns,
      recordList,
    };
  },
  methods : {
    clickMore() {
      this.$router.push(MAIN.CALL_RECORD_INFO);
    },
  },
  filters : {
    // typeIconFilter(type) {
    //   return this.typeFilter(type).icon;
    // },
    icon(value) {
      return value.icon;
    },
    klass(value) {
      return value.klass;
    },
    text(value) {
      return value.text;
    },
    typeFilter(type) {
      const typeMap = {
        'video-miss' : {
          icon  : 'video-camera',
          klass : { 'text-red': true },
          text  : '未接',
        },
        'audio-miss' : {
          icon  : 'phone',
          klass : { 'text-red': true },
          text  : '未接',
        },
        'audio-out' : {
          icon  : 'phone',
          klass : { 'text-blue': true },
          text  : '呼出',
        },
        'video-out' : {
          icon  : 'video-camera',
          klass : { 'text-blue': true },
          text  : '呼出',
        },
        'audio-in' : {
          icon  : 'phone',
          klass : { 'text-blue': true },
          text  : '呼入',
        },
        'video-in' : {
          icon  : 'video-camera',
          klass : { 'text-blue': true },
          text  : '呼入',
        },
      };


      return typeMap[type];
    },
  },
};
</script>

<style lang="less">
#call-record {
  .ant-table-wrapper {
    .ant-table-thead {
      font-size: 12px;
      color: #333333;
      line-height: 20px;
      >tr >th {
        padding: 0;
        background-color: white;
        height: 40px;
        div{
          padding-left: 16px;
        }
      }
    }
    .ant-table-tbody {
      font-size: 12px;
      color: #333333;
      line-height: 20px;
      >tr >td {
        padding: 0;
        background-color: white;
        height: 56px;
      }
    }
  }
}
</style>
