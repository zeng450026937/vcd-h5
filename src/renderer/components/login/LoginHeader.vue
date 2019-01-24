<template>
  <a-layout id="login-header" class="flex-no-grow z-top">
    <a-layout-header class="px-2 h-12 select-none">
      <div class="flex flex-row h-full">
        <div class="flex flex-row text-white items-center flex-no-grow">
          <a-icon type="cloud" class="text-2xl ml-1"/>
          <div class="ml-4 text-base">
            Yealink VC Desktop
          </div>
        </div>
        <div class="flex-grow dragable"></div>
        <div class="flex items-center text-white mr-4">
          <a-dropdown v-model="menuStatus" :trigger="['click']">
            <a-menu slot="overlay" @click="handleMenuClick">
              <a-menu-item key="cloud" class="py-2 ">云服务版</a-menu-item>

              <a-menu-item key="yms" class="py-2">企业版</a-menu-item>
            </a-menu>
            <span class="ant-dropdown-link cursor-pointer">
              {{ serverText }}
              <a-icon :type="menuStatus ? 'caret-up': 'caret-down'" class="text-base" />
            </span>
          </a-dropdown>
        </div>
        <div class="flex flex-row flex-no-grow text-white items-center cursor-pointer">

          <a-dropdown v-model="helpStatus" :trigger="['click']">
            <a-menu slot="overlay" @click.self="handleHelpClick">
              <a-menu-item key="cloud" class="px-6">帮助</a-menu-item>
              <a-menu-item key="yms" class="px-6" @click="reportIssues">反馈</a-menu-item>
            </a-menu>
            <a-icon type="question-circle"
                    class="ant-dropdown-link mx-2 text-base h-full flex items-center"/>
          </a-dropdown>

          <a-icon type="minus" class="text-sm mx-3 text-grey-dark hover:text-indigo no-dragable"
                  @click="clickMinimize"/>
          <a-icon type="border" class="text-sm mx-2 text-grey-dark hover:text-indigo no-dragable"
                  @click="clickMaximize"/>
          <a-icon type="close" class="text-sm mx-3 text-grey-dark hover:text-red no-dragable"
                  @click="clickClose"/>
        </div>
      </div>
    </a-layout-header>
    <div>
      <a-modal
          title="意见反馈"
          v-model="reportVisible"
          okText="确认"
          cancelText="取消"
      >
        <div class="flex flex-col">
          <div>
            <span>问题描述</span>
            <a-textarea
                placeholder="请输入详细的问题描述"
                :autosize="{ minRows: 4, maxRows: 6 }"
            ></a-textarea>
          </div>
          <div class="mt-2">
            <span>上传图片（可选）</span>
          </div>
          <div class="mt-1">
            <a-upload
                action="//jsonplaceholder.typicode.com/posts/"
                listType="picture-card"
                :fileList="fileList"
                @preview="handlePreview"
                @change="handleChange"
            >
              <div v-if="fileList.length < 3">
                <a-icon type="plus" class="text-2xl" />
                <div class="ant-upload-text">Upload</div>
              </div>
            </a-upload>
            <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
              <img alt="example" style="width: 100%" :src="previewImage" />
            </a-modal>
          </div>
          <div class="mt-2">
            <span>联系方式</span>
            <a-input placeholder="请输入联系方式"/>
          </div>
          <div class="mt-2">
            <a-checkbox>上传错误日志，帮助我们更好的定位错误</a-checkbox>
          </div>
        </div>
      </a-modal>
    </div>
  </a-layout>
</template>

<script>
export default {
  name : 'LoginHeader',
  data() {
    return {
      menuStatus     : false,
      helpStatus     : false,
      reportVisible  : false,
      previewVisible : false,
      previewImage   : '',
      fileList       : [ {
        uid    : '-1',
        name   : 'xxx.png',
        status : 'done',
        url    : 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      } ],
    };
  },
  computed : {
    serverText() {
      const textMap = {
        cloud : '云服务版',
        yms   : '企业版',
      };

      return textMap[this.$model.login.serverType] || '请选择服务器';
    },
    inPreview() {
      return this.$route.name === 'login-preview';
    },
    loginType() {
      return this.$model.login.loginType;
    },
  },
  methods : {
    clickMinimize() {
      this.$dispatch('sys.minimize');
    },
    clickMaximize() {
      this.$dispatch('sys.maximize');
    },
    clickClose() {
      this.$dispatch('sys.close');
    },
    handleHelpClick() {},
    handleMenuClick({ key }) {
      if (!this.inPreview) {
        // 如果不是在预览页面
        const pre = this.loginType === 'login' ? '' : 'm-';
        const routeMap = {
          cloud : `/login/${pre}cloud`,
          yms   : `/login/${pre}yms`,
        };

        this.$router.push(routeMap[key]);
      }
      this.$model.login.serverType = key;
      this.menuStatus = false;
    },
    reportIssues() {
      this.reportVisible = true;
    },
    handleOk() {},
    handleCancel() {
      this.previewVisible = false;
    },
    handlePreview(file) {
      this.previewImage = file.url || file.thumbUrl;
      this.previewVisible = true;
    },
    handleChange({ fileList }) {
      this.fileList = fileList;
    },
  },
  watch : {
  },
};
</script>

<style scoped lang="less">
  #login-header {
    background: rgba(0, 0, 0, 0.4);
  }
</style>
