const info = {
  authoption: {
    walkIn: "为客户",
    appointments: "约会"
  },
  locationsetup: {
    intro: {
      welcome: "欢迎来到\n",
      message: "我们会将最近的客户带到您家门口\n非常快",
      begin: "让我们填写您的业务信息"
    },
    type: {
      question: "你是做什么生意的 ?",
      buttonHeaders: {
        tapChoose: "点击\n选择"
      }
    },
    name: {
      "hair salon": "输入美发店名称:",
      "nail salon": "输入美甲店名称:",
      restaurant: "输入餐厅名称:",
      store: "输入店铺名称:"
    },
    location: {
      if: {
        "hair salon": "如果你现在在美发沙龙,",
        "nail salon": "如果你现在在美甲沙龙,",
        restaurant: "如果你现在在餐厅,",
        store: "如果你现在在店里,"
      },
      addressHeader: "输入公司地址",
      address: {
        addressOne: "输入地址#1:",
        addressTwo: "输入地址 #2（可选):",
        city: "进入城市:",
        province: "输入省份:",
        postalCode: "输入邮政编码:"
      },
      sameOpen: {
        some: "您的业务是否同时营业",
        all: "您的企业每天都在同一时间营业吗"
      }
    },
    phonenumber: "输入您的公司电话号码:",
    photo: {
      "hair salon": "给你的美发沙龙拍照",
      "nail salon": "为您的美甲沙龙拍照",
      restaurant: "为您的餐厅拍照",
      store: "为您的商店拍照"
    },
    openDays: {
      header: "你们哪几天开门 ?",
      time: { Sunday: "设置周日的开闭时间", Monday: "设置星期一的开闭时间", Tuesday: "设置周二的开闭时间", Wednesday: "设置周三的开市和闭市时间", Thursday: "设置周四的开市和闭市时间", Friday: "设置周五的开市和闭市时间", Saturday: "设置周六的开闭时间" },
      sameTime: {
        all: "设置每天的开闭时间",
        some: "设置打开和关闭时间"
      }
    }
  },
  register: {
    header: "让客户看到",
    name: "输入你的名字:",
    photo: "拍一张你的脸（可选)",
    workingDays: {
      header: "你几天工作 ?",
      hour: "把你的工作时间定在星期{day}",
      sameHours: {
        header: "你的工作时间是一样的吗",
        some: "设置你的工作时间",
        all: "设定每天的工作时间"
      }
    },
    nameErrormsg: "请输入您喜欢的名字",
    workingDaysErrormsg: "请选择您工作的日子"
  },
  main: {
    navs: {
      myAppointments: "我的约会",
      allAppointments: "所有约会",
      cartOrderers: "购物车订购者",
      tableBills: "表账单",
      tableOrders: "表顺序"
    },
    list: {
      header: "你会在这里看到你的约会",
      clientName: "客户名称",
      staff: "员工姓名",
      changeTime: "与客户更改时间"
    },
    chart: {
      stillBusy: "还在忙",
      booked: "预订",
      walkIn: "步入",
      editTime: "点击时间重新预订",
      reschedule: {
        all: "重新安排所有",
        some: "重新安排一些",
        finishSelect: "Finish selecting",
      },
      rebook: "点击任何其他时间重新预订"
    },
    cartOrderers: {
      header: "您将在此处查看所有订单",
      customerName: "顾客:",
      orderNumber: "命令 #:",
      seeOrders: "查看订单"
    },
    tableOrders: {
      header: "还没有餐桌订单",
      tableHeader: "桌子 #",
      seeBill: "见比尔",
      seeOrders: "查看订单",
      showCode: "显示代码",
    },
    bottomNavs: {
      changeInfo: "更改信息",
      hours: "小时"
    },
    hidden: {
      scheduleOption: {
        rebookHeader: "点击任何其他时间重新预订",
        selectHeader: "点按您要更改的时间表",
        remove: {
          header: "为什么取消？(可选的)",
          reason: "写下你的理由"
        },
        select: {
          pushTypeHeader: "向前或向后重新安排约会 ?",
          pushByHeader: { forward: "重新安排约会", backward: "向后重新安排约会" },
          timeFactorHeader: "输入多少 ",
          pushTypes: {
            backward: "向后推",
            forward: "向前推进"
          },
          pushBys: {
            days: "天",
            hours: "小时",
            minutes: "分钟"
          }
        },
        rescheduleNow: "立即重新安排",
        selectFactor: "选择多少{factor}"
      },
      showInfo: {
        businessHeader: "营业时间",
        staffHeader: "全体员工",
        staffName: "员工姓名:"
      },
      showMoreoptions: {
        changeMenu: "更改菜单",
        changeStaffinfo: "更改员工信息",
        changeBusinessinformation: "更改姓名/电话号码",
        changeBusinesslocation: "更换地址",
        changeBusinesslogo: "更改照片",
        changeBusinesshours: "更改营业时间",
        moreBusinesses: "您的企业",
        walkIn: "客户上门",
        changeLanguage: "改变语言",
        editTables: "编辑表格",
        getAppointmentsby: {
          header: "通过以下方式获得约会",
          both: "业主和员工",
          owner: "仅限所有者"
        },
        useVoice: {
          header: "使用语音",
          yes: "是的",
          no: "不"
        }
      },
      workingDays: {
        header: "新造型师在哪几天上班 ?",
        hour: "设置新员工的工作时间",
        sameHour: "设置新员工的工作时间"
      },
      alert: {
        schedulingConflict: "存在调度冲突",
        unfinishedOrders: "有一些未完成的订单",
        noOrders: "没有订单"
      },
      tables: {
        table: "桌子 #",
        showBarcode: "显示条码",
        hidden: {
          add: {
            tableNumber: "输入表 #:",
          },
          remove: {
            header: "删除表# #"
          },
          qr: {
            header: "桌子 #"
          }
        }
      }
    },
    editInfo: {
      staff: {
        header: "编辑五线谱",
        add: "添加新员工",
        change: {
          self: "更改您的信息",
          other: "更改营业时间"
        }
      }
    },
    editingInfo: {
      header: {
        edit: "编辑员工信息",
        add: "添加员工信息"
      },
      changeCellnumber: "更改您的手机号码",
      changeName: "改变你的名字",
      changeProfile: "更改您的照片",
      changePassword: "更改您的密码",
      changeWorking: "更改您的工作日和时间"
    },
    editingLanguage: {
      english: "英语",
      french: "法语",
      vietnamese: "越南语",
      chinese: "中国人"
    },
    editingInformation: {
      name: "输入企业名称",
      phonenumber: "输入企业电话号码"
    },
    editingLocation: "输入公司地址",
    editingLogo: "商家合影",
    editingHours: {
      header: "修改营业时间",
      openHeader: { Sunday: "周日营业", Monday: "周一开", Tuesday: "周二开", Wednesday: "周三开放", Thursday: "周四开放", Friday: "周五开放", Saturday: "周六开" },
      changeToNotOpen: "改为不开放",
      changeToOpen: "更改为打开",
      notOpen: "周{day}不营业"
    },
    editingWorkingHours: "编辑您的工作时间",
    deleteStaff: {
      header: "工作 {numDays} 天",
      delete: "移除员工"
    }
  },
  list: {
    add: "添加商家"
  },
  orders: {
    header: "订单",
    setWaittime: "设置等待时间",
    customerNote: "客户备注:",

    hidden: {
      noOrders: {
        header: "订单已经送达"
      },
      noWaittime: {
        header: "请告诉客户此订单的等待时间",
      },
      waitTime: {
        header: "还要等多久 ?",
        min: "分钟"
      }
    }
  },
  booktime: {
    header: "请求不同的时间",
    pickStaff: "选择员工（可选)",
    pickAnotherStaff: "选择不同的员工（可选)",
    pickToday: "今天选",
    tapDifferentDate: "点按下方的其他日期",
    current: "当前的:",
    tapDifferentTime: "点按下方的其他时间",

    hidden: {
      confirm: {
        client: "客户",
        service: "服务",
        change: "将时间更改为",
        appointmentChanged: "预约已更改",
        leaveNote: "如果需要，请留言"
      }
    }
  },
  tables: {
    addTable: "添加表",
    table: "桌子 #",
    showBarcode: "显示条码",
    hidden: {
      add: {
        tableNumber: "输入表 #:",
      },
      remove: {
        header: "删除表# #"
      },
      qr: {
        header: "桌子 #"
      }
    }
  },
    
  // components
  menu: {
    header: {
      edit: "编辑菜单",
      view: "查看菜单"
    },
    photos: {
      header: "相片",
      upload: "拍摄菜单照片",
      easier: "对你来说更容易"
    },
    lists: {
      header: "列表",
      easier: {
        salon: "客户预订更方便",
        restaurant: "客户下单更方便"
      }
    },
    bottomNavs: {
      back: {
        salon: "回到约会",
        restaurant: "返回订单"
      }
    },
    hidden: {
      uploadMenu: {
        takePhoto: "拍张照片"
      },
      menuPhotooption: {
        header: "您确定要删除此菜单吗 ?"
      }
    }
  },
  addmenu: {
    header: {
      edit: "编辑菜单",
      add: "添加菜单"
    },
    name: "这个菜单调用是什么 ?",
    photo: "给菜单拍照（可选)",
  },
  addservice: {
    header: {
      edit: "编辑服务",
      add: "添加服务"
    },
    name: "这是什么服务电话 ?",
    photo: "为这项服务拍照（可选)",
    price: "输入此服务的价格"
  },
  addproduct: {
    header: {
      edit: "编辑产品",
      add: "添加新产品"
    },
    name: "输入此产品的名称",
    photo: "为该产品拍照（可选)",
    options: {
      addamount: "添加百分比或金额选项",
      addoption: "添加特定选项"
    },
    price: {
      size: "添加尺寸",
      sizes: "输入价格",
    }
  },
  addmeal: {
    header: {
      edit: "编辑餐点",
      add: "添加新餐点"
    },
    name: "输入这顿饭的名字",
    photo: "给这顿饭拍照（可选)",
    price: {
      size: "添加尺寸",
      sizes: "输入价格",
      quantity: "添加数量",
      percent: "添加 %"
    }
  },

  // global
  "Hair salon": "美发沙龙",
  "Nail salon": "美甲屋",
  Store: "店铺",
  Restaurant: "餐厅",

  "hair salon": "美发沙龙",
  "nail salon": "美甲屋",
  store: "店铺",
  restaurant: "餐厅",

  days: { Sunday: "天", Monday: "一", Tuesday: "二", Wednesday: "三", Thursday: "四", Friday: "五", Saturday: "六" },
  months: { January: "一月", February: "二月", March: "行进", April: "四月", May: "可能", June: "六月", July: "七月", August: "八月", September: "九月", October: "十月", November: "十一月", December: "十二月" },

  headers: {
    locatedHeader: {
      "hair salon": "你的美发沙龙在",
      "nail salon": "你的美甲沙龙在",
      restaurant: "您的餐厅位于",
      store: "您的商店位于"
    },
    todayAt: "今天在",
    tomorrowAt: "明天在"
  },

  buttons: {
    back: "后退",
    next: "下一个",
    cancel: "取消",
    skip: "跳过",
    add: "添加",
    edit: "编辑",
    rebook: "锐步",
    update: "更新",
    begin: "开始",
    takePhoto: "拍这张照片",
    retakePhoto: "重拍照片",
    choosePhoto: "从手机中选择",
    markLocation: "标记您的位置",
    enterAddress: "输入地址",
    editAddress: "编辑地址",
    done: "完毕",
    changeDays: "更改日期",
    yes: "是的",
    no: "不",
    close: "关",
    addmenu: "添加菜单",
    addmeal: "加餐",
    additem: "添加产品",
    addservice: "添加服务",
    delete: "删除",
    change: "改变",
    see: "看",
    random: "随机选择",
    forward: "向前",
    backward: "落后"
  },

  disableHeader: "该应用程序有更新\n请稍候\n或点击关闭"
}

export const chinese = info
