<template>
  <a-modal
      :visible="visible"
      style="top: 70px;left: 32px"
      :width=820
      :footer="null"
      wrapClassName="conference-statistics-modal"
      @cancel="visible = false"
  >
    <div class="flex flex-col">
      <div class="flex justify-center items-center h-12 border-b font-semibold">
        <a-iconfont type="icon-fuwuqi" class="text-base"/>
        <span class="text-base leading-loose text-black"
              style="margin-left: 10px">Yealink VC Desktop</span>
      </div>


      <div class="flex flex-col overflow-y-auto"
           style="padding:20px; ;height: 476px">
        <div class="flex flex-wrap h-full">
          <div class="w-1/2 bg-card">

          </div>
          <div class="w-1/2 bg-red-light">

          </div>
          <div class="w-1/2 bg-host">

          </div>
          <div class="w-1/2 bg-visitor">

          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>

export default {
  name : 'ConferenceStatisticsModal',
  data() {
    return {
      visible : false,
    };
  },
  computed : {
  },
  mounted() {
  },
  methods : {
  },
  watch : {
    visible(val) {
    },
  },
};
</script>
<style lang="less">
  .conference-statistics-modal {
    .ant-modal-close-x {
      width: 48px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .ant-modal-body {
      padding: 0;
      .ant-tabs-top-bar {
        margin: 0;
      }
    }
  }
</style>
