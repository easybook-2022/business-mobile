import axios from 'axios'
import { LOCAL_API_URL, WIFI_API_URL } from "@env"

const url = WIFI_API_URL

export const getRequests = (data) => {
	return axios.post(
		`${WIFI_API_URL}/schedules/get_requests`,
		data
	)
}

export const getAppointmentInfo = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_appointment_info/${id}`)
}

export const getReservationInfo = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_reservation_info/${id}`)
}

export const rescheduleAppointment = (data) => {
	return axios.post(
		`${WIFI_API_URL}/schedules/reschedule_appointment`,
		data
	)
}

export const rescheduleReservation = (data) => {
	return axios.post(
		`${WIFI_API_URL}/schedules/reschedule_reservation`,
		data
	)
}

export const acceptRequest = data => {
	return axios.post(
		`${WIFI_API_URL}/schedules/accept_request`,
		data
	)
}

export const cancelRequest = (data) => {
	return axios.post(
		`${WIFI_API_URL}/schedules/cancel_request`,
		data
	)
}

export const getAppointments = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_appointments/${id}`)
}

export const getReservations = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_reservations/${id}`)
}

export const getScheduleInfo = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_schedule_info/${id}`)
}

export const getOrders = id => {
	return axios.get(`${WIFI_API_URL}/schedules/get_orders/${id}`)
}
