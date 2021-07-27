import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const getProducts = data => {
	return axios.post(
		`${WIFI_API_URL}/products/get_products`,
		data
	)
}

export const addNewProduct = data => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })
	form.append("options", JSON.stringify(data.options))
	form.append("price", data.price)

	return axios.post(
		`${WIFI_API_URL}/products/add_product`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const removeProduct = (id) => {
	return axios.post(`${WIFI_API_URL}/products/remove_product/${id}`)
}
