import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const getServices = (data) => {
	return axios.post(
		`${WIFI_API_URL}/services/get_services`,
		data
	)
}

export const addNewService = (data) => {
	const form = new FormData()

	form.append("userid", data.userid)
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

export const removeService = (id) => {
	return axios.get(`${WIFI_API_URL}/services/remove_service/${id}`)
}