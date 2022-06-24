import io from 'socket.io-client'

const local_url = true
const test_input = false

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

const useInput = false

const loginLocation = test_input ? testStores[0] : useInput ? realStores[0] : emptyStore
const ownerSignin = test_input ? testOwners[0] : useInput ? realOwner : emptyOwner
const registerLocation = test_input ? testStores[1] : useInput ? realStores[0] : emptyStore

const host = "10.0.0.60"
const wifi_api_url = "http://" + host + ":5001/flask"
const wifi_socket_url = "http://" + host + ":5002"
const server_api_url = "https://www.easygo.tk/flask"
const server_socket_url = "wss://www.easygo.tk"
const socket_url = local_url ? wifi_socket_url : server_socket_url

export const loginInfo = { 
	cellnumber: ownerSignin.cellnumber, password: ownerSignin.password, storeName: loginLocation.storeName, 
	storeType: loginLocation.storeType, phonenumber: loginLocation.phonenumber, addressOne: loginLocation.addressOne, 
	addressTwo: loginLocation.addressTwo, city: loginLocation.city, province: loginLocation.province, 
	postalcode: loginLocation.postalcode
}
export const ownerSigninInfo = {
	username: ownerSignin.username,
	cellnumber: ownerSignin.cellnumber,
	password: ownerSignin.password,
  confirmPassword: ""
}
export const socket = io.connect(socket_url)
export const registerLocationInfo = {
	phonenumber: registerLocation.phonenumber, password: "password", storeName: registerLocation.storeName, 
	storeType: registerLocation.storeType, phonenumber: registerLocation.phonenumber, addressOne: registerLocation.addressOne,
	addressTwo: registerLocation.addressTwo, city: registerLocation.city, province: registerLocation.province, 
	postalcode: registerLocation.postalcode, longitude: registerLocation.longitude, latitude: registerLocation.latitude
}
export const url = local_url ? wifi_api_url : server_api_url
export const useSpeech = local_url == false
export const logo_url = url + "/static/"
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
