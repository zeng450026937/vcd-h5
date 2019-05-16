// 最新导入时间为 2019-5-15 09:01:17 
module.exports = {
  name : 'common',
  lang : {
    zh : {
      controls : {
        ensure        : '确定',
        cancel        : '取消',
        close         : '关闭',
        enlarge       : '放大',
        shrink        : '缩小',
        expand        : '展开',
        hide          : '隐藏',
        maximize      : '最大化',
        minimize      : '最小化',
        allow         : '同意',
        refuse        : '拒绝',
        allowOrRefuse : '同意/拒绝',
      },
      message : {
        passwordError                : '登录密码错误',
        accountError                 : '账号错误',
        hasEnd                       : '当前会议已结束！',
        unallocatedNumber            : '会议号码错误，请重新输入！',
        missBookInfoByID             : '会议号码错误，请重新输入！',
        invalidPIN                   : '密码错误，请重新输入！',
        unavailableCall              : '对方正忙，请稍后再拨',
        unavailableConference        : '当前会议尚未开始，请稍后再试！',
        busy                         : '对方正忙，请稍后再拨', // 旧版vcd
        locked                       : '该会议已被锁定，无法加入！',
        noMpsAvailable               : '会议人数已达上限，请稍后再试！',
        userCountExceed              : '会议人数已达上限，请稍后再试！',
        conferenceLicenseAmountLimit : '会议 license 数量限制',
        numberResourceLimit          : '无法找到该账号',
        serverAddressError           : '服务器地址错误',
        userNotRegister              : '用户未注册',
        callNotFound                 : '您拨打的号码无法接通，请稍后再拨',
        canceled                     : '当前通话已取消',
        accountNotEmpty              : '账号不能为空',
        accountTooLong               : '无法输入超过128个字符',
        passwordNotEmpty             : '密码不能为空',
        passwordTooLong              : '无法输入超过128个字符',
        serverNotEmpty               : '服务器地址不能为空',
        serverFormatError            : '服务器地址格式错误',
      },
    },
    en : {
      controls : {
        ensure        : 'OK',
        cancel        : 'Cancel',
        close         : 'Close',
        enlarge       : 'Zoom In',
        shrink        : 'Zoom Out',
        expand        : 'Expand',
        hide          : 'Collapse',
        maximize      : 'Maximize',
        minimize      : 'Minimize',
        allow         : 'Allow',
        refuse        : 'Refuse',
        allowOrRefuse : 'Allow/Refuse',
      },
      message : {
        passwordError         : 'Incorrect Password',
        accountError          : 'Incorrect Account',
        unavailableCall       : 'The call is unavailable',
        unavailableConference : 'The conference is unavailable',
      },
    },
  },
};
