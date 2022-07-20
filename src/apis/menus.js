import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/menus/`

export const getMenus = id => {
	return axios.get(`${beginUrl}get_menus/${id}`)
}

export const addNewMenu = (data) => {
	const form = new FormData()
  const { uri, name, type = "image/jpeg", size } = data.image

  form.append("ownerid", data.ownerid)
  form.append("locationid", data.locationid)
  form.append("parentmenuid", data.parentMenuid)
  form.append("name", data.name)

  if (data.image.uri.includes("file")) {
    form.append("image", { uri, name, type })
    form.append("size", JSON.stringify(size))
  }

  return axios.post(
    `${beginUrl}add_menu`,
    form
  )
}

export const removeMenu = id => {
	return axios.get(`${beginUrl}remove_menu/${id}`)
}

export const getMenuInfo = id => {
	return axios.get(`${beginUrl}get_menu_info/${id}`)
}

export const saveMenu = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg", size } = data.image

	form.append("menuid", data.menuid)
	form.append("name", data.name)

	if (data.image.uri.includes("file")) {
		form.append("image", { uri, name, type })
    form.append("size", JSON.stringify(size))
	}

	return axios.post(
		`${beginUrl}save_menu`,
		form
	)
}

export const uploadMenu = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg" } = data.image

	form.append("locationid", data.locationid)
	form.append("image", { uri, name, type })
  form.append("size", JSON.stringify(data.size))

	return axios.post(
		`${beginUrl}upload_menu`,
		form
	)
}

export const deleteMenu = data => {
	return axios.post(
		`${beginUrl}delete_menu`,
		data
	)
}
