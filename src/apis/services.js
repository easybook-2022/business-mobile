import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/services/`

export const getServices = data => {
	return axios.post(
		`${beginUrl}get_services`,
		data
	)
}

export const getServiceInfo = id => {
	return axios.get(`${beginUrl}get_service_info/${id}`)
}

export const addNewService = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg", size } = data.image

	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("price", data.price)

	if (data.image.uri.includes("file")) {
		form.append("image", { uri, name, type })
    form.append("size", JSON.stringify(size))
	}

	return axios.post(
		`${beginUrl}add_service`,
		form
	)
}

export const updateService = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg", size } = data.image

	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("serviceid", data.serviceid)
	form.append("name", data.name)
	form.append("price", data.price)

	if (data.image.uri.includes("file")) {
		form.append("image", { uri, name, type })
    form.append("size", JSON.stringify(size))
	}

	return axios.post(
		`${beginUrl}update_service`,
		form
	)
}

export const removeService = (id) => {
	return axios.get(`${beginUrl}remove_service/${id}`)
}
