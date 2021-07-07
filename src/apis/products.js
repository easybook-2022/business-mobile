import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = `${WIFI_API_URL}/products/`

export const getProducts = (data) => {
	return axios.post(
		`${url}get_products`,
		data
	)
}

export const addNewProduct = (data) => {
	const form = new FormData()

	form.append("userid", data.userid)
	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })
	form.append("options", JSON.stringify(data.options))
	form.append("price", data.price)

	return axios.post(
		`${url}add_product`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const removeProduct = (id) => {
	return axios.post(`${url}remove_product/${id}`)
}
