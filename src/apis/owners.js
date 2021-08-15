import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const registerUser = data => {
	return axios.post(
		`${wifi_api_url}/owners/register`,
		data
	)
}

export const loginUser = data => {
	return axios.post(
		`${wifi_api_url}/owners/login`,
		data
	)
}

export const addOwner = data => {
	return axios.post(
		`${wifi_api_url}/owners/add_owner`,
		data
	)
}

export const updateOwner = data => {
	return axios.post(
		`${wifi_api_url}/owners/update_owner`,
		data
	)
}

export const addBankaccount = data => {
	return axios.post(
		`${wifi_api_url}/owners/add_bankaccount`,
		data
	)
}

export const updateBankaccount = data => {
	return axios.post(
		`${wifi_api_url}/owners/update_bankaccount`,
		data
	)
}

export const getAccounts = locationid => {
	return axios.get(`${wifi_api_url}/owners/get_accounts/${locationid}`)
}

export const getBankaccounts = locationid => {
	return axios.get(`${wifi_api_url}/owners/get_bankaccounts/${locationid}`)
}

export const setBankaccountDefault = data => {
	return axios.post(
		`${wifi_api_url}/owners/set_bankaccountdefault`,
		data
	)
}

export const getBankaccountInfo = data => {
	return axios.post(
		`${wifi_api_url}/owners/get_bankaccount_info`,
		data
	)
}

export const deleteTheBankAccount = data => {
	return axios.post(
		`${wifi_api_url}/owners/delete_bankaccount`,
		data
	)
}
