import axios from 'axios'
import { url } from '../../assets/info'

export const verifyUser = cellnumber => {
	return axios.get(`${url}/owners/verify/${cellnumber}`)
}

export const registerUser = data => {
	const form = new FormData()

	form.append("username", data.username)
	form.append("cellnumber", data.cellnumber)
	form.append("password", data.password)
	form.append("confirmPassword", data.confirmPassword)

	if (data.profile.uri) {
		form.append("profile", { uri: data.profile.uri, name: data.profile.name })
	}

	return axios.post(
		`${url}/owners/register`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const loginUser = data => {
	return axios.post(
		`${url}/owners/login`,
		data
	)
}

export const addOwner = data => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("cellnumber", data.cellnumber)
	form.append("username", data.username)
	form.append("password", data.password)
	form.append("confirmPassword", data.confirmPassword)

	if (data.profile.uri) {
		form.append("profile", { uri: data.profile.uri, name: data.profile.name })
	}

	return axios.post(
		`${url}/owners/add_owner`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const update = data => {
	const form = new FormData()

	form.append("ownerid", data.ownerid)
	form.append("cellnumber", data.cellnumber)
	form.append("username", data.username)
	form.append("password", data.password)
	form.append("confirmPassword", data.confirmPassword)

	if (data.profile.uri) {
		form.append("profile", { uri: data.profile.uri, name: data.profile.name })
	}

	return axios.post(
		`${url}/owners/update`,
		form,
		{ headers: {
			'Content-Type': 'multipart/form-data'
		}}
	)
}

export const updateNotificationToken = data => {
	return axios.post(
		`${url}/owners/update_notification_token`,
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

export const getCode = cellnumber => {
	return axios.get(`${url}/owners/get_reset_code/${cellnumber}`)
}

export const resetPassword = data => {
	return axios.post(
		`${url}/owners/reset_password`,
		data
	)
}
