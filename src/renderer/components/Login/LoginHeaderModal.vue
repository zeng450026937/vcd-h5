<template>
  <a-layout class="login-header-modal">
    <a-modal
        title="意见反馈"
        v-model="visible"
        wrapClassName="login-header-modal"
        okText="确认"
        cancelText="取消"
        @ok="startFeedback"
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
            <img alt="example" class="w-full" :src="previewImage" />
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
  </a-layout>
</template>

<script>
import { feedBackReport } from '../../service/api/feedBack';
import { getTodayLogData } from '../../proxy/main-process-proxy';

export default {
  name : 'LoginHeaderModal',
  data() {
    return {
      visible        : false,
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
  methods : {
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
    async startFeedback() {
      const formData = await this.getFormData();

      feedBackReport('031b021c040d05c823061f0700080009', formData);
    },
    async getFormData() {
      const logInfo = await getTodayLogData();

      const form = new FormData();

      // form.append('image', this.fileList[0]);
      form.append('param', JSON.stringify({
        feedbackTitle    : '这是一条测试反馈信息标题',
        feedbackContent  : '这是一条测试反馈信息',
        feedbackCategory : 'user_feedback',
      }));

      return form;
    },
  },
};
</script>

<style lang="less">
.login-header-modal {
  display: flex;
  align-items: center;
  .ant-modal {
    top: 0 !important;
  }
  .ant-modal-header {
    padding: 12px 16px;
  }
  .ant-modal-body {
    padding: 12px 16px;
  }
  .ant-modal-footer {
    padding: 10px 16px;
  }
}
</style>
