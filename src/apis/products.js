import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/products/`

export const getProductInfo = data => {
  const { productid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_product_info/${productid}`,
    { cancelToken }
  )
}

export const addNewProduct = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg", size } = data.image

	form.append("locationid", data.locationid)
	form.append("menuid", data.menuid)
	form.append("name", data.name)
	form.append("options", JSON.stringify(data.options))
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

	form.append("locationid", data.locationid)
  form.append("type", data.type)
	form.append("menuid", data.menuid)
	form.append("productid", data.productid)

  switch (data.type) {
    case "name":
      form.append("name", data.name)

      break;
    case "photo":
      const { uri, name, type = "image/jpeg", size } = data.image
      
      if (data.image.uri.includes("file")) {
        form.append("image", { uri, name, type })
        form.append("size", JSON.stringify(size))
      } else if (data.image.remove == true) {
        form.append("removeImage", true)
      }

      break;
    case "price":
      form.append("price", data.price)

      break;
    case "options":
      form.append("options", JSON.stringify(data.options))

      break;
  }

	return axios.post(
		`${beginUrl}update_product`,
		form
	)
}

export const removeProduct = data => {
  const { productid, cancelToken } = data

	return axios.post(
    `${beginUrl}remove_product/${productid}`,
    { cancelToken }
  )
}
