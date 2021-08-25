import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const registerLocation = data => {
	return axios.post(
		`${wifi_api_url}/locations/register_location`, 
		data
	)
}

export const loginLocation = data => {
	return axios.post(
		`${wifi_api_url}/locations/login_location`,
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
	form.append("time", data.time)
	form.append("ipAddress", data.ipAddress)

	return axios.post(
		`${wifi_api_url}/locations/setup_location`, 
		form, 
		{ headers: { 
			'Content-Type': 'multipart/form-data' 
		}}
	)
}

export const updateLocation = data => {
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
	form.append("time", data.time)
	form.append("ipAddress", data.ipAddress)

	return axios.post(
		`${wifi_api_url}/locations/update_location`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const fetchNumRequests = id => {
	return axios.get(`${wifi_api_url}/locations/fetch_num_requests/${id}`)
}

export const fetchNumAppointments = id => {
	return axios.get(`${wifi_api_url}/locations/fetch_num_appointments/${id}`)
}

export const fetchNumReservations = id => {
	return axios.get(`${wifi_api_url}/locations/fetch_num_reservations/${id}`)
}

export const fetchNumorders = id => {
	return axios.get(`${wifi_api_url}/locations/fetch_num_orders/${id}`)
}

export const setLocationType = data => {
	return axios.post(
		`${wifi_api_url}/locations/set_type`,
		data
	)
}

export const setLocationHours = data => {
	return axios.post(
		`${wifi_api_url}/locations/set_hours`,
		data
	)
}

export const getInfo = data => {
	return axios.post(
		`${wifi_api_url}/locations/get_info`,
		data
	)
}

export const changeLocationState = id => {
	return axios.get(`${wifi_api_url}/locations/change_location_state/${id}`)
}

export const getLocationHours = data => {
	return axios.post(
		`${wifi_api_url}/locations/get_hours`,
		data
	)
}

export const getLocationProfile = data => {
	return axios.post(
		`${wifi_api_url}/locations/get_location_profile`,
		data
	)
}
