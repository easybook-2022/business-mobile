import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/schedules/`

export const getAppointmentInfo = id => {
	return axios.get(`${beginUrl}get_appointment_info/${id}`)
}

export const getReschedulingAppointments = data => {
  return axios.post(
    `${beginUrl}get_rescheduling_appointments`,
    data
  )
}

export const salonChangeAppointment = data => {
  return axios.post(
    `${beginUrl}salon_change_appointment`,
    data
  )
}

export const pushAppointments = data => {
  return axios.post(
    `${beginUrl}push_appointments`,
    data
  )
}

export const rebookAppointment = data => {
  return axios.post(
    `${beginUrl}rebook_appointment`,
    data
  )
}

export const cancelSchedule = data => {
	return axios.post(
		`${beginUrl}cancel_schedule`,
		data
	)
}

export const getAppointments = data => {
	return axios.post(
		`${beginUrl}get_appointments`,
		data
	)
}

export const getCartOrderers = id => {
	return axios.get(`${beginUrl}get_cart_orderers/${id}`)
}

export const getCartOrders = id => {
	return axios.get(`${beginUrl}get_cart_orders/${id}`)
}

export const bookWalkIn = data => {
  return axios.post(
    `${beginUrl}book_walk_in`,
    data
  )
}

export const removeBooking = data => {
  return axios.post(
    `${beginUrl}remove_booking`,
    data
  )
}

export const blockTime = data => {
  return axios.post(
    `${beginUrl}block_time`,
    data
  )
}

export const getOrders = data => {
	return axios.post(
		`${beginUrl}get_orders`,
		data
	)
}

export const doneService = id => {
  return axios.get(`${beginUrl}done_service/${id}`)
}
