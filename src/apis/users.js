import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const registerUser = (data) => {
	return axios.post(
		`${WIFI_API_URL}/users/register`,
		data
	)
}

export const loginUser = (data) => {
	return axios.post(
		`${WIFI_API_URL}/users/login`,
		data
	)
}

export const addBankaccount = (data) => {
	return axios.post(
		`${WIFI_API_URL}/users/add_bankaccount`,
		data
	)
}

export const getAccount = (accountid) => {
	return axios.get(
		`${WIFI_API_URL}/users/get_account/${accountid}`
	)
}

export const getBankaccount = (bankaccountid) => {
	return axios.get(
		`${WIFI_API_URL}/users/get_bankaccount/${bankaccountid}`
	)
}
