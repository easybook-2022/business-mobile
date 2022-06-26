const info = {
  authoption: {
    walkIn: "Walk-in(s)",
    appointments: "Appointment(s)"
  },
  locationsetup: {
    intro: {
      welcome: "Welcome to\n",
      message: "We will bring the nearest customers to your door\nVERY FAST",
      letsGo: "Let's setup your business information"
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
        "hair salon": "if you are at the hair salon right now,",
        "nail salon": "if you are at the nail salon right now,",
        restaurant: "if you are at the restaurant right now,",
        store: "if you are at the store right now,"
      },
      addressHeader: {
        "hair salon": "Enter hair salon address",
        "nail salon": "Enter nail salon address",
        restaurant: "Enter restaurant address",
        store: "Enter store address"
      },
      address: {
        addressOne: "Enter address #1:",
        addressTwo: "Enter address #2 (Optional):",
        city: "Enter city:",
        province: "Enter province:",
        postalCode: "Enter postal code:"
      }
    },
    phonenumber: {
      "hair salon": "Enter hair salon's phone number:",
      "nail salon": "Enter nail salon's phone number:",
      restaurant: "Enter restaurant's phone number:",
      store: "Enter store's phone number:"
    },
    photo: {
      "hair salon": "Take a picture of your hair salon",
      "nail salon": "Take a picture of your nail salon",
      restaurant: "Take a picture of your restaurant",
      store: "Take a picture of your store"
    },
    openDays: {
      header: "What days are you open ?",
      time: "Set the open and close hours for {day}"
    }
  },
  register: {
    header: "for clients to see",
    name: "Enter your name:",
    photo: "Take a picture of your face (Optional)",
    workingDays: {
      header: "What days do you work ?",
      hour: "Set your working time on {day}"
    },
    nameErrormsg: "Please enter a name you like",
    workingDaysErrormsg: "Please choose the days you work on"
  },
  main: {
    navs: {
      myAppointments: "My\nAppointments(s)",
      allAppointments: "All\nAppointments(s)",
      cartOrderers: "Cart orderer(s)"
    },
    list: {
      header: "You will see your appointment(s) here",
      clientName: "Client name:",
      staff: "Stylist name:",
      changeTime: "Change time with client"
    },
    cartOrderers: {
      header: "You will see all order(s) here",
      customerName: "Customer:",
      orderNumber: "Order #:",
      seeOrders: "See Order(s)"
    },
    bottomNavs: {
      changeInfo: "Change Info",
      hours: "Hour(s)"
    },
    hidden: {
      scheduleOption: {
        header: "Why cancel ? (Optional)",
        reason: "Write your reason"
      },
      showInfo: {
        header: "Business's hour(s)",
        staffName: "Staff name:"
      },
      showMoreoptions: {
        changeMenu: "Change Menu",
        changeStaffinfo: "Change Staffs Info",
        changeBusinessinfo: "Change Business's Info",
        changeBusinesshours: "Change Business's Hour(s)",
        moreBusinesses: "Your Business(es)",
        walkIn: "Client Walk-In",
        getAppointmentsby: {
          header: "Get appointments by",
          staff: "Staff(s)",
          owner: "Owner(s)"
        }
      }
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
    editingAddress: {
      name: "Business name",
      phoneNumber: "Business phone number",
      addressOne: "Address #1",
      addressTwo: "Address #2 (Optional)",
      city: "City",
      Province: "Province",
      postalCode: "Postal code"
    },
    editingHours: {
      header: "Edit business hours",
      openHeader: "Open on {day}",
      changeToNotOpen: "Change to not open",
      changeToOpen: "Change to open",
      notOpen: "Not open on {day}"
    },
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
        client: "Client:",
        service: "Service:",
        change: "Change time to",
        appointmentChanged: "Appointment changed",
        leaveNote: "Leave a note if you want"
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
      create: "Add one-by-one",
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
    name: "Enter a name of this product",
    photo: "Take a picture of this product (Optional)",
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
    name: "Enter a name of this meal",
    photo: "Take a picture of this meal (Optional)",
    options: {
      addamount: "Add % or amount option",
      addoption: "Add Specific Option"
    },
    price: {
      size: "Add size",
      sizes: "Enter a price",
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

  days: {
    Sunday: "Sunday",
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesdday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday"
  },

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
    letsGo: "Let's go",
    takePhoto: "Take\nthis photo",
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
    additem: "Add item",
    addservice: "Add service",
    delete: "Delete",
    change: "Change",
    see: "See",
    random: "Random"
  }
}

export const english = info
