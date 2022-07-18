import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/products/`

export const getProductInfo = id => {
	return axios.get(`${beginUrl}get_product_info/${id}`)
}

export const addNewProduct = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg", size } = data.image

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("options", JSON.stringify(data.options))
	form.append("others", JSON.stringify(data.others))
	form.append("sizes", JSON.stringify(data.sizes))
	form.append("price", data.price)

	if (data.image.uri.includes("file")) {
		form.append("image", { uri, name, type })
    form.append("size", JSON.stringify(size))
	}

	return axios.post(
		`${beginUrl}add_product`,
		form
	)
}

export const updateProduct = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg", size } = data.image

	form.append("ownerid", data.ownerid)
	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("productid", data.productid)
	form.append("name", data.name)
	form.append("options", JSON.stringify(data.options))
	form.append("others", JSON.stringify(data.others))
	form.append("sizes", JSON.stringify(data.sizes))
	form.append("price", data.price)

	if (data.image.uri.includes("file")) {
		form.append("image", { uri, name, type })
    form.append("size", JSON.stringify(size))
	}

	return axios.post(
		`${beginUrl}update_product`,
		form
	)
}

export const removeProduct = (id) => {
	return axios.post(`${beginUrl}remove_product/${id}`)
}
