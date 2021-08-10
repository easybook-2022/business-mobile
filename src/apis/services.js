import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const getServices = data => {
	return axios.post(
		`${WIFI_API_URL}/services/get_services`,
		data
	)
}

export const getServiceInfo = id => {
	return axios.get(`${WIFI_API_URL}/services/get_service_info/${id}`)
}

export const addNewService = data => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })
	form.append("price", data.price)
	form.append("duration", data.duration)

	return axios.post(
		`${WIFI_API_URL}/services/add_service`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const updateService = data => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("serviceid", data.serviceid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })
	form.append("price", data.price)
	form.append("duration", data.duration)

	return axios.post(
		`${WIFI_API_URL}/services/update_service`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const removeService = (id) => {
	return axios.get(`${WIFI_API_URL}/services/remove_service/${id}`)
}
