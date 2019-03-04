<template>
  <a-layout class="login-header-modal">
    <a-modal
        title="意见反馈"
        v-model="visible"
        wrapClassName="login-header-modal"
        okText="确认"
        cancelText="取消"
        @ok="submitFeedBack"
        @cancel="close"
    >
      <div class="flex flex-col">
        <div>
          <span>问题描述</span>
          <a-textarea
              v-model="problemDescribe"
              placeholder="请输入详细的问题描述"
              :autosize="{ minRows: 4, maxRows: 6 }"
          ></a-textarea>
        </div>
        <div class="mt-2">
          <span>上传图片（可选）</span>
        </div>
        <div class="mt-1">
          <a-upload
              :beforeUpload="stopAutoUpload"
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
        </div>
        <!--<div class="mt-2">-->
          <!--<span>联系方式</span>-->
          <!--<a-input placeholder="请输入联系方式"/>-->
        <!--</div>-->
        <div class="mt-2">
          <a-checkbox v-model="isUploadLog">上传错误日志，帮助我们更好的定位错误</a-checkbox>
        </div>
      </div>
    </a-modal>
  </a-layout>
</template>

<script>
import { readFile } from 'fs-extra';
import path from 'path';
import { gzip } from 'zlib';
import { getLogDirectory } from '../../proxy/main-process-proxy';

export default {
  name : 'LoginHeaderModal',
  data() {
    return {
      visible         : false,
      previewVisible  : false,
      previewImage    : '',
      fileList        : [],
      isUploadLog     : true,
      problemDescribe : '',
    };
  },
  methods : {
    handleOk() {},
    close() {
      this.reset();
      this.previewVisible = false;
    },
    stopAutoUpload() {
      return false;
    },
    handlePreview(file) {
      this.previewImage = file.url || file.thumbUrl;
      this.previewVisible = true;
    },
    handleChange({ fileList }) {
      this.fileList = fileList;
    },
    check() {
      if (!this.problemDescribe) {
        this.$message.info('请输入问题描述！');

        return false;
      }

      return true;
    },
    zipFile(stream) {
      return new Promise((resolve) => {
        gzip(stream, (error, buffer) => {
          resolve(buffer);
        });
      });
    },
    async getTodayLog() {
      const logDir = await getLogDirectory();
      const fileName = this.getLogFileName();
      const input = await readFile(path.join(logDir, `/${fileName}`));

      return this.zipFile(input);
    },
    getLogFileName() {
      return `vc-desktop.${this.getDate()}.log`;
    },
    getDate(date = new Date()) {
      const year = new Date(date).getFullYear();
      const month = new Date(date).getMonth() + 1;
      const day = new Date(date).getDate();
      const toDoubule = (num) => (num < 9 ? `0${num}` : num);

      return `${year}-${toDoubule(month)}-${toDoubule(day)}`;
    },
    reset() {
      this.fileList = [];
      this.problemDescribe = '';
      this.isUploadLog = true;
    },
    async submitFeedBack() {
      if (!this.check()) return;

      const formData = new FormData();

      if (this.isUploadLog) {
        const todayLog = await this.getTodayLog();

        formData.append('log', new Blob(todayLog), `${this.getLogFileName()}.zip`);
      }

      this.fileList.map((item) => item.originFileObj).forEach((img) => {
        formData.append('img', img);
      });
      formData.append('param', JSON.stringify({
        feedbackContent : this.problemDescribe,
        // feedbackCategory,
        // feedbackTitle,
      }));

      const res = await this.$root.$apis.yealink.doFeedback(formData);

      if (res == null) return this.$message.info('上报反馈信息失败！');

      this.visible = false;
      this.close();
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
