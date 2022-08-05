import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/locations/`

export const registerLocation = data => {
	return axios.post(
		`${beginUrl}register_location`, 
		data
	)
}

export const loginLocation = data => {
	return axios.post(
		`${beginUrl}login_location`,
		data
	)
}

export const setupLocation = data => {
  const form = new FormData()
  const { uri, name, type = "image/jpeg", size } = data.logo  

  form.append("storeName", data.storeName)
  form.append("phonenumber", data.phonenumber)
  form.append("hours", JSON.stringify(data.hours))
  form.append("type", data.type)
  form.append("longitude", data.longitude)
  form.append("latitude", data.latitude)
  form.append("ownerid", data.ownerid)

  if (data.logo.uri.includes("file")) {
    form.append("logo", { uri, name, type })
    form.append("size", JSON.stringify(size))
  }
  
  form.append("size", JSON.stringify(size))

  return axios.post(
    `${beginUrl}setup_location`, 
    form
  )
}

export const updateInformation = data => {
  return axios.post(
    `${beginUrl}update_information`,
    data
  )
}

export const updateAddress = data => {
	return axios.post(
		`${beginUrl}update_address`,
		data
	)
}

export const updateLogo = data => {
  const form = new FormData()
  const { uri, name, type = "image/jpeg", size } = data.logo

  form.append("id", data.id)

  if (data.logo.uri.includes("file")) {
    form.append("logo", { uri, name, type })
    form.append("size", JSON.stringify(size))
  }

  return axios.post(
    `${beginUrl}update_logo`,
    form
  )
}

export const fetchNumRequests = id => {
	return axios.get(`${beginUrl}fetch_num_requests/${id}`)
}

export const fetchNumAppointments = id => {
	return axios.get(`${beginUrl}fetch_num_appointments/${id}`)
}

export const fetchNumCartOrderers = id => {
	return axios.get(`${beginUrl}fetch_num_cartorderers/${id}`)
}

export const fetchNumorders = id => {
	return axios.get(`${beginUrl}fetch_num_orders/${id}`)
}

export const updateLocationHours = data => {
	return axios.post(
		`${beginUrl}update_location_hours`,
		data
	)
}

export const setReceiveType = data => {
  return axios.post(
    `${beginUrl}set_receive_type`,
    data
  )
}

export const getDayHours = data => {
  return axios.post(
    `${beginUrl}get_day_hours`,
    data
  )
}

export const getLocationHours = id => {
	return axios.get(`${beginUrl}get_location_hours/${id}`)
}

export const getAllLocations = id => {
  return axios.get(`${beginUrl}get_all_locations/${id}`)
}

export const getLocationProfile = data => {
	return axios.post(
    `${url}/locations/get_location_profile`,
    data
  )
}

export const getIncome = id => {
  return axios.get(`${beginUrl}/get_income/${id}`)
}
