import io from 'socket.io-client'

const local_url = false
const test_stripe = false
const test_input = false

const realStores = [
	{ id: 0, storeName: "Hung Hair Salon", storeType: "hair", phonenumber: "4164621484", addressOne: "642 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M1Y3" },
	{ id: 1, storeName: "I Love Pho 2", storeType: "restaurant", phonenumber: "9055668898", addressOne: "1248 Dundas St E", addressTwo: "", city: "Mississauga", province: "ON", postalcode: "L4Y 2C5" },
	{ id: 2, storeName: "TopCut", storeType: "hair", phonenumber: "4162037200", addressOne: "9 King St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M5C 3C5" },
	{ id: 3, storeName: "Pho House", storeType: "restaurant", phonenumber: "4167787888", addressOne: "625 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y2" },
	{ id: 4, storeName: "Headlines Salon", storeType: "hair", phonenumber: "9056420336", addressOne: "6328 Main St", addressTwo: "", city: "Whitchurch-Stouffville", province: "ON", postalcode: "L4A 1G9" },
	{ id: 5, storeName: "Gatsby Studio Salon & Spa", storeType: "nail", phonenumber: "9054779666", addressOne: "5000 Hwy 7", addressTwo: "", city: "Markham", province: "ON", postalcode: "L3R 4M9" },
	{ id: 6, storeName: "The One Nail Lounge & Spa", storeType: "nail", phonenumber: "9058582828", addressOne: "775 Britannia Rd W", addressTwo: "Unit # 9", city: "Mississauga", province: "ON", postalcode: "L5V 2Y1" },
	{ id: 7, storeName: "TIPS NAIL BAR®", storeType: "nail", phonenumber: "4164058477", addressOne: "848 Danforth Ave", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4J 1L7" },
	{ id: 8, storeName: "Pho Com Tam 168 Vietnamese Cuisines", storeType: "restaurant", phonenumber: "4169166432", addressOne: "1018 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Z3" }
]
const testStores = [
	{ id: 0, storeName: "Hair salon", storeType: "hair", phonenumber: "9000000000", addressOne: "642 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M1Y3", longitude: -79.3505832, latitude: 43.6660751 },
	{ id: 1, storeName: "Restaurant place 0", storeType: "restaurant", phonenumber: "5675675678", addressOne: "1248 Dundas St E", addressTwo: "", city: "Mississauga", province: "ON", postalcode: "L4Y 2C5", longitude: -79.5863632, latitude: 43.6060865 },
	{ id: 2, storeName: "Nail salon", storeType: "nail", phonenumber: "1000000000", addressOne: "9 King St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M5C 3C5", longitude: -79.3770086, latitude: 43.649194 },
	{ id: 3, storeName: "Restaurant place 1", storeType: "restaurant", phonenumber: "2000000000", addressOne: "625 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y2", longitude: -79.3509312, latitude: 43.6656672 },
	{ id: 4, storeName: "Hair salon 1", storeType: "hair", phonenumber: "3000000000", addressOne: "6328 Main St", addressTwo: "", city: "Whitchurch-Stouffville", province: "ON", postalcode: "L4A 1G9", longitude: -79.2451038, latitude: 43.9719332 },
	{ id: 5, storeName: "Nail salon 2", storeType: "nail", phonenumber: "9059875678", addressOne: "5000 Hwy 7", addressTwo: "", city: "Markham", province: "ON", postalcode: "L3R 4M9", longitude: -79.2882055, latitude: 43.8682345 },
]
const emptyStore = { storeName: "", storeType: "", phonenumber: "", addressOne: "", addressTwo: "", city: "", province: "", postalcode: "", longitude: 0, latitude: 0 }

const owners = [
	{ id: 0, username: 'owner1', cellnumber: "0110110101", password: "password" },
	{ id: 1, username: 'owner2', cellnumber: "0220220202", password: "password" },
	{ id: 2, username: 'owner3', cellnumber: "1231231111", password: "password" },
	{ id: 3, username: 'owner4', cellnumber: "5675675670", password: "password" },
	{ id: 4, username: 'owner5', cellnumber: "9000000001", password: "password" },
	{ id: 5, username: 'owner6', cellnumber: "1000000001", password: "password" },
	{ id: 6, username: 'owner7', cellnumber: "4167707700", password: "password" },
	{ id: 7, username: 'owner8', cellnumber: "9050000000", password: "password" },
	{ id: 8, username: 'owner9', cellnumber: "9050000001", password: "password" }
]
const emptyOwner = { username: "", cellnumber: "", password: "" }

const realBankAccount = [
	{ 
		id: 0, 
		accountNumber: '212120254029', countryCode: 'ca', currency: 'cad', 
		routingNumber: '21212002', accountHolderName: 'Dad', 
	},
	{
		id: 1, 
		accountNumber: '411520125784', countryCode: 'ca', currency: 'cad', 
		routingNumber: '41152002', accountHolderName: 'Sister', 
	},
	{
		id: 2, 
		accountNumber: '212120501387', countryCode: 'ca', currency: 'cad', 
		routingNumber: '21212002', accountHolderName: 'Powerchequing', 
	}
]
const testBankAccount = [
	{ 
		id: 0, 
		accountNumber: '000123456789', countryCode: 'us', currency: 'usd', 
		routingNumber: '110000000', accountHolderName: 'Test holder name one', 
	},
	{
		id: 1, 
		accountNumber: '000123456789', countryCode: 'us', currency: 'usd', 
		routingNumber: '110000000', accountHolderName: 'Test holder name two', 
	},
	{
		id: 2, 
		accountNumber: '000123456789', countryCode: 'us', currency: 'usd', 
		routingNumber: '110000000', accountHolderName: 'Test holder name three', 
	}
]
const emptyBankAccount = {
	accountNumber: '', countryCode: '', currency: '', 
	routingNumber: '', accountHolderName: ''
}

const { accountNumber, countryCode, currency, routingNumber, accountHolderName } = 
	test_input ? 
		test_stripe ? 
			testBankAccount[Math.floor(Math.random() * 2) + 0]
			:
			realBankAccount[Math.floor(Math.random() * 2) + 0]
	:
	emptyBankAccount

const login = test_input ? testStores[1] : emptyStore
const ownerLogin = test_input ? owners[1] : emptyOwner
const register = test_input ? testStores[1] : emptyStore
const ownerRegister = test_input ? owners[1] : emptyOwner
const wifi_api_url = "http://192.168.0.172:5001/flask"
const wifi_socket_url = "http://192.168.0.172:5002"
const server_api_url = "https://www.easygo.tk/flask"
const server_socket_url = "wss://www.easygo.tk"
const socket_url = local_url ? wifi_socket_url : server_socket_url

export const loginInfo = { 
	cellnumber: ownerLogin.cellnumber, password: ownerLogin.password, storeName: login.storeName, 
	storeType: login.storeType, phonenumber: login.phonenumber, addressOne: login.addressOne, 
	addressTwo: login.addressTwo, city: login.city, province: login.province, 
	postalcode: login.postalcode, accountNumber, countryCode, currency, routingNumber, accountHolderName
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
export const socket = io.connect(socket_url, { transports: ["websocket"] })
export const registerInfo = {
	phonenumber: register.phonenumber, password: "password", storeName: register.storeName, 
	storeType: register.storeType, phonenumber: register.phonenumber, addressOne: register.addressOne,
	addressTwo: register.addressTwo, city: register.city, province: register.province, 
	postalcode: register.postalcode, longitude: register.longitude, latitude: register.latitude, 
	accountNumber, countryCode, currency, routingNumber, accountHolderName
}
export const url = local_url ? wifi_api_url : server_api_url
export const isLocal = test_input
export const stripe_key = test_stripe ? "sk_test_lft1B76yZfF2oEtD5rI3y8dz" : "sk_live_AeoXx4kxjfETP2fTR7IkdTYC"
export const logo_url = url + "/static/"
export const displayTime = unixtime => {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const currTime = new Date(Date.now())
	const currentDate = Date.parse(months[currTime.getMonth()] + " " + currTime.getDate() + ", " + currTime.getFullYear() + " 23:59")
	const time = parseInt(unixtime)
	const selectedDate = new Date(time)
	let hour = selectedDate.getHours(), minute = selectedDate.getMinutes(), period, date = selectedDate.getDate()
	let timeStr = "", timeheader = "", diff

	minute = minute < 10 ? '0' + minute : minute
	period = hour > 12 ? 'pm' : 'am'
	hour = hour > 12 ? hour - 12 : hour

	timeheader = hour + ":" + minute + " " + period

	if (time < currentDate) {
		timeStr = "today at " + timeheader
	} else if (time > currentDate) {
		if (time - currentDate > 86400000) { // > one day
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
