import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = `${WIFI_API_URL}/menus/`

export const requestTime = (data) => {
	return axios.post(
		`${url}request_time`,
		data
	)
}

export const getMenus = (data) => {
	return axios.post(
		`${url}get_menus`,
		data
	)
}

export const removeMenu = (data) => {
	return axios.post(
		`${url}remove_menu`,
		data
	)
}

export const getRequests = () => {
	return axios.get(`${url}get_requests`)
}

export const getAppointments = () => {
	return axios.get(`${url}get_appointments`)
}

export const acceptRequest = () => {
	return axios.post(`${url}accept_request`)
}

export const addNewMenu = (data) => {
	return axios.post(
		`${url}add_menu`,
		data
	)
}
