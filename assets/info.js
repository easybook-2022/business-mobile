let stores = [
	{ id: 0, storeName: "I Love Pho 2", storeType: "restaurant", cellnumber: "5675675670", phonenumber: "9055668898", addressOne: "1248 Dundas St E", addressTwo: "", city: "Mississauga", province: "ON", postalcode: "L4Y 2C5" },
	{ id: 1, storeName: "Hung Hair Salon", storeType: "hair", cellnumber: "9000000001", phonenumber: "4164621484", addressOne: "642 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y3" },
	{ id: 2, storeName: "TopCut", storeType: "hair", cellnumber: "4164161234", phonenumber: "4162037200", addressOne: "9 King St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M5C 3C5" },
	{ id: 3, storeName: "Pho House", storeType: "restaurant", cellnumber: "4167707700", phonenumber: "4167787888", addressOne: "625 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y2" },
	{ id: 4, storeName: "Headlines Salon", storeType: "hair", cellnumber: "9050000000", phonenumber: "9056420336", addressOne: "6328 Main St", addressTwo: "", city: "Whitchurch-Stouffville", province: "ON", postalcode: "L4A 1G9" },
	{ id: 5, storeName: "Gatsby Studio Salon & Spa", storeType: "nail", cellnumber: "9050000001", phonenumber: "9054779666", addressOne: "5000 Hwy 7", addressTwo: "", city: "Markham", province: "ON", postalcode: "L3R 4M9" },
	{ id: 6, storeName: "The One Nail Lounge & Spa", storeType: "nail", cellnumber: "9055855858", phonenumber: "9058582828", addressOne: "775 Britannia Rd W", addressTwo: "Unit # 9", city: "Mississauga", province: "ON", postalcode: "L5V 2Y1" },
	{ id: 7, storeName: "TIPS NAIL BAR®", storeType: "nail", cellnumber: "4164050000", phonenumber: "4164058477", addressOne: "848 Danforth Ave", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4J 1L7" },
	{ id: 8, storeName: "Pho Com Tam 168 Vietnamese Cuisines", storeType: "restaurant", cellnumber: "4169166666", phonenumber: "4169166432", addressOne: "1018 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Z3" }
]
stores = [
	{ id: 0, storeName: "Restaurant place 0", storeType: "restaurant", cellnumber: "5675675670", phonenumber: "5675675678", addressOne: "1248 Dundas St E", addressTwo: "", city: "Mississauga", province: "ON", postalcode: "L4Y 2C5" },
	{ id: 1, storeName: "Hair salon", storeType: "hair", cellnumber: "9000000001", phonenumber: "9000000000", addressOne: "642 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y3" },
	{ id: 2, storeName: "Nail salon", storeType: "nail", cellnumber: "1000000001", phonenumber: "1000000000", addressOne: "9 King St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M5C 3C5" },
	{ id: 3, storeName: "Restaurant place 1", storeType: "restaurant", cellnumber: "4167707700", phonenumber: "2000000000", addressOne: "625 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y2" },
	{ id: 4, storeName: "Hair salon 1", storeType: "hair", cellnumber: "9050000000", phonenumber: "3000000000", addressOne: "6328 Main St", addressTwo: "", city: "Whitchurch-Stouffville", province: "ON", postalcode: "L4A 1G9" },
	{ id: 5, storeName: "Nail salon 2", storeType: "nail", cellnumber: "9050000001", phonenumber: "9059875678", addressOne: "5000 Hwy 7", addressTwo: "", city: "Markham", province: "ON", postalcode: "L3R 4M9" },
]
const owners = [
	{
		id: 0, username: 'owner1', cellnumber: "0110110101", password: "password"
	},
	{
		id: 1, username: 'owner2', cellnumber: "0220220202", password: "password"
	},
	{
		id: 2, username: 'owner03', cellnumber: "1231231111", password: "password"
	}
]
const bankAccount = [
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
const { accountNumber, countryCode, currency, routingNumber, accountHolderName } = bankAccount[Math.floor(Math.random() * 2) + 0]

let login = stores[0]
export const loginInfo = { 
	cellnumber: login.cellnumber,  password: "password", storeName: login.storeName, 
	storeType: login.storeType, phonenumber: login.phonenumber, addressOne: login.addressOne, 
	addressTwo: login.addressTwo, city: login.city, province: login.province, 
	postalcode: login.postalcode, accountNumber, countryCode, currency, routingNumber, accountHolderName
}

let owner = owners[1]
export const ownerInfo = {
	username: owner.username,
	cellnumber: owner.cellnumber,
	password: owner.password
}

let register = stores[5]
export const registerInfo = {
	phonenumber: register.phonenumber, password: "password", storeName: register.storeName, 
	storeType: register.storeType, phonenumber: register.phonenumber, addressOne: register.addressOne,
	addressTwo: register.addressTwo, city: register.city, province: register.province, 
	postalcode: register.postalcode, accountNumber, countryCode, currency, routingNumber, accountHolderName
}
export const wifi_api_url = "http://192.168.0.172:5000/flask"
export const server_api_url = "https://www.easygo.tk/flask"
export const url = wifi_api_url
export const stripe_key = "sk_test_lft1B76yZfF2oEtD5rI3y8dz"
export const logo_url = url + "/static/"
export const displayTime = unixtime => {
	const months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const currTime = new Date(Date.now())
	const currentDate = Date.parse(months[currTime.getMonth()] + " " + currTime.getDate() + ", " + currTime.getFullYear() + " 23:59")
	const selectedDate = new Date(unixtime)
	let hour = selectedDate.getHours(), minute = selectedDate.getMinutes(), period
	let timeStr = "", timeheader = "", diff

	minute = minute < 10 ? '0' + minute : minute
	period = hour > 12 ? 'pm' : 'am'
	hour = hour > 12 ? hour - 12 : hour

	timeheader = hour + ":" + minute + " " + period

	if (unixtime < currentDate) {
		timeStr = "today at " + timeheader
	} else if (unixtime > currentDate) {
		if (unixtime - currentDate > 86400000) {
			diff = unixtime - currentDate

			if (diff <= 604800000) { // this week
				let sDay = new Date(unixtime)
				let eDay = new Date(currentDate)

				if (sDay.getDay() == eDay.getDay()) {
					timeStr = " next " + days[sDay.getDay()] + " at " + timeheader
				} else {
					timeStr = " this " + days[sDay.getDay()] + " at " + timeheader
				}
			} else if (diff > 604800000 && diff <= 1210000000) { // next week
				let sDay = new Date(unixtime)
				let eDay = new Date(currentDate)

				if (sDay.getDay() != eDay.getDay()) {
					timeStr = " next " + days[sDay.getDay()] + " at " + timeheader
				} else {
					timeStr = " this " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
				}
			} else {
				let sDay = new Date(unixtime)
				let eDay = new Date(currentDate)

				if (sDay.getMonth() != eDay.getMonth()) {
					timeStr = " this " + days[sDay.getDay()] + ", " + months[sDay.getMonth()] + " " + date + " at " + timeheader
				} else {
					timeStr = " this " + days[sDay.getDay()] + ", " + date + " at " + timeheader
				}
			}
		} else {
			timeStr = "tomorrow at " + timeheader
		}
	}

	return timeStr
}
