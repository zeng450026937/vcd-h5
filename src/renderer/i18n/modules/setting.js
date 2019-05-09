// 最新导入时间为 2019-3-19 15:53:06 
module.exports = {
  name : 'setting',
  lang : {
    zh : {
      account : {
        personalData         : '个人资料',
        signature            : '这里是个性签名，限制最多50个字，字太多可以显示两行，保证两行能显示50个字',
        username             : '账号',
        phone                : '手机',
        email                : '邮箱',
        group                : '分组',
        enterprise           : '企业',
        switchEnterprise     : '切换企业',
        edit                 : '编辑',
        logout               : '注销',
        getDataFailNotice    : '暂时无法获取当前用户信息',
        editPsd              : '修改密码',
        confirm              : '确认',
        cancel               : '取消',
        originPsd            : '原密码',
        originPsdPlaceHolder : '若包含字母，请注意大小写',
        newPsd               : '新密码',
        newPsdPlaceHolder    : '输入6-16位密码',
        repeatPsd            : '确认密码',
        repeatPsdPlaceHolder : '再次输入密码',
      },
      about : {
        title           : '关于',
        logoText        : 'Yealink',
        aboutName       : 'Yealink VC Desktop',
        versionName     : '版本号',
        userProtocol    : '用户协议',
        privacy         : '隐私政策',
        checkUpdate     : '检查更新',
        exitAndInstall  : '立即更新',
        autoUpdate      : '自动更新',
        updateStatusMap : {
          checking    : '开始检查更新',
          finded      : '发现一个可用更新',
          none        : '当前已是最新版本',
          downloaded  : '更新下载完成',
          downloading : '更新下载中',
        },
      },
      video : {
        title             : '视频',
        camera            : '摄像头',
        cameraPlaceHolder : '请选择摄像头',
        noneCamera        : '看不到任何视频',
        questionNotice    : '如仍有问题，请访问我们的',
        techniqueCenter   : '支持中心',
        enableHDVideo     : '启用超清视频',
        enableHWSpeed     : '启用硬件加速',
        enableMirroring   : '启用视频镜像效果',
        enableLocalVideo  : '启用虚拟摄像头',
        disableVideo      : '加入会议时不开启摄像头',
        cameraNotice      : {
          open    : '请确认您的摄像头已经接通并开启。',
          correct : '检查视频选项以使用正确的网络摄像头。',
          single  : '请确认其他程序没有占用您的摄像头。',
          restart : '重启您的电脑',
        },
      },
      audio : {
        title             : '音频',
        audioInput        : '音频输入',
        inputPlaceHolder  : '请选择麦克风',
        clearNoise        : '启用噪声消除',
        microphoneTest    : '麦克风测试',
        audioOutput       : '音频输出',
        outputPlaceHolder : '请选择扬声器',
        play              : '播放测试音频',
      },
      conference : {
        title                        : '会议',
        share                        : '内容分享',
        minWindowWhenSharing         : '发送内容共享时最小化VCD窗口',
        maxWindowWhenWatchingSharing : '观看他人内容共享时自动最大化VCD窗口',
        enableGpu                    : '屏幕共享时启用GPU加速',
        preferredPictureFluency      : '画面流畅度优先',
        shareComputerSound           : '共享电脑声音',
        baseSetting                  : '基本设置',
        autoSilence                  : '入会自动静音',
        noticeWhenLeaving            : '入会及离会提示音',
        noticeTitle                  : '是否在会议开始和结束时会有提示音提醒？',
        noticeOnlyJoiner             : '仅入会方接收提示音',
        noticeBoth                   : '仅入会方和主持人接收提示音',
        noticeAll                    : '所有参会方接收提示音',
        advanceEntryTime             : '提前入会时间',
        advanceEntryTimeUnite        : '分钟',
        advanceEntryTimeNotice       : '（请设置5~180分钟）',
        instanceMeetingPassword      : '即时会议密码',
        reserveMeetingPassword       : '预约会议密码',
        randomPassword               : '随机密码',
        customPassword               : '自定义密码',
        customPasswordNotice         : '（请输入6位纯数字）',
        loginSelector                : '登录选项框',
        dndWhenCalling               : '通话中免打扰',
        advancedSetting              : '高级设置',
        videoQuality                 : '视频质量',
        superMode                    : '超清模式',
        HDMode                       : '高清模式',
        SDMode                       : '标清模式',

        tipFor1080P : '充分发挥系统性能，展现最好视频画质，会占用较大系统与网络资源。',
        tipFor720P  : '平衡系统流畅度与画质效果，适用于大多数场景。',
        tipFor360P  : '调低带宽并降低视频质量，可以提高系统流畅度。',
      },
      common : {
        title                : '通用',
        autoStart            : '开机自动启动',
        forceMinimize        : '关闭时最小化',
        language             : '切换语言',
        address              : '软终端管理平台地址',
        addressPlaceHolder   : '例如 127.0.0.1',
        updateChannel        : '升级通道',
        noobGuide            : '查看新手引导',
        property             : '标签',
        langChangeNotice     : '语言已切换至{lang}！',
        addProperty          : '添加标签',
        addPropertyNotice    : '添加标签成功！',
        fullPropertyNotice   : '当前标签已满，无法继续添加！',
        propertyExist        : '当前标签已满，无法继续添加！',
        deletePropertyNotice : '标签删除成功！',
        emptyPropertyNotice  : '当前输入标签为空',
        propertyCreateAt     : '标签创建于',
        invalidAddress       : '您输入的地址不合法！',
        updateChannelList    : {
          insiders : '内测',
          faster   : '快速',
          stable   : '稳定',
        },
      },
    },
    en : {
      common : {
        langChangeNotice : 'Language has been switched to {lang}',
      },
    },
  },
};
