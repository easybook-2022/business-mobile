import axios from 'axios'
import { url } from '../../assets/info'

export const getRequests = data => {
	return axios.post(
		`${url}/schedules/get_requests`,
		data
	)
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

export const getAppointments = data => {
	return axios.post(
		`${url}/schedules/get_appointments`,
		data
	)
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

export const cancelReservation = id => {
	return axios.get(`${url}/schedules/cancel_reservation/${id}`)
}

export const cancelAppointment = id => {
	return axios.get(`${url}/schedules/cancel_appointment/${id}`)
}

export const requestPayment = data => {
	return axios.post(
		`${url}/schedules/request_payment`,
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

export const receiveEpayment = data => {
	return axios.post(
		`${url}/schedules/receive_epayment`,
		data
	)
}

export const receiveInpersonpayment = data => {
	return axios.post(
		`${url}/schedules/receive_inpersonpayment`,
		data
	)
}

export const canServeDiners = id => {
	return axios.get(`${url}/schedules/can_serve_diners/${id}`)
}
