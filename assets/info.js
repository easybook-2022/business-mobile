const stores = [
	{ id: 0, storeName: "TopCut", storeType: "hair", phonenumber: "4162037200", addressOne: "9 King St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M5C 3C5" },
	{ id: 1, storeName: "Pho House", storeType: "restaurant", phonenumber: "4167787888", addressOne: "625 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y2" },
	{ id: 2, storeName: "Headlines Salon", storeType: "hair", phonenumber: "9056420336", addressOne: "6328 Main St", addressTwo: "", city: "Whitchurch-Stouffville", province: "ON", postalcode: "L4A 1G9" },
	{ id: 3, storeName: "Hung Hair Salon", storeType: "hair", phonenumber: "4164621484", addressOne: "642 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Y3" },
	{ id: 4, storeName: "Gatsby Studio Salon & Spa", storeType: "nail", phonenumber: "9054779666", addressOne: "5000 Hwy 7", addressTwo: "", city: "Markham", province: "ON", postalcode: "L3R 4M9" },
	{ id: 5, storeName: "The One Nail Lounge & Spa", storeType: "nail", phonenumber: "9058582828", addressOne: "775 Britannia Rd W", addressTwo: "Unit # 9", city: "Mississauga", province: "ON", postalcode: "L5V 2Y1" },
	{ id: 6, storeName: "I Love Pho 2", storeType: "restaurant", phonenumber: "9055668898", addressOne: "1248 Dundas St E", addressTwo: "", city: "Mississauga", province: "ON", postalcode: "L4Y 2C5" },
	{ id: 7, storeName: "TIPS NAIL BAR®", storeType: "nail", phonenumber: "4164058477", addressOne: "848 Danforth Ave", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4J 1L7" },
	{ id: 8, storeName: "Pho Com Tam 168 Vietnamese Cuisines", storeType: "restaurant", phonenumber: "4169166432", addressOne: "1018 Gerrard St E", addressTwo: "", city: "Toronto", province: "ON", postalcode: "M4M 1Z3" }
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
const { storeName, storeType, phonenumber, addressOne, addressTwo, city, province, postalcode } = stores[0]
const { accountNumber, countryCode, currency, routingNumber, accountHolderName } = bankAccount[0]

export const local_api_url = "http://localhost:5000"
export const wifi_api_url = "http://192.168.0.14:5000"
export const userInfo = {
	cellnumber: phonenumber,
	password: "password",
	storeName, storeType,
	phonenumber, addressOne,
	addressTwo, city,
	province, postalcode,
	accountNumber, countryCode, 
	currency, routingNumber, 
	accountHolderName
}
export const stripe_key = "sk_test_lft1B76yZfF2oEtD5rI3y8dz"

export const logo_url = wifi_api_url + "/static/"
