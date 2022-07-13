const info = {
  authoption: {
    walkIn: "Cho khách hàng",
    appointments: "Các cuộc hẹn"
  },
  locationsetup: {
    intro: {
      welcome: "Chào mừng bạn đến\n",
      message: "Chúng tôi sẽ đưa khách hàng gần nhất đến cửa nhà bạn\nRẤT NHANH CHÓNG",
      letsGo: "Hãy điền thông tin doanh nghiệp của bạn"
    },
    type: {
      question: "Bạn đang kinh doanh gì ?",
      buttonHeaders: {
        tapChoose: "Nhấn\nđể chọn"
      }
    },
    name: {
      "hair salon": "Nhập tên tiệm làm tóc:",
      "nail salon": "Nhập tên tiệm làm móng:",
      restaurant: "Nhập tên nhà hàng:",
      store: "Nhập tên cửa hàng:"
    },
    location: {
      if: {
        "hair salon": "nếu bạn đang ở tiệm làm tóc ngay bây giờ,",
        "nail salon": "nếu bạn đang ở tiệm làm móng ngay bây giờ,",
        restaurant: "nếu bạn đang ở nhà hàng ngay bây giờ,",
        store: "nếu bạn đang ở cửa hàng ngay bây giờ,"
      },
      addressHeader: {
        "hair salon": "Nhập địa chỉ tiệm làm tóc",
        "nail salon": "Nhập địa chỉ tiệm làm móng",
        restaurant: "Nhập địa chỉ nhà hàng",
        store: "Nhập địa chỉ cửa hàng"
      },
      address: {
        addressOne: "Nhập địa chỉ #1:",
        addressTwo: "Nhập địa chỉ #2 (Tùy chọn):",
        city: "Nhập vào thành phố:",
        province: "Nhập tỉnh:",
        postalCode: "Nhập mã bưu điện:"
      },
      sameOpen: {
        "hair salon": "Tiệm cắt tóc có mở cùng lúc không",
        "nail salon": "Tiệm làm móng có mở cùng lúc không",
        restaurant: "Nhà hàng có mở cửa cùng giờ không",
        store: "Cửa hàng có mở cùng thời gian không"
      }
    },
    phonenumber: {
      "hair salon": "Nhập số điện thoại của tiệm làm tóc:",
      "nail salon": "Nhập số điện thoại của tiệm làm móng:",
      restaurant: "Nhập số điện thoại của nhà hàng:",
      store: "Nhập số điện thoại của cửa hàng:"
    },
    photo: {
      "hair salon": "Chụp ảnh tiệm làm tóc của bạn",
      "nail salon": "Chụp ảnh tiệm nail của bạn",
      restaurant: "Chụp ảnh nhà hàng của bạn",
      store: "Chụp ảnh cửa hàng của bạn"
    },
    openDays: {
      header: "Bạn mở cửa vào những ngày nào ?",
      time: "Đặt thời gian mở và đóng cửa cho {day}",
      sameTime: "Đặt thời gian mở và đóng cửa cho"
    }
  },
  register: {
    header: "cho khách hàng xem",
    name: "Điền tên của bạn:",
    photo: "Chụp ảnh khuôn mặt của bạn (Tùy chọn)",
    workingDays: {
      header: "Những ngày nào thì bạn làm việc ?",
      hour: "Đặt thời gian làm việc của bạn cho {day}"
    },
    nameErrormsg: "Vui lòng cung cấp một cái tên bạn thích",
    workingDaysErrormsg: "Vui lòng chọn ngày bạn làm việc"
  },
  main: {
    navs: {
      myAppointments: "Cuộc hẹn\ncủa tôi",
      allAppointments: "Tất cả các\ncuộc hẹn",
      cartOrderers: "Người đặt hàng xe"
    },
    list: {
      header: "Bạn sẽ thấy các cuộc hẹn của mình ở đây",
      clientName: "Tên khách hàng",
      staff: "Nhân Viên",
      changeTime: "Thay đổi thời\ngian với khách hàng"
    },
    chart: {
      stillBusy: "vẫn bận",
      booked: "đã đặt trước",
      editTime: "Nhấn vào thời gian để đăng ký lại",
      reschedule: {
        all: "Lên lịch lại tất cả",
        some: "Lên lịch lại một số",
        finishSelect: "Hoàn thành chọn",
      },
      rebook: "Tap any schedule to rebook"
    },
    cartOrderers: {
      header: "Bạn sẽ thấy tất cả các đơn đặt hàng tại đây",
      customerName: "khách hàng:",
      orderNumber: "Số đơn hàng:",
      seeOrders: "Xem đơn đặt hàng"
    },
    bottomNavs: {
      changeInfo: "Thay đổi\nthông tin",
      hours: "Xem giờ",
    },
    hidden: {
      scheduleOption: {
        rebookHeader: "Nhấn vào bất kỳ lúc nào khác để đăng ký lại",
        selectHeader: "Nhấn vào lịch bạn muốn đặt lại",
        remove: {
          header: "Tại sao lại hủy bỏ ? (Không bắt buộc)",
          reason: "Viết lý do"
        },
        select: {
          pushTypeHeader: "Lên lịch lại các cuộc hẹn về phía trước hoặc phía sau ?",
          pushByHeader: {
            forward: "Các cuộc hẹn đã lên lịch lại trước",
            backward: "Các cuộc hẹn đã lên lịch lùi lại trước"
          },
          timeFactorHeader: "Nhập bao nhiêu ",
          pushTypes: {
            backward: "Đẩy lùi",
            forward: "Đẩy về phía trước"
          },
          pushBys: {
            days: "Ngày",
            hours: "Giờ",
            minutes: "Phút"
          }
        },
        rescheduleNow: "Lên lịch lại ngay",
        selectFactor: "Chọn bao nhiêu {factor}"
      },
      showInfo: {
        businessHeader: "Giờ kinh doanh",
        staffHeader: "Tất cả nhân viên",
        staffName: "Tên nhân viên:"
      },
      showMoreoptions: {
        changeMenu: "Thay đổi menu",
        changeStaffinfo: "Thay đổi thông tin nhân viên",
        changeBusinessinfo: "Thay đổi thông tin kinh doanh",
        changeBusinesshours: "Thay đổi Giờ làm việc",
        moreBusinesses: "Doanh nghiệp của bạn",
        walkIn: "Khách hàng bước vào",
        changeLanguage: "Thay đổi ngôn ngữ",
        getAppointmentsby: {
          header: "Nhận cuộc hẹn trước",
          staff: "Nhân Viên",
          owner: "Người sở hữu"
        },
        useVoice: {
          header: "Sử dụng giọng nói",
          yes: "Đúng",
          no: "Không"
        }
      },
      workingDays: {
        header: "Nhân viên mới làm việc vào những ngày nào?",
        hour: "Đặt thời gian làm việc của nhân viên mới",
        sameHour: "Đặt thời gian làm việc của nhân viên mới cho"
      },
      alert: {
        header: "Có xung đột về lịch trình"
      },
      languages: {
        english: "Tiếng Anh",
        french: "người Pháp",
        vietnamese: "Tiếng Việt",
        chinese: "người Trung Quốc"
      }
    },
    editInfo: {
      staff: {
        header: "Chỉnh sửa nhân viên",
        add: "Thêm một nhân viên mới",
        change: {
          self: "Thay đổi thông tin của bạn",
          other: "Thay đổi giờ"
        }
      }
    },
    editingInfo: {
      header: {
        edit: "Chỉnh sửa thông tin của nhân viên",
        add: "Thêm thông tin của nhân viên"
      },
      changeCellnumber: "Thay đổi số ô",
      changeName: "Đổi tên bạn",
      changeProfile: "Thay đổi hồ sơ của bạn",
      changePassword: "Thay đổi mật khẩu của bạn",
      changeWorking: "Thay đổi ngày và giờ làm việc của bạn"
    },
    editingAddress: {
      name: "Tên doanh nghiệp",
      phoneNumber: "Số điện thoại doanh nghiệp",
      addressOne: "Địa chỉ 1",
      addressTwo: "Địa chỉ # 2 (Tùy chọn)",
      city: "Thành phố",
      Province: "Địa bàn tỉnh",
      postalCode: "mã bưu điện"
    },
    editingHours: {
      header: "Chỉnh sửa giờ làm việc",
      openHeader: "Mở cửa vào {day}",
      changeToNotOpen: "Thay đổi thành không mở",
      changeToOpen: "Thay đổi để mở",
      notOpen: "Không mở cửa vào {day}"
    },
    editingWorkingHours: "Chỉnh sửa thời gian làm việc của bạn",
    deleteStaff: {
      header: "Làm việc {numDays} ngày",
      delete: "Xóa nhân viên"
    }
  },
  list: {
    add: "Thêm một doanh nghiệp"
  },
  orders: {
    header: "Đơn hàng",
    setWaittime: "đặt thời gian chờ",
    customerNote: "Ghi chú của khách hàng:",

    hidden: {
      noOrders: {
        header: "Đơn hàng đã được giao"
      },
      noWaittime: {
        header: "Vui lòng cho khách hàng biết thời gian chờ đợi"
      },
      waitTime: {
        header: "Chờ đợi bao lâu?",
        min: "phút"
      }
    }
  },
  booktime: {
    header: "Yêu cầu thời gian khác",
    pickStaff: "Chọn một nhân viên (Tùy chọn)",
    pickAnotherStaff: "Chọn một nhân viên khác (Tùy chọn)",
    pickToday: "Chọn ngay hôm nay",
    tapDifferentDate: "Chọn một ngày khác",
    current: "hiện hành:",
    tapDifferentTime: "Chọn thời gian khác",

    hidden: {
      confirm: {
        client: "khách hàng:",
        service: "Dịch vụ:",
        change: "Thay đổi thời gian",
        appointmentChanged: "Cuộc hẹn đã thay đổi",
        leaveNote: "Để lại ghi chú nếu bạn muốn"
      }
    }
  },

  // components
  menu: {
    header: {
      edit: "Chỉnh sửa menu",
      view: "Xem menu"
    },
    photos: {
      header: "Hình ảnh",
      upload: "Chụp ảnh menu",
      easier: "Dễ dàng hơn cho bạn"
    },
    lists: {
      header: "Danh sách",
      create: "Tạo thủ công",
      easier: {
        salon: "Khách hàng đặt phòng dễ dàng hơn",
        restaurant: "Khách hàng đặt hàng dễ dàng hơn"
      }
    },
    bottomNavs: {
      back: {
        salon: "Quay lại\ncuộc hẹn",
        restaurant: "Về đơn\nđặt hàng"
      }
    },
    hidden: {
      uploadMenu: {
        takePhoto: "Chụp ảnh"
      },
      menuPhotooption: {
        header: "Bạn có chắc chắn muốn\nxóa menu này không ?"
      }
    }
  },
  addmenu: {
    header: {
      edit: "Chỉnh sửa menu",
      add: "Thêm menu"
    },
    name: "Thực đơn này gọi là gì ?",
    photo: "Chụp ảnh menu (Tùy chọn)"
  },
  addservice: {
    header: {
      edit: "Chỉnh sửa dịch vụ",
      add: "Thêm dịch vụ"
    },
    name: "Cuộc gọi dịch vụ này là gì ?",
    photo: "Chụp ảnh dịch vụ (Tùy chọn)",
    price: "Nhập giá dịch vụ:"
  },
  addproduct: {
    header: {
      edit: "Chỉnh sửa bữa ăn",
      add: "Thêm bữa ăn"
    },
    name: "Bữa ăn gọi là gì ?",
    photo: "Chụp ảnh bữa ăn này (Tùy chọn)",
    options: {
      addamount: "Thêm số lượng",
      addoption: "Thêm tùy chọn"
    },
    price: {
      size: "Nhập giá cho bữa ăn này",
      sizes: "Thêm kích thước",
    }
  },
  addmeal: {
    header: {
      edit: "Chỉnh sửa bữa ăn",
      add: "Thêm bữa ăn mới"
    },
    name: "Nhập tên của bữa ăn này:",
    photo: "Chụp ảnh bữa ăn này (Tùy chọn)",
    options: {
      addamount: "Thêm số lượng",
      addoption: "Thêm tùy chọn"
    },
    price: {
      size: "Nhập giá cho bữa ăn này",
      sizes: "Thêm kích thước",
    }
  },

  // global
  "Hair salon": "Tiệm\nlàm tóc",
  "Nail salon": "Tiệm\nlàm móng",
  Store: "Cửa hàng",
  Restaurant: "Quán ăn",

  "hair salon": "tiệm\nlàm tóc",
  "nail salon": "tiệm\nlàm móng",
  store: "cửa hàng",
  restaurant: "quán ăn",

  days: {
    Sunday: "Chủ nhật",
    Monday: "Thứ hai",
    Tuesday: "Thứ ba",
    Wednesday: "Thứ Tư",
    Thursday: "Thứ năm",
    Friday: "Thứ sáu",
    Saturday: "Thứ bảy"
  },
  months: {
    January: "Tháng Giêng",
    February: "Tháng hai",
    March: "Bước đều",
    April: "Tháng tư",
    May: "Có thể",
    June: "Tháng sáu",
    July: "Tháng bảy",
    August: "Tháng tám",
    September: "Tháng chín",
    October: "Tháng Mười",
    November: "Tháng mười một",
    December: "Tháng mười hai"
  },

  headers: {
    locatedHeader: {
      "hair salon": "Tiệm cắt tóc của bạn ở",
      "nail salon": "Tiệm làm móng của bạn ở",
      restaurant: "Nhà hàng của bạn ở",
      store: "Cửa hàng của bạn ở"
    },
    todayAt: "hôm nay lúc",
    tomorrowAt: "ngày mai lúc"
  },

  buttons: {
    back: "quay lại",
    next: "Đăng nhập",
    cancel: "sự hủy bỏ",
    skip: "nhảy",
    add: "cộng",
    edit: "chỉnh sửa",
    rebook: "Dặt lại",
    update: "cập nhật",
    letsGo: "Đi nào",
    takePhoto: "Chụp",
    choosePhoto: "Chọn từ điện thoại",
    markLocation: "đánh dấu vị trí của bạn",
    enterAddress: "Nhập địa chỉ",
    editAddress: "Sửa địa chỉ",
    done: "Xong",
    changeDays: "thay đổi ngày",
    yes: "Vâng",
    no: "không",
    close: "gần",
    addmenu: "Thêm menu",
    addmeal: "Thêm bữa ăn",
    additem: "Thêm mặt hàng",
    addservice: "Thêm dịch vụ",
    delete: "Xóa bỏ",
    change: "Biến đổi",
    see: "Nhìn",
    random: "Chọn ngẫu nhiên",
    forward: "ở đằng trước",
    backward: "phía sau"
  }
}

export const vietnamese = info
