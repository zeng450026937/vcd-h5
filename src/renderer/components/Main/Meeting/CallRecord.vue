<template>
  <a-layout id="call-record" class="h-full">
    <div class="flex flex-col h-full">
      <app-header>
        <template slot="content">
          <div class="flex items-center h-full px-4 text-base">
            <span>通话记录（{{callRecord.length}}）</span>
          </div>
          <div class="no-dragable flex items-center">
            <a-radio-group v-model="recordType" size="small" defaultValue="all" buttonStyle="solid">
              <a-radio-button value="all" class="text-xs">所有通话</a-radio-button>
              <a-radio-button value="missed" class="text-xs">未接来电</a-radio-button>
            </a-radio-group>
          </div>
        </template>
      </app-header>

      <div class="flex m-4 bg-white auto-scroll-y">
        <a-table
            v-if="ready"
            :pagination="false"
            :rowKey="record => record.id"
            :columns="recordColumns"
            :dataSource="currentRecords"
            class="bg-white w-full"
        >
          <div class="flex items-center" slot="callTitle" slot-scope="text, record">
            <div class="cursor-pointer mr-1">

              <a-popover
                  placement="rightTop"
                  trigger="hover"
                  overlayClassName="avatar-popover">
                <template slot="content">
                  <div class="flex w-80 flex-col shadow">
                    <!--头部-->
                    <div class="flex items-center w-full px-5 py-4 bg-card rounded-t text-white">
                      <div class="flex flex-col max-w-4/5 flex-grow">
                        <div class="text-base flex leading-loose">
                            <span class="w-1 flex flex-grow truncate">
                              <span class="truncate">{{record.contact.name}}</span>
                            </span>
                        </div>
                        <div class="truncate text-xs font-thin leading-tight opacity-75 mt-1">
                          <!--<span>{{item | filterCardText}}</span>-->
                        </div>
                      </div>
                      <div class="flex justify-center ml-3">
                        <a-avatar v-if="record.contact.isGroup || (!record.contact.isUser && !record.contact.isFavorite && !record.contact.isLocal)"
                                  :size="48"
                                  :class="{ 'bg-transparent' : record.contact.isGroup,
                                    [`text-${record.contact.isGroup ? 'grey-dark' : 'white'}`]: true}">
                          <a-iconfont :type="record.contact|icon" class="text-3xl"></a-iconfont>
                        </a-avatar>
                        <a-avatar v-else :size="48">{{record.contact.nick}}</a-avatar>
                      </div>
                    </div>

                    <div class="flex flex-col px-5 py-3 text-xs">
                      <div class="flex items-center">
                        <span class="mr-3 truncate text-black6">{{record.contact.isUser ? '账号' : '号码'}}</span>
                        <span>{{record.contact.number}}</span>
                        <div class="flex flex-grow"></div>
                        <a-iconfont type="icon-shipin"
                                    @click.stop="doAudio(record)"
                                    class="mr-4 text-indigo cursor-pointer text-base"></a-iconfont>
                        <a-iconfont type="icon-yuyin"
                                    @click.stop="doAudio(record)"
                                    class="text-indigo cursor-pointer text-base"></a-iconfont>
                      </div>
                      <template v-if="record.contact.isUser">
                        <div class="flex items-center mt-3 ">
                          <span class="mr-3 text-black6">手机</span>
                          <span>{{record.contact.phone}}</span>
                        </div>
                        <div class="flex mt-3 items-center">
                          <span class="mr-3 text-black6">邮箱</span>
                          <span>{{record.contact.email || '暂无邮箱'}}</span>
                        </div>
                        <div class="mt-3 flex items-start">
                          <span class="mr-3 whitespace-no-wrap text-black6">分组</span>
                          <span class="text-indigo">
                             <!--<template v-for="(item, index) in pathList" >-->
                                <!--<a :key="item.id"-->
                                   <!--v-if="index < pathList.length - 1"-->
                                   <!--class="hover:underline text-indigo"-->
                                   <!--@click="clickDept(item)">{{item.text}}/-->
                                <!--</a>-->
                                <!--<span v-else style="cursor: unset" :key="item.id">{{item.text}}</span>-->
                            <!--</template>-->
                          </span>
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
                <a-avatar v-if="record.contact.isGroup || (!record.contact.isUser && !record.contact.isFavorite && !record.contact.isLocal)"
                          class="text-xl"
                          :class="{ 'bg-transparent' : record.contact.isGroup,
                                    [`text-${record.contact.isGroup ? 'grey-dark' : 'white'}`]: true}">
                <a-iconfont  :type="record.contact|icon" ></a-iconfont>
                </a-avatar>
                <a-avatar v-else>{{record.contact.nick}}</a-avatar>


                <!--<a-avatar v-if="!record.isConference"-->
                          <!--class="bg-indigo-dark">-->
                  <!--{{text|name}}-->
                <!--</a-avatar>-->
                <!--<a-avatar v-else class="bg-indigo" icon="team"></a-avatar>-->
              </a-popover>

            </div>
            <span class="ml-2 text-xs">{{text}}</span>
          </div>

          <div
              class="flex items-center"
              slot="type"
              slot-scope="text, record"
              :class="{'text-red':!record.connected}"
          >
            <a-iconfont :type='record|callIcon' class="text-base mr-1" theme="filled"></a-iconfont>
            <span class="ml-2 text-xs">{{record|callType}}</span>
          </div>

          <div class="flex items-center" slot="duration" slot-scope="text, record">
            <div class="text-xs">
              {{record|duration}}
            </div>
          </div>

          <div class="flex items-center" slot="startTime" slot-scope="text, record">
            <div class="text-xs">
              {{text|genStartTime}}
            </div>
          </div>

          <div class="flex justify-center text-sm operate-btns" slot="operation" slot-scope="text, record">

            <a-iconfont
                @click="doVideo(record)"
                type='icon-shipin'
                class="text-indigo text-base cursor-pointer hover:text-blue">
            </a-iconfont>

            <a-iconfont
                @click="doAudio(record)"
                type='icon-yuyin'
                class="text-indigo text-base cursor-pointer hover:text-blue mx-5">
            </a-iconfont>

            <a-iconfont type='icon-right'
                        class="text-indigo text-base cursor-pointer hover:text-blue"
                        @click="clickMore(record)">
            </a-iconfont>

          </div>
        </a-table>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { CallRecord } from '../../../database/call-record';
import { genDurationTime, genStartTime } from '../../../utils/date';
import { callIcon, callType } from '../../../utils/filters';
import AppHeader from '../MainHeader.vue';
import { MAIN } from '../../../router/constants';

const recordColumns = [
  {
    title       : '名称',
    dataIndex   : 'subject',
    scopedSlots : { customRender: 'callTitle' },
  },
  {
    title       : '类型',
    dataIndex   : 'media',
    scopedSlots : { customRender: 'type' },
  },
  {
    title       : '持续时间',
    dataIndex   : 'endTime',
    scopedSlots : { customRender: 'duration' },
  },
  {
    title       : '时间',
    dataIndex   : 'startTime',
    scopedSlots : { customRender: 'startTime' },
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
      recordColumns,
      callRecord : [],
      recordType : 'all',
      ready      : false,
    };
  },
  computed : {
    store() {
      return this.$model.contact.phoneBookStore;
    },
    currentRecords() {
      if (this.recordType === 'all') return this.callRecord;

      if (this.recordType === 'missed') return this.callRecord.filter((record) => !record.connected);
    },
    recordUpdate() {
      return this.$model.state.recordUpdate;
    },
  },
  watch : {
    recordUpdate(val) {
      this.updateRecord();
    },
  },
  methods : {
    async getContactInfo(val) {
      let contact = this.store.getNodeByNumber(val);

      if (!contact) {
        const contacts = await this.$model.contact.findContacts(val).catch(() => Promise.resolve(null));

        contact = contacts.find((n) => n.number === val);

        if (contact) {
          const parentNode = this.store.findParentNode(contact.id, contact.parentId);

          contact.parentNode = parentNode.name;
        }
      }

      if (!contact) {
        contact = await this.$model.contact.local.search(val);
        if (contact) contact.isLocal = true;
      }

      if (!contact) {
        contact = { number: val, name: '未知联系人', unknown: true };
      }

      return contact;
    },
    clickMore(record) {
      this.$router.push({ path: MAIN.CALL_RECORD_INFO, query: record });
    },
    doVideo(item, video = true, audio = true) {
      if (item.isConference) {
        this.$dispatch('meeting.joinMeeting', {
          number       : item.conferenceNumber,
          pin          : item.pin,
          initialVideo : true,
          initialAudio : true,
        });
      }
      else {
        this.$dispatch('call.call', {
          number  : item.otherId,
          options : {
            audio,
            video,
          },
        });
      }
    },
    doAudio(item) {
      this.doVideo(item, false, true);
    },
    genRecordInfo() {
      return Promise.all(this.callRecord.map(async(item) => {
        if (!item.isConference) {
          item.contact = await this.getContactInfo(item.otherId);
        }
        else {
          item.contact = {};
        }

        return Promise.resolve();
      }));

    },
    async updateRecord() {
      const { account, server } = this.$storage.query('CURRENT_ACCOUNT');

      this.callRecord = await this.callRecordDb.getRecordByRecent([ account, server ], 100);

      await this.genRecordInfo();

      this.ready = true;
    },
  },
  filters : {
    callType,
    callIcon,
    genStartTime,
    duration({ startTime, endTime }) {
      if (!endTime || !startTime) return '';

      return genDurationTime(startTime, endTime);
    },
    name(name) {
      return /^(.*)\(.*\)$/.test(name) ? RegExp.$1.substr(-2, 2) : name.substr(-2, 2);
    },
    icon(node) {
      return node.isUser ? 'icon-zuzhi'
        : node.isDevice ? 'icon-huiyishishebei'
          : node.isExternal ? 'icon-zuzhi'
            : node.isService ? 'icon-wangluo'
              : node.isVMR ? 'icon-xunihuiyishi'
                : node.unknown ? 'icon-ren' : 'icon-zuzhi';
    },
  },
  async beforeCreate() {
    this.callRecordDb = CallRecord.Create();
  },
  mounted() {
    this.updateRecord();
  },
  beforeDestroy() {
  },
};
</script>

<style lang="less">
  #call-record {
    .ant-table-wrapper {
      padding: 0;

      .ant-table-thead {
        font-size: 12px;
        color: #333333;
        line-height: 20px;

        > tr > th {
          padding: 0;
          background-color: white;
          height: 40px;

          div {
            padding-left: 16px;
          }
        }
      }

      .ant-table-tbody {
        color: #333333;
        line-height: 20px;

        .operate-btns {
          max-height: 0;
          overflow: hidden;
        }

        tr:hover {
          .operate-btns {
            max-height: initial;
          }

          & td {
            background: #E1E5F2;
          }
        }

        > tr > td {
          padding: 0 16px;
          background-color: white;
          height: 56px;
        }
      }
    }

    .ant-table-tbody > tr > td {
      transition: unset;
    }
  }

  .auto-scroll-y {
    overflow-y: auto !important;
  }
</style>
