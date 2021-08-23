import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const getMenus = (data) => {
	return axios.post(
		`${wifi_api_url}/menus/get_menus`,
		data
	)
}

export const getRequests = () => {
	return axios.get(`${wifi_api_url}/menus/get_requests`)
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
		`${wifi_api_url}/menus/add_menu`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const removeMenu = id => {
	return axios.get(`${wifi_api_url}/menus/remove_menu/${id}`)
}

export const getMenuInfo = id => {
	return axios.get(`${wifi_api_url}/menus/get_menu_info/${id}`)
}

export const saveMenu = data => {
	const form = new FormData()

	form.append("id", data.id)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })

	return axios.post(
		`${wifi_api_url}/menus/save_menu`,
		form,
		{ headers: { 
			'Content-Type': 'multipart/form-data' 
		}}
	)
}
