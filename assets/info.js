import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL
const stores = [
	{
		storeName: "TopCut",
		phonenumber: "4162037200",
		addressOne: "9 King St E",
		addressTwo: "",
		city: "Toronto",
		province: "ON",
		postalcode: "M5C 3C5"
	},
	{
		storeName: "Headlines Salon",
		phonenumber: "9056420336",
		addressOne: "6328 Main St",
		addressTwo: "",
		city: "Whitchurch-Stouffville",
		province: "ON",
		postalcode: "L4A 1G9"
	},
	{
		storeName: "Hung Hair Salon",
		phonenumber: "4164621484",
		addressOne: "642 Gerrard St E",
		addressTwo: "",
		city: "Toronto",
		province: "ON",
		postalcode: "M4M 1Y3"
	},
	{
		storeName: "Gatsby Studio Salon & Spa",
		phonenumber: "9054779666",
		addressOne: "5000 Hwy 7",
		addressTwo: "",
		city: "Markham",
		province: "ON",
		postalcode: "L3R 4M9"
	},
	{
		storeName: "The One Nail Lounge & Spa",
		phonenumber: "9058582828",
		addressOne: "775 Britannia Rd W",
		addressTwo: "Unit # 9",
		city: "Mississauga",
		province: "ON",
		postalcode: "L5V 2Y1"
	},
	{
		storeName: "I Love Pho 2",
		phonenumber: "9055668898",
		addressOne: "1248 Dundas St E",
		addressTwo: "",
		city: "Mississauga",
		province: "ON",
		postalcode: "L4Y 2C5"
	}
]
const { storeName, phonenumber, addressOne, addressTwo, city, province, postalcode } = stores[0]

export const info = {
	cellnumber: phonenumber,
	password: "password",
	storeName: storeName,
	phonenumber: phonenumber,
	addressOne: addressOne,
	addressTwo: addressTwo,
	city: city,
	province: province,
	postalcode: postalcode
}

export const logo_url = url + "/static/"
