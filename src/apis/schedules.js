import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL

export const getRequests = (data) => {
	return axios.post(
		`${url}/schedules/get_requests`,
		data
	)
}

export const getAppointmentInfo = (id) => {
	return axios.get(`${url}/schedules/get_appointment_info/${id}`)
}

export const getReservationInfo = (id) => {
	return axios.get(`${url}/schedules/get_reservation_info/${id}`)
}

export const rescheduleAppointment = (data) => {
	return axios.post(
		`${url}/schedules/reschedule_appointment`,
		data
	)
}

export const rescheduleReservation = (data) => {
	return axios.post(
		`${url}/schedules/reschedule_reservation`,
		data
	)
}

export const acceptRequest = (id) => {
	return axios.get(`${url}/schedules/accept_request/${id}`)
}

export const cancelRequest = (data) => {
	return axios.post(
		`${url}/schedules/cancel_request`,
		data
	)
}

export const getAppointments = (id) => {
	return axios.get(`${url}/schedules/get_appointments/${id}`)
}

export const getReservations = (id) => {
	return axios.get(`${url}/schedules/get_reservations/${id}`)
}
