import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = `${WIFI_API_URL}/locations/`

export const registerLocation = (data) => {
	return axios.post(
		`${url}register_location`, 
		data
	)
}

export const loginLocation = async(data) => {
	return axios.post(
		`${url}login_location`,
		data
	)
}

export const setupLocation = (data) => {
	const form = new FormData()

	form.append("storeName", data.storeName)
	form.append("addressOne", data.addressOne)
	form.append("addressTwo", data.addressTwo)
	form.append("city", data.city)
	form.append("province", data.province)
	form.append("postalcode", data.postalcode)
	form.append("logo", { uri: data.logo.uri, name: data.logo.name })
	form.append("longitude", data.longitude)
	form.append("latitude", data.latitude)
	form.append("userid", data.userid)

	return axios.post(
		`${url}setup_location`, 
		form, 
		{ headers: { 
			'Content-Type': 'multipart/form-data' 
		}}
	)
}

export const getInfo = (data) => {
	return axios.post(
		`${url}get_info`,
		data
	)
}
