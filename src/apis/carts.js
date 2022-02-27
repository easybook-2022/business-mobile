import axios from 'axios'
import { url } from '../../assets/info'

export const orderDone = data => {
	return axios.post(
		`${url}/carts/order_done`,
		data
	)
}
