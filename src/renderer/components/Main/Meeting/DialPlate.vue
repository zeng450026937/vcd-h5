<template>
  <a-layout id="dial-plate" class="h-full select-none">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>拨号</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0"/>
      <div class="h-full m-4 bg-white flex items-center">
        <div class="w-1/2 h-full flex flex-col p-10">
          <a-input defaultValue="号码" v-model="callNumber">
            <a-icon slot="suffix"
                    type="close"
                    class="text-sm text-grey cursor-pointer hover:text-red"
                    @click="callNumber = ''"/>
          </a-input>
          <span class="text-indigo cursor-pointer text-center text-xs mt-3" @click="showDrawer = true">添加为本地联系人</span>
          <div class="flex flex-wrap mt-3">
            <div class="my-2 w-1/3 text-center"
                 v-for="n in dialPanel"
                 :key="n.num">
              <div class="flex justify-center">
                <div class="rounded w-14 h-14 border cursor-pointer hover:text-blue hover:border-blue">
                  <div class="flex flex-col justify-center items-center h-full">
                    <span class="text-xl">{{n.num}}</span>
                    <span class="text-xs text-grey-darker">{{n.alpha}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex mt-8 w-full">
            <a-button type="primary" icon="video-camera" class="w-1/2"/>
            <a-button type="primary" icon="phone" class="ml-4 w-1/2"/>
          </div>
        </div>
        <a-divider type="vertical" class="h-full mx-0"/>
        <div class="w-1/2 h-full">
          <div class="h-full flex flex-col">
            <div class="mx-2 my-3">拨号搜素结果（6）</div>
            <a-divider class="my-0"/>
            <div class="flex flex-col h-full overflow-y-auto px-2">
              <div v-for="i in 20" :key="i" class="group cursor-pointer hover:bg-grey-lighter">
                <div class="flex px-3 items-center h-14">
                  <div>
                    <a-avatar :size="32" class="bg-indigo-dark"><span class="m-1">测试</span></a-avatar>
                  </div>
                  <div slot="title" class="truncate ml-3">
                    <div class="flex flex-col justify-center">
                      <span class="text-sm leading-none truncate">张三</span>
                      <span class="text-xs opacity-75 leading-none mt-1">[视频通话] 4587349579</span>
                    </div>
                  </div>
                  <div class="flex flex-grow"></div>
                  <div class="flex">
                    <a-icon class="opacity-0 group-hover:opacity-100 text-indigo cursor-pointer"
                            theme="filled"
                            type="video-camera"></a-icon>
                    <a-icon class="ml-3 opacity-0 group-hover:opacity-100 text-indigo cursor-pointer"
                            theme="filled"
                            type="phone"></a-icon>
                    <a-icon type="ellipsis"
                            class="ml-3 opacity-0 group-hover:opacity-100 text-indigo cursor-pointer"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <a-drawer
          title="添加为本地联系人"
          :closable="false"
          width=360
          placement="right"
          @close="showDrawer = false"
          :visible="showDrawer"
          wrapClassName="call-record-info-drawer"
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

export default {
  name       : 'DialPlate',
  components : {
    AppHeader,
  },
  data() {
    return {
      dialPanel : [
        { num: '1', alpha: '' },
        { num: '2', alpha: 'ABC' },
        { num: '3', alpha: 'DEF' },
        { num: '4', alpha: 'GHI' },
        { num: '5', alpha: 'JKL' },
        { num: '6', alpha: 'MNO' },
        { num: '7', alpha: 'PQRS' },
        { num: '8', alpha: 'TUV' },
        { num: '9', alpha: 'WXYZ' },
        { num: '*', alpha: '.@' },
        { num: '0', alpha: '+' },
        { num: '#', alpha: '' },
      ],
      callNumber : '',
      showDrawer : false,
    };
  },
};
</script>

<style lang="less">
  .call-record-info-drawer {
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
