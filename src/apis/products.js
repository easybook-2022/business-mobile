import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const getProducts = data => {
	return axios.post(
		`${wifi_api_url}/products/get_products`,
		data
	)
}

export const getProductInfo = id => {
	return axios.get(`${wifi_api_url}/products/get_product_info/${id}`)
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
	form.append("others", JSON.stringify(data.others))
	form.append("sizes", JSON.stringify(data.sizes))
	form.append("price", data.price)

	return axios.post(
		`${wifi_api_url}/products/add_product`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const updateProduct = data => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("productid", data.productid)
	form.append("name", data.name)
	form.append("info", data.info)
	form.append("image", { uri: data.image.uri, name: data.image.name })
	form.append("options", JSON.stringify(data.options))
	form.append("others", JSON.stringify(data.others))
	form.append("sizes", JSON.stringify(data.sizes))
	form.append("price", data.price)

	return axios.post(
		`${wifi_api_url}/products/update_product`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const removeProduct = (id) => {
	return axios.post(`${wifi_api_url}/products/remove_product/${id}`)
}
