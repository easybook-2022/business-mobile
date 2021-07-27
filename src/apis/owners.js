import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

export const registerUser = data => {
	return axios.post(
		`${WIFI_API_URL}/owners/register`,
		data
	)
}

export const loginUser = data => {
	return axios.post(
		`${WIFI_API_URL}/owners/login`,
		data
	)
}

export const addOwner = data => {
	return axios.post(
		`${WIFI_API_URL}/owners/add_owner`,
		data
	)
}

export const updateOwner = data => {
	return axios.post(
		`${WIFI_API_URL}/owners/update_owner`,
		data
	)
}

export const addBankaccount = data => {
	return axios.post(
		`${WIFI_API_URL}/owners/add_bankaccount`,
		data
	)
}

export const getAccounts = locationid => {
	return axios.get(`${WIFI_API_URL}/owners/get_accounts/${locationid}`)
}

export const getBankaccounts = locationid => {
	return axios.get(`${WIFI_API_URL}/owners/get_bankaccounts/${locationid}`)
}

export const setBankaccountDefault = data => {
	return axios.post(
		`${WIFI_API_URL}/owners/set_bankaccountdefault`,
		data
	)
}

export const getBankaccountInfo = data => {
	return axios.post(
		`${WIFI_API_URL}/owners/get_bankaccount_info`,
		data
	)
}

export const deleteTheBankAccount = data => {
	return axios.post(
		`${WIFI_API_URL}/owners/delete_bankaccount`,
		data
	)
}
