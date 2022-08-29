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

export const updateLocationHours = data => {
	return axios.post(
		`${beginUrl}update_location_hours`,
		data
	)
}

export const getLogins = data => { // for restaurants only
  const { locationid, cancelToken } = data

  return axios.get(
    `${beginUrl}/get_logins/${locationid}`,
    { cancelToken }
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

export const getLocationHours = data => {
  const { locationid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_location_hours/${locationid}`,
    { cancelToken }
  )
}

export const getAllLocations = data => {
  const { ownerid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_all_locations/${ownerid}`,
    { cancelToken }
  )
}

export const getLocationProfile = data => {
	return axios.post(
    `${url}/locations/get_location_profile`,
    data
  )
}

export const getRestaurantIncome = data => {
  const { locationid, cancelToken } = data

  return axios.get(
    `${beginUrl}/get_restaurant_income/${locationid}`,
    { cancelToken }
  )
}

export const getSalonIncome = data => {
  const { id, cancelToken } = data

  return axios.get(
    `${beginUrl}/get_salon_income/${id}`,
    { cancelToken }
  )
}
