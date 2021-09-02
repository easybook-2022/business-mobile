import axios from 'axios'
import { url } from '../../assets/info'

export const registerUser = data => {
	return axios.post(
		`${url}/owners/register`,
		data
	)
}

export const loginUser = data => {
	return axios.post(
		`${url}/owners/login`,
		data
	)
}

export const addOwner = data => {
	return axios.post(
		`${url}/owners/add_owner`,
		data
	)
}

export const updateOwner = data => {
	return axios.post(
		`${url}/owners/update_owner`,
		data
	)
}

export const addBankaccount = data => {
	return axios.post(
		`${url}/owners/add_bankaccount`,
		data
	)
}

export const updateBankaccount = data => {
	return axios.post(
		`${url}/owners/update_bankaccount`,
		data
	)
}

export const getAccounts = locationid => {
	return axios.get(`${url}/owners/get_accounts/${locationid}`)
}

export const getBankaccounts = locationid => {
	return axios.get(`${url}/owners/get_bankaccounts/${locationid}`)
}

export const setBankaccountDefault = data => {
	return axios.post(
		`${url}/owners/set_bankaccountdefault`,
		data
	)
}

export const getBankaccountInfo = data => {
	return axios.post(
		`${url}/owners/get_bankaccount_info`,
		data
	)
}

export const deleteTheBankAccount = data => {
	return axios.post(
		`${url}/owners/delete_bankaccount`,
		data
	)
}

export const getCode = phonenumber => {
	return axios.get(`${url}/owners/get_reset_code/${phonenumber}`)
}

export const resetPassword = data => {
	return axios.post(
		`${url}/owners/reset_password`,
		data
	)
}
