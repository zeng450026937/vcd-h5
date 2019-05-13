// 最新导入时间为 2019-5-13 19:32:48 
module.exports = {
  name : 'contact',
  lang : {
    zh : {
      common : {
        add    : '添加联系人',
        more   : '更多',
        person : '联系人',
      },
      local : {
        describe : '本地联系人',
        title    : {
          addAs     : '添加为本地联系人',
          add       : '添加本地联系人',
          edit      : '编辑',
          noContact : '暂未添加本地联系人',
        },
      },
      frequent : {
        noFrequent       : '暂未添加常用联系人',
        addFrequentGroup : '添加常用联系人分组',
        addGroup         : '添加分组',
        editGroup        : '编辑分组',
        deleteGroup      : '删除分组',
        moveContact      : '移动该联系人至',
        noOtherGroup     : '暂无其他分组',
        removeContact    : '移除',
      },
      corporate : {
        describe : '企业联系人',
      },
      label : {
        name             : '姓名',
        account          : '账号',
        phone            : '手机',
        email            : '邮箱',
        number           : '账号',
        group            : '分组',
        department       : '部门',
        organizer        : '组织者',
        unknown          : '未知联系人',
        unknownInfo      : '暂时无法获取当前联系人的个性签名信息。',
        unknownOrganizer : '暂时无法获取当前会议的组织者。',
        unknownDevice    : '暂时无法获取当前设备绑定的会议室。',
        unknownVMR       : '暂时无法获取当前虚拟会议模式。',
        videoConference  : '视频会议',
        conferenceId     : '会议号码',
        serviceNumber    : '亿联云账号',
        noContact        : '暂无参会成员',
      },
      placeholder : {
        inputName    : '请输入姓名',
        inputAccount : '请输入账号',
        inputPhone   : '请输入手机号',
        inputEmail   : '请输入邮箱',
        search       : '搜索联系人',
      },
      message : {
        success             : '添加成功！',
        inputName           : '请输入用户名！',
        inputAccount        : '请输入账号！',
        nameNoLess64        : '用户名不能超过64位！',
        accountNoLess20     : '账号不能超过20位！',
        phoneNoMore11       : '手机号不能超过11位!',
        wrongPhoneNumber    : '请输入有效的手机号！',
        emailNoMore254      : '邮箱不能超过254位!',
        wrongEmail          : '请输入有效的邮箱！',
        addContact          : '您最多只能添加{number}个本地联系人',
        confirmDelete       : '确认删除？',
        deleteSuccess       : '删除成功',
        deleteFailed        : '删除失败，请重试!',
        confirmDeleteGroup  : '确认删除？',
        moveSuccess         : '移动成功',
        moveFailed          : '移动失败',
        sureToDelFreContact : '确认删除?',
      },
      status : {
        cancel : '已取消',
      },
      button : {
        confirm       : '确定',
        cancel        : '取消',
        editContact   : '编辑',
        deleteContact : '删除',
        back          : '返回',
        meetingNow    : '新的会议',
        pullUp        : '收起',
        more          : '更多',
      },
      titles : {
        search    : '搜索结果',
        callGroup : '发起群呼',
      },
      tree : {
        clearAll     : '全部清空',
        del          : '删除',
        choosePerson : '请选择参会成员',
        loadFailed   : '加载失败!',
        search       : '搜索',
      },
      modal : {
        placeholder : {
          enterGroupName : '请输入分组名称',
        },
        title : {
          addGroup         : '添加分组',
          updateGroup      : '编辑分组',
          groupNoMore30    : '分组名字长度不能超过30个字',
          groupNameNoEmpty : '分组名称不能为空',
        },
        message : {
          updateSuccess : '编辑成功!',
          addSuccess    : '添加成功!',
          sameGroupName : '该分组已存在！',
        },
      },
    },
    en : {
      common : {
        add    : 'Add new contact',
        more   : 'More',
        person : 'contacts',
      },
      local : {
        describe : 'Local Contacts',
        title    : {
          addAs     : 'Add to local contacts',
          add       : 'Add local contact',
          edit      : 'Edit',
          noContact : 'No local contacts yet',
        },
      },
      frequent : {
        noFrequent       : 'No frequent contacts yet',
        addFrequentGroup : 'Add new frequent contacts group',
        addGroup         : 'Add new group',
        editGroup        : 'Edit',
        deleteGroup      : 'Delete',
        moveContact      : 'Move to ',
        noOtherGroup     : 'No other groups yet',
        removeContact    : 'Delete',
      },
      corporate : {
        describe : 'Enterprise Directory',
      },
      label : {
        name             : 'Name',
        account          : 'Account',
        phone            : 'Phone',
        email            : 'Email',
        number           : 'Account',
        group            : 'Group',
        department       : 'Dept.',
        organizer        : 'Organizer',
        unknown          : 'Unknown',
        unknownInfo      : 'Personal note is not available ',
        unknownOrganizer : "Organizer's info is not available",
        unknownDevice    : "Bound meeting room's info is not available",
        unknownVMR       : 'Type of meeting mode is not available',
        videoConference  : 'Video Meeting',
        conferenceId     : 'Meeting ID',
        serviceNumber    : 'Yealink Cloud Account',
        noContact        : 'No participants yet',
      },
      placeholder : {
        inputName    : 'Please enter the name',
        inputAccount : 'Please enter the account',
        inputPhone   : 'Please enter the phone number',
        inputEmail   : 'Please enther the email',
        search       : 'Search',
      },
      message : {
        success             : 'Added successfully!',
        inputName           : 'Please enter the name!',
        inputAccount        : 'Please enter the account!',
        nameNoLess64        : 'Name cannnot be more than 64 characters!',
        accountNoLess20     : 'Account cannot be more than 20 characters',
        phoneNoMore11       : 'Phone number cannot be more than 11 digits!',
        wrongPhoneNumber    : 'Please enter valid phone number!',
        emailNoMore254      : 'Email address cannot be more than 254 characters!',
        wrongEmail          : 'Please enter valid email address!',
        addContact          : 'You can only add up to {number} local contacts',
        confirmDelete       : 'Are you sure to delete？',
        deleteSuccess       : 'Deleted successfully',
        deleteFailed        : 'Delete failed, please try again',
        confirmDeleteGroup  : 'Are you sure to delete?',
        moveSuccess         : 'Moved successfully',
        moveFailed          : 'Move failed',
        sureToDelFreContact : 'Are you sure to delete?',
      },
      status : {
        cancel : 'Cancelled',
      },
      button : {
        confirm       : 'Ok',
        cancel        : 'cancel ',
        editContact   : 'Edit',
        deleteContact : 'Delete',
        back          : 'Back',
        meetingNow    : 'New Meeting',
        pullUp        : 'Hide',
        more          : 'More',
      },
      titles : {
        search    : 'Search Result',
        callGroup : 'Invite to meeting',
      },
      tree : {
        clearAll     : 'Clear all',
        del          : 'Delete',
        choosePerson : 'Please select participants',
        loadFailed   : 'Loading failed!',
        search       : 'Search  ',
      },
      modal : {
        placeholder : {
          enterGroupName : 'Please enter group name',
        },
        title : {
          addGroup         : 'Add new group',
          updateGroup      : 'Edit',
          groupNoMore30    : 'Group name cannot be more than 30 characters.',
          groupNameNoEmpty : 'Group name is required',
        },
        message : {
          updateSuccess : 'Edited successfully!',
          addSuccess    : 'Added successfully!',
          sameGroupName : 'Group name already exists!',
        },
      },
    },
  },
};
