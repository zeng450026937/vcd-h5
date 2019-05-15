// 最新导入时间为 2019-5-15 09:01:17 
module.exports = {
  name : 'conversation',
  lang : {
    zh : {
      main : {
        maximizeOrMinimize : '全屏/退出全屏 【初始状态显示全屏， 全屏时显示退出全屏】',
        inviteMember       : '邀请成员',
        lockConference     : '锁定会议',
        memberList         : '成员列表',
        chat               : '聊天',
        setting            : '会议设置',
        popSharing         : '在新窗口打开内容共享',
        screenShare        : '内容共享',
        localVideo         : '本地视频',
        audioConference    : '音频会议',
        audioCall          : '音频通话',
        videoCall          : '视频通话',
        videoConference    : '视频会议',
        message            : {
          mute              : '您被主持人禁言',
          unMute            : '您被主持人解除禁言',
          applying          : '您正在申请发言',
          cancelSpeakApply  : '您取消了发言申请',
          speakApplyRefused : '您已被主持人拒绝发言',
          speakApplyAllowed : '您已被主持人允许发言',
          toPresenter       : '您被设置为主持人',
          toVisitor         : '您被设置为访客',
          toSpeaker         : '您被设置为演讲者',
          cancelSpeaker     : '您被取消演讲者权限',
          toConferenceHall  : '您已被主持人移到会议大厅',
          allowToConference : '您已被主持人批准进入会议',
          kickFromMeeting   : '您被移出会议',
          joinMeeting       : '{target} 加入会议',
          enterHall         : '{target} 加入会议大厅',
          exitMeeting       : '{target} 离开会议',
        },
      },
      title : {
        calling       : '正在呼叫',
        connecting    : '正在呼叫 {target}',
        connected     : '正在与 {target} 进行通话',
        ringing       : '{target} 正在呼叫',
        disconnected  : '与 {target} 的通话已结束',
        callFinished  : '通话已结束',
        expired       : '当前通话已失效',
        with          : '与',
        communicating : '通话中',
        unknownUser   : '未知用户',
        audioSubject  : '{target} 的音频会议',
        videoSubject  : '{target} 的视频会议',
      },
      statistics : {
        send              : '发送',
        receive           : '接收',
        deviceType        : '终端类型',
        refreshDeviceInfo : '刷新通话统计',
        closeDeviceInfo   : '关闭通话统计',
        bitrate           : '带宽',
        ratio             : '分辨率',
        frameRate         : '帧率',
        codec             : '编解码',
        jitter            : '抖动',
        packetsLost       : '丢包数',
        packetsLostRate   : '丢包率',
        video             : '视频',
        audio             : '音频',
        screen            : '内容共享',
        excellent         : '极佳',
        good              : '良好',
        general           : '一般',
        poor              : '极差',
        network           : '网络质量',
        totalBitrate      : '总带宽',
        ip                : 'IP地址',
        protocolType      : '协议',
        message           : {
          fetchFailed : '加载失败',
        },
      },
      header : {
        conferenceLocked : '会议已锁定',
        safeConversation : '会议已加密',
        signal           : '网络质量',
      },
      controls : {
        turnOffCamera           : '关闭摄像头',
        turnOnCamera            : '打开摄像头',
        turnOffMicrophone       : '关闭麦克风',
        turnOnMicrophone        : '打开麦克风',
        raiseHangs              : '举手',
        cancelRaiseHangs        : '取消举手',
        screenShare             : '共享',
        screenSharing           : '正在共享',
        more                    : '更多',
        toAudio                 : '切换为语音入会',
        toAudioCall             : '切换为语音通话',
        changeToAudio           : '转语音通话',
        toAudioConference       : '切换为音频会议',
        plate                   : '拨号盘',
        exitConference          : '退出会议',
        terminateOrLeave        : '您要结束会议还是离开会议?',
        terminateConference     : '结束会议',
        cancel                  : '取消',
        ensureLeave             : '您确定要离开会议?',
        justLeaveConference     : '离开会议，会议继续进行',
        leaveConference         : '离开会议',
        hangUp                  : '挂断',
        dbClickToCallView       : '双击回到通话界面',
        dbClickToConferenceView : '双击回到视频会议界面',
      },
      invite : {
        copyConferenceInfo    : '复制会议信息',
        copySucceed           : '复制成功',
        inviteContact         : '邀请联系人',
        inviteOthers          : '邀请其他',
        protocol              : '协议',
        yealinkCloud          : '亿联云账号',
        address               : '地址',
        number                : '号码',
        inputIpOrUri          : '请输入IP地址或URI',
        inputCloudNumber      : '请输入云账号',
        inputRTMP             : '请输入RTMP地址',
        inputSFB              : '请输入SfB (Lync)账号',
        videoConferenceInvite : '邀请您参加视频会议',
        videoCallInvite       : '邀请您进行视频通话',
        audioCallInvite       : '邀请您参加语音通话',
        message               : {
          alreadyExist  : '该成员已在会议中',
          invited       : '已邀请',
          inviteSucceed : '邀请成功',
          inviteFailed  : '邀请失败,请重试',
        },
      },
      share : {
        title                  : '选择一个您想要共享的窗口或程序',
        shareAudio             : '共享电脑声音',
        preferVideoFluency     : '视频流畅度优先',
        preferVideoFluencyTips : '开启后可提升内容共享的视频流畅度，但会增加电脑的性能损耗和带宽',
        shareTime              : '共享时长',
        switchShare            : '切换共享',
        terminateShare         : '停止共享',
        message                : {
          sharingEnded : '由于共享的窗口被关闭，内容共享结束',
        },
      },
      member : {
        me                  : '我',
        presenter           : '主持人',
        visitor             : '访客',
        castViewer          : '广播方',
        presenterTitle      : '主持人（{count}）',
        visitorTitle        : '访客（{count}）',
        castViewerTitle     : '广播方（{count}）',
        alreadyInConference : '已入会',
        searchContact       : '搜索',
        openSearchFrame     : '打开搜索框',
        closeSearchFrame    : '关闭搜索框',
        muteAll             : '全员禁言',
        unMuteAll           : '解除全员禁言',
        conferenceHall      : '会议大厅',
        allowAll            : '全部允许',
        refuseAll           : '全部拒绝',
        raiseHangs          : '举手发言',
        otherInvite         : '第三方邀请',
        reInvite            : '重新邀请',
        ringing             : '呼叫中...',
        inviteFailed        : '邀请失败',
        inviteSucceed       : '邀请成功',
        isSharing           : '正在共享屏幕',
        deviceInfo          : '通话统计',
        toWaiting           : '设为等待',
        toVisitor           : '设为访客',
        toPresenter         : '设为主持人',
        toSpeaker           : '设为演讲者',
        cancelSpeaker       : '取消演讲者',
        kickFromMeeting     : '移出会议',
        allowSpeak          : '允许发言',
        allowConference     : '允许入会',
        refuseSpeak         : '拒绝发言',
        refuseConference    : '拒绝入会',
        allowOrRefuse       : '同意/拒绝',
      },
      chat : {
        all          : '全体',
        allUser      : '所有人',
        me           : '我',
        send         : '发送',
        sendTo       : '发给',
        inputMessage : '请输入您将要发送的消息',
        stranger     : '陌生人',
        privateChat  : '私聊',
      },
      lock : {
        unLockTips  : '会议解锁后，新的参会成员可以直接进入会议。',
        lockTips    : '会议锁定后，以下新的参会成员可直接进入会议，无需在会议大厅中等待',
        invitedUser : '受邀人员',
        presenter   : '主持人',
        all         : '组织内所有人',
        lock        : '锁定会议',
        unLock      : '解锁会议',
      },
      setting : {
        conference     : '会议',
        media          : '设备',
        layout         : '切换布局',
        conferenceTips : '入会和离开的提示',
        noDevice       : '无设备',
        camera         : '摄像头',
        microphone     : '麦克风',
        microphoneTest : '麦克风测试',
        speaker        : '扬声器',
        playAudio      : '播放测试音频',
      },
      exception : {
        video   : '当前摄像头异常，请检查后重试',
        audio   : '当前麦克风异常，请检查后重试',
        both    : '当前摄像头和麦克风异常，请检查后重试',
        network : '当前网络状况不佳，建议切换为语音通话',
      },
      tip : {
        notOnLine          : '对方可能暂时不在或设备静音，建议稍后再次尝试！',
        unstableNetwork    : '当前网络状况不佳，建议切换为语音通话。',
        willHangup         : '对方长时间未接听，请稍后重试！',
        answerInConference : '确定接通来电并离开当前会议吗？',
        callInConference   : '确定拨打电话并离开当前会议吗？',
        answerInCall       : '确定接通来电并挂断当前通话吗？',
        callInCall         : '确定拨打电话并挂断当前通话吗？',
        joinInCalling      : '确定加入会议并终止呼叫吗？',
        joinInCall         : '确定加入会议并挂断当前通话吗？',
        joinInConference   : '确定离开当前会议吗？',
        inviteMore         : '邀请更多人加入会议',
      },
      error : {
        server : '当前服务器无法访问',
      },
    },
    en : {
      main : {
        maximizeOrMinimize : 'Full Screen/Exit full screen',
        inviteMember       : 'Invite',
        lockConference     : 'Lock Meeting',
        memberList         : 'Participants',
        chat               : 'Chat',
        setting            : 'Meeting Settings',
        popSharing         : 'Open content sharing in new window',
        screenShare        : 'Content Sharing',
        localVideo         : 'Local Video',
        audioConference    : 'Audio Meeting',
        audioCall          : 'Audio Call',
        videoCall          : 'Video Call',
        videoConference    : 'Video Meeting',
        message            : {
          mute              : 'You have been muted by the moderator',
          unMute            : 'You have been unmuted by the moderator',
          applying          : 'You are applying to talk',
          cancelSpeakApply  : 'You cancelled the application to talk',
          speakApplyRefused : 'You have been refused to talk by the moderator',
          speakApplyAllowed : 'You have been allowed to talk by the moderator',
          toPresenter       : 'You have been set as moderator',
          toVisitor         : 'You have been set as guest',
          toSpeaker         : 'You have been set as lecturer',
          cancelSpeaker     : 'You have been cancelled as lecturer',
          toConferenceHall  : 'You have been moved to the lobby',
          allowToConference : 'You have beed admitted to meeting',
          kickFromMeeting   : 'You have been removed from the meeting',
          joinMeeting       : '{target} joins the meeting',
          enterHall         : '{target} enters the lobby',
          exitMeeting       : '{target} leaves the meeting',
        },
      },
      title : {
        calling       : 'Calling',
        connecting    : 'Calling {target}',
        connected     : 'Meeting with {target}',
        ringing       : 'Incoming call from {target}',
        disconnected  : 'Meeting with {target} ends',
        expired       : 'Current meeting is expired',
        with          : 'with',
        communicating : 'Meeting',
        unknownUser   : 'Unknown user',
        audioSubject  : "{target}'s audio meeting",
        videoSubject  : "{target}'s video meeting",
      },
      statistics : {
        send              : 'Sent             ',
        receive           : 'Received         ',
        deviceType        : 'Device   ',
        refreshDeviceInfo : 'Refresh Statistics',
        closeDeviceInfo   : 'Close Statistics',
        bitrate           : 'Bandwidth      ',
        ratio             : 'Resolution         ',
        frameRate         : 'Frame Rate       ',
        codec             : 'Codec            ',
        jitter            : 'Jitter           ',
        packetsLost       : 'Packets Lost      ',
        packetsLostRate   : 'Packets Lost Rate  ',
        video             : 'Video          ',
        audio             : 'Audio            ',
        screen            : 'Sharing       ',
        excellent         : 'Excellent        ',
        good              : 'Good             ',
        general           : 'Fair       ',
        poor              : 'Poor             ',
        network           : 'Network Quality       ',
        totalBitrate      : 'Bandwidth',
        ip                : 'IP Address            ',
        protocolType      : 'Protocol Type',
        message           : {
          fetchFailed : 'Loading Failed',
        },
      },
      header : {
        conferenceLocked : 'Meeting is locked',
        safeConversation : 'Meeting is encrypted',
        signal           : 'Network quality',
      },
      controls : {
        turnOffCamera       : 'Turn off camera',
        turnOnCamera        : 'Turn on camera',
        turnOffMicrophone   : 'Turn off microphone',
        turnOnMicrophone    : 'Turn on microphone',
        raiseHangs          : 'Raise Hand',
        cancelRaiseHangs    : 'Lower Hand',
        screenShare         : 'Share',
        screenSharing       : 'Sharing           ',
        more                : 'More',
        toAudio             : 'Switch to audio call',
        toAudioCall         : 'Switch to audio call',
        changeToAudio       : 'Switch to audio call',
        plate               : 'Keyboard',
        exitConference      : 'Leave Meeting',
        terminateOrLeave    : 'End Meeting or Leave Meeting?',
        terminateConference : 'End Meeting  ',
        cancel              : 'Cancel',
        ensureLeave         : 'Are you sure to leave meeting?',
        justLeaveConference : 'Leave and meeting continues',
        leaveConference     : 'Leave Meeting',
        hangUp              : 'Hang up',
      },
      invite : {
        copyConferenceInfo : 'Copy Invitation',
        copySucceed        : 'Copied',
        inviteContact      : 'Invite by Contacts',
        inviteOthers       : 'Invite Others',
        protocol           : 'Endpoint   ',
        yealinkCloud       : 'Yealink Cloud Account',
        address            : 'Address    ',
        number             : 'Account',
        inputIpOrUri       : 'Please enter IP address or URI',
        inputCloudNumber   : 'Please enter cloud account',
        inputRTMP          : 'Please enter RTMP address',
        inputSFB           : 'Please enter SfB (Lync) account',
        message            : {
          alreadyExist  : 'This participant is already in the meeting',
          invited       : 'Invited',
          inviteSucceed : 'Invited successfully',
          inviteFailed  : 'Invite failed, please try again',
        },
      },
      share : {
        title                  : 'Select a window or an application that you want to share',
        shareAudio             : 'Share computer sound',
        preferVideoFluency     : 'Optimize content sharing fluency',
        preferVideoFluencyTips : 'Content sharing fluency will be optimized, but it will consume more resources and bandwidth',
        message                : {
          sharingEnded : 'Content sharing ends because the shared window is closed',
        },
      },
      member : {
        me                  : 'Me',
        presenter           : 'Moderator',
        visitor             : 'Guest',
        castViewer          : 'Viewer',
        presenterTitle      : 'Moderator（{count}）',
        visitorTitle        : 'Guest（{count}）',
        castViewerTitle     : 'Viewer（{count}）',
        alreadyInConference : 'Participants',
        searchContact       : 'Search',
        openSearchFrame     : 'Search',
        closeSearchFrame    : 'Search',
        muteAll             : 'Mute All',
        unMuteAll           : 'Unmute All',
        conferenceHall      : 'Lobby',
        allowAll            : 'Allow All',
        refuseAll           : 'Refuse All',
        raiseHangs          : 'Raising Hands',
        otherInvite         : 'Invitation History',
        reInvite            : 'Invite',
        ringing             : 'Inviting',
        inviteFailed        : 'Failed',
        inviteSucceed       : 'Successful',
        isSharing           : 'Sharing           ',
        deviceInfo          : 'Call Statistics',
        toWaiting           : 'Put on hold',
        toVisitor           : 'Set as guest',
        toPresenter         : 'Set as moderator',
        toSpeaker           : 'Set as lecturer',
        cancelSpeaker       : 'Cancel the lecturer',
        kickFromMeeting     : 'Remove',
        allowSpeak          : 'Allow to talk',
        allowConference     : 'Allow to join',
        refuseSpeak         : 'Refuse to talk',
        refuseConference    : 'Refuse to join',
        allowOrRefuse       : 'Allow/Refuse',
      },
      chat : {
        all          : 'All',
        allUser      : 'All',
        me           : 'me',
        send         : 'Send             ',
        sendTo       : 'Send to',
        inputMessage : 'Type message here',
        stranger     : 'Stranger',
        privateChat  : 'Private',
      },
      lock : {
        unLockTips  : 'New participants can directly join the meeting once it is unlocked.',
        lockTips    : 'The following new participants can directly join the meeting once it is locked, everyone else has to wait until admitted： ',
        invitedUser : 'Invited participants',
        presenter   : 'Moderator',
        all         : 'Anyone from enterprise contacts',
        lock        : 'Lock Meeting',
        unLock      : 'Unlock Meeting',
      },
      setting : {
        conference     : 'Meeting',
        media          : 'Devices',
        layout         : 'Switch layout',
        conferenceTips : 'Display join or leave meeting reminders',
        noDevice       : 'No device detected',
        camera         : 'Camera',
        microphone     : 'Microphone',
        microphoneTest : 'Test Mic',
        speaker        : 'Speaker',
        playAudio      : 'Test Speaker',
      },
      exception : {
        video   : 'Camera is abnormal, please check and try again',
        audio   : 'Microphone is abnormal, please check and try again',
        both    : 'Camera and Microphone are abnormal, please check and try again',
        network : 'Poor network is detected, switching to audio call is recommended',
      },
      tip : {
        notOnLine          : 'Other user may be busy, please try again later!',
        unstableNetwork    : 'Poor network is detected, switching to audio all is recommended',
        willHangup         : 'Other is not answering, please try again later!',
        answerInConference : 'Are you sure to accept incoming call and leave current meeting?',
        callInConference   : 'Are you sure to dial out and leave current meeting?',
        answerInCall       : 'Are you sure to accept incoming call and end current call?',
        callInCall         : 'Are you sure to dial out and end current call?',
        joinInCalling      : 'Are you sure to join the meeting and terminate the dial out?',
        joinInCall         : 'Are you sure to join the meeting and end current call?',
        joinInConference   : 'Are you sure to leave current meeting?',
        inviteMore         : 'Invite more particpants',
      },
      error : {
        server : 'Server is currently not accessible',
      },
    },
  },
};
