import io from 'socket.io-client'

const local_url = true
const test_input = true

const testStores = [
  { id: 0, storeName: "Hair salon", storeType: "hair", phonenumber: "(900) 000-0000", addressOne: "642 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M1Y3", longitude: -79.3505832, latitude: 43.6660751 },
	{ id: 1, storeName: "Restaurant place 0", storeType: "restaurant", phonenumber: "(567) 567-5678", addressOne: "1248 Dundas St E", addressTwo: "", city: "Mississauga", province: "ON", postalcode: "L4Y 2C5", longitude: -79.5863632, latitude: 43.6060865 },
	{ id: 2, storeName: "Nail salon", storeType: "nail", phonenumber: "(100) 000-0000", addressOne: "9 King St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M5C 3C5", longitude: -79.3770086, latitude: 43.649194 },
	{ id: 3, storeName: "Restaurant place 1", storeType: "restaurant", phonenumber: "(200) 000-0000", addressOne: "625 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y2", longitude: -79.3509312, latitude: 43.6656672 },
	{ id: 4, storeName: "Hair salon 1", storeType: "hair", phonenumber: "(300) 000-0000", addressOne: "6328 Main St", addressTwo: "", city: "Whitchurch-Stouffville", province: "ON", postalcode: "L4A 1G9", longitude: -79.2451038, latitude: 43.9719332 },
	{ id: 5, storeName: "Nail salon 2", storeType: "nail", phonenumber: "(905) 987-5678", addressOne: "5000 Hwy 7", addressTwo: "", city: "Markham", province: "ON", postalcode: "L3R 4M9", longitude: -79.2882055, latitude: 43.8682345 },
  { id: 6, storeName: "The Skin care", storeType: "store", phonenumber: "(900) 101-0101", addressOne: "750 Queen St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M1H4", longitude: -79.3505832, latitude: 43.6660751 },
]
const realStores = [
  { id: 0, storeName: "the salon", storeType: "hair", phonenumber: "(416) 462-1482", addressOne: "642 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M1Y3", longitude: -79.3505832, latitude: 43.6660751 },
  { id: 1, storeName: "foody", storeType: "restaurant", phonenumber: "(905) 275-8099", addressOne: "1248 Dundas St E", addressTwo: "", city: "Mississauga", province: "ON", postalcode: "L4Y 2C5", longitude: -79.5863632, latitude: 43.6060865 },
]
const emptyStore = { storeName: "", storeType: "", phonenumber: "", addressOne: "", addressTwo: "", city: "", province: "", postalcode: "", longitude: 0, latitude: 0 }

const testOwners = [
	{ id: 0, username: 'owner1', cellnumber: "(000) 000-0000", password: "password" },
	{ id: 1, username: 'owner2', cellnumber: "(111) 111-1111", password: "password" },
	{ id: 2, username: 'owner3', cellnumber: "(222) 222-2222", password: "password" },
	{ id: 3, username: 'owner4', cellnumber: "(333) 333-3333", password: "password" },
	{ id: 4, username: 'owner5', cellnumber: "(444) 444-4444", password: "password" },
	{ id: 5, username: 'owner6', cellnumber: "(555) 555-5555", password: "password" },
	{ id: 6, username: 'owner7', cellnumber: "(666) 666-6666", password: "password" },
	{ id: 7, username: 'owner8', cellnumber: "(777) 777-7777", password: "password" },
	{ id: 8, username: 'owner9', cellnumber: "(888) 888-8888", password: "password" }
]
const realOwner = { id: 0, username: 'kevin', cellnumber: "(647) 926-3868", password: "password" }
const emptyOwner = { username: "", cellnumber: "", password: "" }

const useInput = true

const login = test_input ? testStores[0] : useInput ? realStores[0] : emptyStore
const ownerLogin = test_input ? testOwners[0] : useInput ? realOwner : emptyOwner
const register = test_input ? testStores[0] : useInput ? realStores[0] : emptyStore
const ownerRegister = test_input ? testOwners[0] : useInput ? realOwner : emptyOwner

const wifi_api_url = "http://192.168.0.172:5001/flask"
const wifi_socket_url = "http://192.168.0.172:5002"
const server_api_url = "https://www.easygo.tk/flask"
const server_socket_url = "wss://www.easygo.tk"
const socket_url = local_url ? wifi_socket_url : server_socket_url

export const loginInfo = { 
	cellnumber: ownerLogin.cellnumber, password: ownerLogin.password, storeName: login.storeName, 
	storeType: login.storeType, phonenumber: login.phonenumber, addressOne: login.addressOne, 
	addressTwo: login.addressTwo, city: login.city, province: login.province, 
	postalcode: login.postalcode
}
export const ownerLoginInfo = {
	username: ownerLogin.username,
	cellnumber: ownerLogin.cellnumber,
	password: ownerLogin.password
}
export const ownerRegisterInfo = {
	username: ownerRegister.username,
	cellnumber: ownerRegister.cellnumber,
	password: ownerRegister.password
}
export const socket = io.connect(socket_url)
export const registerInfo = {
	phonenumber: register.phonenumber, password: "password", storeName: register.storeName, 
	storeType: register.storeType, phonenumber: register.phonenumber, addressOne: register.addressOne,
	addressTwo: register.addressTwo, city: register.city, province: register.province, 
	postalcode: register.postalcode, longitude: register.longitude, latitude: register.latitude
}
export const url = local_url ? wifi_api_url : server_api_url
export const isLocal = test_input
export const logo_url = url + "/static/"
export const displayTime = unixtime => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const currTime = new Date(Date.now())
  const currentDate = Date.parse(months[currTime.getMonth()] + " " + currTime.getDate() + ", " + currTime.getFullYear() + " 23:59")
  const time = parseInt(unixtime)
  const selectedDate = new Date(time)
  let hour = selectedDate.getHours(), minute = selectedDate.getMinutes(), period, date = selectedDate.getDate()
  let timeStr = "", timeheader = "", diff

  minute = minute < 10 ? '0' + minute : minute
  period = hour < 12 ? 'am' : 'pm'
  hour = hour > 12 ? 
    hour - 12 
    : 
    hour == 0 ? 12 : hour

  timeheader = hour + ":" + minute + " " + period

  if (time < currentDate) {
    timeStr = "today at " + timeheader
  } else if (time > currentDate) {
    if (time - currentDate > 86400000) {
      diff = time - currentDate

      if (diff <= 604800000) { // this week
        let sDay = new Date(time)
        let eDay = new Date(currentDate)

        timeStr = " on " + days[sDay.getDay()] + " at " + timeheader
      } else if (diff > 604800000 && diff <= 1210000000) { // next week
        let sDay = new Date(time)
        let eDay = new Date(currentDate)

        timeStr = " next " + days[sDay.getDay()] + " at " + timeheader
      } else {
        let sDay = new Date(time)
        let eDay = new Date(currentDate)

        timeStr = " on " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
      }
    } else {
      timeStr = "tomorrow at " + timeheader
    }
  }

  return timeStr
}
export const displayPhonenumber = (oldValues, newValue, hideKeyboard) => {
  let newValues = ""

  if (oldValues.length - newValue.length == 1) {
    newValues = newValue
  } else {
    for (let k = 0; k < newValue.length; k++) {
      newValues += newValue.substr(k, 1) >= "0" && newValue.substr(k, 1) <= "9" ? newValue.substr(k, 1) : ""
    }

    if (newValues.length == 10) { // 1231231234
      newValues = "(" + newValues.substr(0, 3) + ") " + newValues.substr(3, 3) + "-" + newValues.substr(6, 4)

      hideKeyboard()
    } else if (newValues.length >= 1 && newValues.length <= 6) {
      newValues = "(" + newValues.substr(0, 3) + ") " + newValues.substr(3, 3)
    } else if (newValues.length >= 6 && newValues.length <= 10) {
      newValues = "(" + newValues.substr(0, 3) + ") " + newValues.substr(3, 3) + "-" + newValues.substr(6, 4)
    }
  }

  return newValues
}
export const timeControl = (timetype, value, dir, open) => {
  let hour, minute, period

  hour = parseInt(value.hour)
  minute = parseInt(value.minute)
  period = value.period

  switch (timetype) {
    case "hour":
      hour = period == "PM" ? 
        hour > 12 ? hour - 12 : hour
        : 
        hour

      if (open) { // opening hour
        if (dir == "up") { // moving hour forward
          hour++

          if (hour == 12) {
            period = period == "AM" ? "PM" : "AM"
          }
        } else { // moving hour backward
          if (hour == 24 || hour == 12) {
            period = period == "AM" ? "PM" : "AM"

            if (hour == 24) {
              hour--
            } else {
              hour = 23
            }
          } else if (hour == 1) {
            hour = 24
          } else {
            hour--
          }
        }
      } else { // closing hour
        if (dir == "up") {
          hour++

          if (hour == 12) {
            period = period == "AM" ? "PM" : "AM"
          }
        } else {
          if (hour == 24 || hour == 12) {
            period = period == "AM" ? "PM" : "AM"

            if (hour == 24) {
              hour--
            } else {
              hour = 23
            }
          } else if (hour == 1) {
            hour = 24
          } else {
            hour--
          }
        }
      }

      hour = hour > 12 ? hour - 12 : hour

      break
    case "minute":
      minute = dir == "up" ? minute + 1 : minute - 1

      if (minute > 59) {
        minute = 0
      } else if (minute < 0) {
        minute = 59
      }

      break
    case "period":
      period = period == "AM" ? "PM" : "AM"

      break
    default:
  }

  return { hour, minute, period }
}
