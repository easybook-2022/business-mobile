import axios from 'axios'
import { url } from '../../assets/info'

export const getMenus = id => {
	return axios.get(`${url}/menus/get_menus/${id}`)
}

export const getRequests = () => {
	return axios.get(`${url}/menus/get_requests`)
}

export const addNewMenu = (data) => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg" } = data.image

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("parentmenuid", data.parentMenuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("permission", data.permission)

	if (data.image.uri) {
		form.append("image", { uri, name, type })
	}

	return axios.post(
		`${url}/menus/add_menu`,
		form
	)
}

export const removeMenu = id => {
	return axios.get(`${url}/menus/remove_menu/${id}`)
}

export const getMenuInfo = id => {
	return axios.get(`${url}/menus/get_menu_info/${id}`)
}

export const saveMenu = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg" } = data.image

	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("permission", data.permission)

	if (data.image.uri) {
		form.append("image", { uri, name, type })
	}

	return axios.post(
		`${url}/menus/save_menu`,
		form
	)
}
