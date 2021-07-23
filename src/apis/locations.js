import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL

export const registerLocation = data => {
	return axios.post(
		`${url}/locations/register_location`, 
		data
	)
}

export const loginLocation = async(data) => {
	return axios.post(
		`${url}/locations/login_location`,
		data
	)
}

export const setupLocation = data => {
	const form = new FormData()

	form.append("storeName", data.storeName)
	form.append("phonenumber", data.phonenumber)
	form.append("addressOne", data.addressOne)
	form.append("addressTwo", data.addressTwo)
	form.append("city", data.city)
	form.append("province", data.province)
	form.append("postalcode", data.postalcode)
	form.append("logo", { uri: data.logo.uri, name: data.logo.name })
	form.append("longitude", data.longitude)
	form.append("latitude", data.latitude)
	form.append("ownerid", data.ownerid)

	return axios.post(
		`${url}/locations/setup_location`, 
		form, 
		{ headers: { 
			'Content-Type': 'multipart/form-data' 
		}}
	)
}

export const fetchNumRequests = id => {
	return axios.get(`${url}/locations/fetch_num_requests/${id}`)
}

export const fetchNumAppointments = id => {
	return axios.get(`${url}/locations/fetch_num_appointments/${id}`)
}

export const fetchNumReservations = id => {
	return axios.get(`${url}/locations/fetch_num_reservations/${id}`)
}

export const setLocationType = data => {
	return axios.post(
		`${url}/locations/set_type`,
		data
	)
}

export const setLocationHours = data => {
	return axios.post(
		`${url}/locations/set_hours`,
		data
	)
}

export const getInfo = data => {
	return axios.post(
		`${url}/locations/get_info`,
		data
	)
}

export const getLocationHours = data => {
	return axios.post(
		`${url}/locations/get_hours`,
		data
	)
}
