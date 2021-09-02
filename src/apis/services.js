import axios from 'axios'
import { url } from '../../assets/info'

export const getServices = data => {
	return axios.post(
		`${url}/services/get_services`,
		data
	)
}

export const getServiceInfo = id => {
	return axios.get(`${url}/services/get_service_info/${id}`)
}

export const addNewService = data => {
	const form = new FormData()

	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })
	form.append("price", data.price)
	form.append("duration", data.duration)

	return axios.post(
		`${url}/services/add_service`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const updateService = data => {
	const form = new FormData()

	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("serviceid", data.serviceid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })
	form.append("price", data.price)
	form.append("duration", data.duration)

	return axios.post(
		`${url}/services/update_service`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const removeService = (id) => {
	return axios.get(`${url}/services/remove_service/${id}`)
}
