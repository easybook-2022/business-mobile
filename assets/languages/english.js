const info = {
  authoption: {
    walkIn: "for clients",
    appointments: "Appointment(s)"
  },
  locationsetup: {
    intro: {
      welcome: "Welcome to\n",
      message: "We will bring the nearest customers to your door\nVERY FAST",
      begin: "Let's setup your business information"
    },
    type: {
      question: "What business are you ?",
      buttonHeaders: {
        tapChoose: "Tap\nto choose"
      }
    },
    name: {
      "hair salon": "Enter hair salon name:",
      "nail salon": "Enter nail salon name:",
      restaurant: "Enter restaurant name:",
      store: "Enter store name:"
    },
    location: {
      if: {
        "hair salon": "if you are at your the hair salon right now,",
        "nail salon": "if you are at your the nail salon right now,",
        restaurant: "if you are at your restaurant right now,",
        store: "if you are at your store right now,"
      },
      addressHeader: "Enter business address",
      address: {
        addressOne: "Enter address #1:",
        addressTwo: "Enter address #2 (Optional):",
        city: "Enter city:",
        province: "Enter province:",
        postalCode: "Enter postal code:"
      },
      sameOpen: {
        some: "Is your business open same time on",
        all: "Is your business open same time everyday"
      }
    },
    phonenumber: "Enter your business phone number:",
    photo: {
      "hair salon": "Take a picture of your hair salon",
      "nail salon": "Take a picture of your nail salon",
      restaurant: "Take a picture of your restaurant",
      store: "Take a picture of your store"
    },
    openDays: {
      header: "What days are your business open ?",
      time: "Set the open and close hours for {day}",
      sameTime: {
        all: "Set the open and close time for everyday",
        some: "Set the open and close time for"
      }
    }
  },
  register: {
    header: "for clients to see",
    name: "Enter your name:",
    photo: "Take a picture of your face (Optional)",
    workingDays: {
      header: "What days do you work ?",
      hour: "Set your working time for {day}",
      sameHours: {
        header: "Do you work the same hours on",
        some: "Set your working time for",
        all: "Set your working time for everyday"
      }
    },
    nameErrormsg: "Please enter a name you like",
    workingDaysErrormsg: "Please choose the days you work on"
  },
  main: {
    navs: {
      myAppointments: "Appointments(s)\n(List)",
      allAppointments: "Appointments(s)\n(Table)",
      cartOrderers: "Cart Orderer(s)",
      tableBills: "Table Bill(s)",
      tableOrders: "Table Order(s)"
    },
    list: {
      header: "You will see your appointment(s) here",
      clientName: "Client name",
      staff: "Staff name",
      changeTime: "Change time with client"
    },
    chart: {
      stillBusy: "Still busy",
      booked: "App",
      walkIn: "Walk in",
      editTime: "Tap time to rebook",
      reschedule: {
        all: "Reschedule All",
        some: "Reschedule Some",
        finishSelect: "Finish selecting",
      },
      rebook: "Tap any schedule to rebook"
    },
    cartOrderers: {
      header: "You will see all order(s) here",
      customerName: "Customer:",
      orderNumber: "Order #:",
      seeOrders: "See Order(s)"
    },
    tableOrders: {
      header: "There are no table order(s) yet",
      tableHeader: "Table #",
      seeBill: "See Bill",
      seeOrders: "See Orders",
      showCode: "Show code"
    },
    bottomNavs: {
      info: "Info",
      hours: "Hour(s)"
    },
    hidden: {
      scheduleOption: {
        rebookHeader: "Tap any other time to rebook",
        selectHeader: "Tap the schedules you want to rebook",
        remove: {
          header: "Why cancel ? (Optional)",
          reason: "Write your reason"
        },
        select: {
          pushTypeHeader: "Reschedule appointments forward or backward ?",
          pushByHeader: "Reschedule appointments {dir} by",
          timeFactorHeader: "Enter how many ",
          pushTypes: {
            backward: "Push Backward",
            forward: "Push Forward"
          },
          pushBys: {
            days: "Days",
            hours: "Hours",
            minutes: "Minutes"
          }
        },
        rescheduleNow: "Reschedule Now",
        selectFactor: "Select how many {factor}"
      },
      showInfo: {
        businessHeader: "Business's hour(s)",
        staffHeader: "All Staff(s)",
        staffName: "Staff name:"
      },
      showMoreoptions: {
        changeMenu: "Change Menu",
        changeStaffinfo: "Change Staffs Info",
        changeLogininfo: "Change Login Info",
        changeBusinessinformation: "Change name/phonenumber",
        changeBusinesslocation: "Change Address",
        changeBusinesslogo: "Change Photo",
        changeBusinesshours: "Change Hour(s)",
        moreBusinesses: "Your Business(es)",
        walkIn: "Client Walk-In",
        changeLanguage: "Change language",
        editTables: "Edit Table(s)",
        getAppointmentsby: {
          header: "Get appointments by",
          both: "Owners and Staffs",
          owner: "Owners only"
        },
        useVoice: {
          header: "Use voice",
          yes: "Yes",
          no: "No"
        },
        paymentRecords: "See Income"
      },
      workingDays: {
        header: "What days does new staff work on ?",
        hour: "Set new staff's working time",
        sameHours: "Set new staff's working time for"
      },
      alert: {
        schedulingConflict: "There is a scheduling conflict",
        unfinishedOrders: "There are some unfinished orders",
        noOrders: "There are no orders"
      },
      tables: {
        table: "Table #",
        showBarcode: "Show Barcode",
        hidden: {
          add: {
            tableNumber: "Enter table #:",
          },
          remove: {
            header: "Remove Table #"
          },
          qr: {
            header: "Table #"
          }
        }
      },
    },
    editInfo: {
      staff: {
        header: "Edit Staff(s)",
        add: "Add a new staff",
        change: {
          self: "Change Info (your)",
          other: "Change hours"
        }
      }
    },
    editingInfo: {
      header: {
        edit: "Editing Staff's info",
        add: "Add Staff's info"
      },
      changeCellnumber: "Change cell number",
      changeName: "Change your name",
      changeProfile: "Change your profile",
      changePassword: "Change your password",
      changeWorking: "Change your working days and hours"
    },
    editingLanguage: {
      english: "English",
      french: "French",
      vietnamese: "Vietnamese",
      chinese: "Chinese"
    },
    editingInformation: {
      name: "Enter business name",
      phonenumber: "Enter business phone number",
      cellnumber: "Enter your cell phone number",
      verifyCode: "Enter code sent to your message",
      currentPassword: "Enter current password",
      newPassword: "Enter a new password",
      confirmPassword: "Confirm your new password"
    },
    editingLocation: "Enter business address",
    editingLogo: "Business's photo",
    editingHours: {
      header: "Edit business hours",
      openHeader: "Open on {day}",
      changeToNotOpen: "Change to not open",
      changeToOpen: "Change to open",
      notOpen: "Not open on {day}"
    },
    editingWorkingHours: "Edit your working time",
    deleteStaff: {
      header: "Working {numDays} day(s)",
      delete: "Remove staff"
    }
  },
  list: {
    add: "Add a business"
  },
  orders: {
    header: "Order(s)",
    setWaittime: "Set wait time",
    customerNote: "Customer's note:",

    hidden: {
      noOrders: {
        header: "Order has already been delivered"
      },
      noWaittime: {
        header: "Please tell the customer the wait time for this order",
      },
      waitTime: {
        header: "How long will be the wait ?",
        min: "mins"
      }
    }
  },
  booktime: {
    header: "Request different time",
    pickStaff: "Pick a staff (Optional)",
    pickAnotherStaff: "Pick a different staff (Optional)",
    pickToday: "Pick today",
    tapDifferentDate: "Tap a different date below",
    current: "Current:",
    tapDifferentTime: "Tap a different time below",

    hidden: {
      confirm: {
        client: "Client",
        service: "Service",
        change: "Change time to",
        appointmentChanged: "Appointment changed",
        leaveNote: "Leave a note if you want"
      }
    }
  },
  tables: {
    addTable: "Add table",
    table: "Table #",
    showBarcode: "Show Barcode",
    hidden: {
      add: {
        tableNumber: "Enter table #:",
      },
      remove: {
        header: "Remove Table #"
      },
      qr: {
        header: "Table #"
      }
    }
  },

  // components
  menu: {
    header: {
      edit: "Edit Menu",
      view: "View Menu"
    },
    photos: {
      header: "Photo(s)",
      upload: "Take a\nmenu photo",
      easier: "Easier for you"
    },
    lists: {
      header: "List(s)",
      easier: {
        salon: "Easier for clients to book",
        restaurant: "Easier for customers to order"
      }
    },
    bottomNavs: {
      back: {
        salon: "Back to\nappointment(s)",
        restaurant: "Back to\norder(s)"
      }
    },
    hidden: {
      uploadMenu: {
        takePhoto: "Take a photo"
      },
      menuPhotooption: {
        header: "Are you sure you want to delete\nthis menu ?"
      }
    }
  },
  addmenu: {
    header: {
      edit: "Edit Menu",
      add: "Add Menu"
    },
    name: "What is this menu call ?",
    photo: "Take a picture of the menu (Optional)",
  },
  addservice: {
    header: {
      edit: "Edit Service",
      add: "Add Service"
    },
    name: "What is this service call ?",
    photo: "Take a picture of this service (Optional)",
    price: "Enter the price for this service"
  },
  addproduct: {
    header: {
      edit: "Edit product",
      add: "Add new product"
    },
    name: "Enter product name",
    photo: "Take product picture (Optional)",
    options: {
      addamount: "Add % or amount option",
      addoption: "Add Specific Option"
    },
    price: {
      size: "Add size",
      sizes: "Enter a price",
    }
  },
  addmeal: {
    header: {
      edit: "Edit meal",
      add: "Add new meal"
    },
    name: "Enter meal name",
    photo: "Take meal picture (Optional)",
    price: {
      size: "Enter one price",
      sizes: "Add size",
      quantity: "Add quantity",
      percent: "Add %"
    }
  },

  // global
  "Hair salon": "Hair\nsalon",
  "Nail salon": "Nair\nsalon",
  Store: "Store",
  Restaurant: "Restaurant",

  "hair salon": "hair\nsalon",
  "nail salon": "nair\nsalon",
  store: "store",
  restaurant: "restaurant",

  days: { Sunday: "Sunday", Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday", Saturday: "Saturday" },
  months: { January: "January", February: "February", March: "March", April: "April", May: "May", June: "June", July: "July", August: "August", September: "September", October: "October", November: "November", December: "December" },

  headers: {
    locatedHeader: {
      "hair salon": "Your hair salon is at",
      "nail salon": "Your nail salon is at",
      restaurant: "Your restaurant is at",
      store: "Your store is at"
    },
    todayAt: "today at",
    tomorrowAt: "tomorrow at"
  },

  buttons: {
    back: "Back",
    next: "Next",
    cancel: "Cancel",
    skip: "Skip",
    add: "Add",
    edit: "Edit",
    rebook: "Rebook",
    update: "Update",
    begin: "Begin",
    takePhoto: "Take\nthis photo",
    retakePhoto: "Retake photo",
    choosePhoto: "Choose\nfrom phone",
    markLocation: "Mark your location",
    enterAddress: "Enter address instead",
    editAddress: "Edit address instead",
    done: "Done",
    changeDays: "Change Days",
    yes: "Yes",
    no: "No",
    close: "Close",
    addmenu: "Add menu",
    addmeal: "Add meal",
    addproduct: "Add product",
    addservice: "Add service",
    delete: "Delete",
    change: "Change",
    see: "See",
    random: "Pick Random",
    forward: "Forward",
    backward: "Backward"
  },

  disableHeader: "There is an update to the app\n\nPlease wait a moment\n\nor tap 'Close'"
}

export const english = info
