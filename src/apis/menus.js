import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = LOCAL_API_URL

export const getMenus = (data) => {
	return axios.post(
		`${url}/menus/get_menus`,
		data
	)
}

export const removeMenu = (id) => {
	return axios.post(`${url}/menus/remove_menu/${id}`)
}

export const getRequests = () => {
	return axios.get(`${url}/menus/get_requests`)
}

export const getAppointments = () => {
	return axios.get(`${url}/menus/get_appointments`)
}

export const addNewMenu = (data) => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("parentmenuid", data.parentMenuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })

	return axios.post(
		`${url}/menus/add_menu`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}
