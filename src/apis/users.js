import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = LOCAL_API_URL

export const registerUser = (data) => {
	return axios.post(
		`${url}/owners/register`,
		data
	)
}

export const loginUser = (data) => {
	return axios.post(
		`${url}/owners/login`,
		data
	)
}

export const addBankaccount = (data) => {
	return axios.post(
		`${url}/owners/add_bankaccount`,
		data
	)
}

export const getAccount = (accountid) => {
	return axios.get(
		`${url}/owners/get_account/${accountid}`
	)
}

export const getBankaccount = (bankaccountid) => {
	return axios.get(
		`${url}/owners/get_bankaccount/${bankaccountid}`
	)
}
