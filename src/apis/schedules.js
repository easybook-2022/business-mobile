import axios from 'axios'
import { url } from '../../assets/info'

export const getAppointmentInfo = id => {
	return axios.get(`${url}/schedules/get_appointment_info/${id}`)
}

export const salonChangeAppointment = data => {
  return axios.post(
    `${url}/schedules/salon_change_appointment`,
    data
  )
}

export const cancelSchedule = data => {
	return axios.post(
		`${url}/schedules/cancel_schedule`,
		data
	)
}

export const getAppointments = data => {
	return axios.post(
		`${url}/schedules/get_appointments`,
		data
	)
}

export const getCartOrderers = id => {
	return axios.get(`${url}/schedules/get_cart_orderers/${id}`)
}

export const getCartOrders = id => {
	return axios.get(`${url}/schedules/get_cart_orders/${id}`)
}

export const bookWalkIn = data => {
  return axios.post(
    `${url}/schedules/book_walk_in`,
    data
  )
}

export const removeBooking = data => {
  return axios.post(
    `${url}/schedules/remove_booking`,
    data
  )
}

export const getOrders = data => {
	return axios.post(
		`${url}/schedules/get_orders`,
		data
	)
}

export const doneService = id => {
  return axios.get(`${url}/schedules/done_service/${id}`)
}
