import axios from 'axios'
import { url } from '../../assets/info'

export const getAppointmentInfo = id => {
	return axios.get(`${url}/schedules/get_appointment_info/${id}`)
}

export const rescheduleAppointment = data => {
	return axios.post(
		`${url}/schedules/reschedule_appointment`,
		data
	)
}

export const closeSchedule = id => {
  return axios.get(`${url}/schedules/close_schedule/${id}`)
}

export const cancelSchedule = data => {
	return axios.post(
		`${url}/schedules/cancel_schedule`,
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

export const getScheduleInfo = id => {
	return axios.get(`${url}/schedules/get_schedule_info/${id}`)
}

export const seeUserOrders = data => {
	return axios.post(
		`${url}/schedules/see_user_orders`,
		data
	)
}

export const doneService = id => {
  return axios.get(`${url}/schedules/done_service/${id}`)
}
