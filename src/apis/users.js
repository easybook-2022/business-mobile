import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = `${WIFI_API_URL}/users/`

export const registerUser = (data) => {
	return axios.post(
		`${url}register`,
		data
	)
}

export const loginUser = (data) => {
	return axios.post(
		`${url}login`,
		data
	)
}

export const addBankaccount = (data) => {
	return axios.post(
		`${url}add_bankaccount`,
		data
	)
}

export const getAccount = (accountid) => {
	return axios.get(
		`${url}get_account/${accountid}`
	)
}

export const getBankaccount = (bankaccountid) => {
	return axios.get(
		`${url}/get_bankaccount/${bankaccountid}`
	)
}
