import axios from 'axios'
import { url } from '../../assets/info'

export const getRequests = id => {
	return axios.get(`${url}/schedules/get_requests/${id}`)
}

export const getAppointmentInfo = id => {
	return axios.get(`${url}/schedules/get_appointment_info/${id}`)
}

export const getReservationInfo = id => {
	return axios.get(`${url}/schedules/get_reservation_info/${id}`)
}

export const rescheduleAppointment = data => {
	return axios.post(
		`${url}/schedules/reschedule_appointment`,
		data
	)
}

export const rescheduleReservation = data => {
	return axios.post(
		`${url}/schedules/reschedule_reservation`,
		data
	)
}

export const acceptRequest = data => {
	return axios.post(
		`${url}/schedules/accept_request`,
		data
	)
}

export const cancelRequest = data => {
	return axios.post(
		`${url}/schedules/cancel_request`,
		data
	)
}

export const cancelService = data => {
	return axios.post(
		`${url}/schedules/cancel_service`,
		data
	)
}

export const getAppointments = id => {
	return axios.get(`${url}/schedules/get_appointments/${id}`)
}

export const searchCustomers = username => {
	return axios.get(`${url}/schedules/search_customers/${username}`)
}

export const getCartOrderers = id => {
	return axios.get(`${url}/schedules/get_cart_orderers/${id}`)
}

export const getCartOrders = id => {
	return axios.get(`${url}/schedules/get_cart_orders/${id}`)
}

export const getReservations = id => {
	return axios.get(`${url}/schedules/get_reservations/${id}`)
}

export const getScheduleInfo = id => {
	return axios.get(`${url}/schedules/get_schedule_info/${id}`)
}

export const getDiningOrders = id => {
	return axios.get(`${url}/schedules/get_dining_orders/${id}`)
}

export const getDinersOrders = id => {
	return axios.get(`${url}/schedules/get_diners_orders/${id}`)
}

export const seeUserOrders = data => {
	return axios.post(
		`${url}/schedules/see_user_orders`,
		data
	)
}

export const deliverRound = data => {
	return axios.post(
		`${url}/schedules/deliver_round`,
		data
	)
}

export const doneDining = id => {
	return axios.get(`${url}/schedules/done_dining/${id}`)
}

export const getDinersPayments = data => {
	return axios.post(
		`${url}/schedules/get_diners_payments`,
		data
	)
}

export const doneService = id => {
	return axios.get(`${url}/schedules/done_service/${id}`)
}
