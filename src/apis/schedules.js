import axios from 'axios'
import { local_api_url, wifi_api_url } from '../../assets/info'

export const getRequests = (data) => {
	return axios.post(
		`${wifi_api_url}/schedules/get_requests`,
		data
	)
}

export const getAppointmentInfo = id => {
	return axios.get(`${wifi_api_url}/schedules/get_appointment_info/${id}`)
}

export const getReservationInfo = id => {
	return axios.get(`${wifi_api_url}/schedules/get_reservation_info/${id}`)
}

export const rescheduleAppointment = (data) => {
	return axios.post(
		`${wifi_api_url}/schedules/reschedule_appointment`,
		data
	)
}

export const rescheduleReservation = (data) => {
	return axios.post(
		`${wifi_api_url}/schedules/reschedule_reservation`,
		data
	)
}

export const acceptRequest = data => {
	return axios.post(
		`${wifi_api_url}/schedules/accept_request`,
		data
	)
}

export const cancelRequest = (data) => {
	return axios.post(
		`${wifi_api_url}/schedules/cancel_request`,
		data
	)
}

export const getAppointments = id => {
	return axios.get(`${wifi_api_url}/schedules/get_appointments/${id}`)
}

export const getReservations = id => {
	return axios.get(`${wifi_api_url}/schedules/get_reservations/${id}`)
}

export const getScheduleInfo = id => {
	return axios.get(`${wifi_api_url}/schedules/get_schedule_info/${id}`)
}

export const getOrders = id => {
	return axios.get(`${wifi_api_url}/schedules/get_orders/${id}`)
}
