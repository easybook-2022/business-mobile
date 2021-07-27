import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const getMenus = (data) => {
	return axios.post(
		`${WIFI_API_URL}/menus/get_menus`,
		data
	)
}

export const removeMenu = id => {
	return axios.post(`${WIFI_API_URL}/menus/remove_menu/${id}`)
}

export const getRequests = () => {
	return axios.get(`${WIFI_API_URL}/menus/get_requests`)
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
		`${WIFI_API_URL}/menus/add_menu`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}
