import axios from 'axios'
import { url } from '../../assets/info'

export const orderReady = data => {
	return axios.post(
		`${url}/carts/order_ready`,
		data
	)
}

export const receivePayment = data => {
	return axios.post(
		`${url}/carts/receive_payment`,
		data
	)
}
