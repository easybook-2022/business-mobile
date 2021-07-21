import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = LOCAL_API_URL

export const getRequests = (data) => {
	return axios.post(
		`${url}/appointments/get_requests`,
		data
	)
}

export const getRequestInfo = (id) => {
	return axios.get(`${url}/appointments/get_request_info/${id}`)
}

export const rescheduleRequest = (data) => {
	return axios.post(
		`${url}/appointments/reschedule_appointment`,
		data
	)
}

export const acceptRequest = (id) => {
	return axios.get(`${url}/appointments/accept_request/${id}`)
}

export const cancelRequest = (data) => {
	return axios.post(
		`${url}/appointments/cancel_request`,
		data
	)
}
