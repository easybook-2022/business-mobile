import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/owners/`

export const verifyUser = data => {
  const { cellnumber, cancelToken } = data

	return axios.get(
    `${beginUrl}owner_verify/${cellnumber}`,
    { cancelToken }
  )
}

export const updateLogins = data => {
  return axios.post(
    `${beginUrl}update_logins`,
    data
  )
}

export const loginUser = data => {
	return axios.post(
		`${beginUrl}owner_login`,
		data
	)
}

export const logoutUser = data => {
  const { ownerid, cancelToken } = data

  return axios.get(
    `${beginUrl}owner_logout/${ownerid}`,
    { cancelToken }
  )
}

export const registerUser = data => {
  return axios.post(
    `${beginUrl}owner_register`,
    data
  )
}

export const saveUserInfo = data => {
  const form = new FormData()
  const { uri, name, type = "image/jpeg", size } = data.profile
  
  form.append("id", data.id)
  form.append("username", data.username)

  if (data.profile.uri.includes("file")) {
    form.append("profile", { uri, name, type })
    form.append("size", JSON.stringify(size))
  }

  form.append("hours", JSON.stringify(data.hours))

  return axios.post(
    `${beginUrl}save_user_info`,
    form
  )
}

export const addOwner = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg", size } = data.profile

	form.append("id", data.id)
	form.append("cellnumber", data.cellnumber)
	form.append("username", data.username)
	form.append("password", data.password)
	form.append("confirmPassword", data.confirmPassword)
	form.append("hours", JSON.stringify(data.hours))

	if (data.profile.uri.includes("file")) {
		form.append("profile", { uri, name, type })
    form.append("size", JSON.stringify(size))
	}

	return axios.post(
		`${beginUrl}add_owner`,
		form
	)
}

export const updateOwner = data => {
	const form = new FormData()

  form.append("ownerid", data.ownerid)
  form.append("type", data.type)

  switch (data.type) {
    case "cellnumber":
      form.append("cellnumber", data.cellnumber)

      break;
    case "username":
      form.append("username", data.username)

      break;
    case "profile":
      const { uri, name, type = "image/jpeg", size } = data.profile

      if (data.profile.uri.includes("file")) {
        form.append("profile", { uri, name, type })
        form.append("size", JSON.stringify(size))
      }

      break;
    case "password":
      form.append("currentPassword", data.currentPassword)
      form.append("newPassword", data.newPassword)
      form.append("confirmPassword", data.confirmPassword)

      break;
    case "hours":
      form.append("hours", JSON.stringify(data.hours))

      break;
    default:
  }

	return axios.post(
		`${beginUrl}update_owner`,
		form
	)
}

export const deleteOwner = data => {
  const { id, cancelToken } = data

  return axios.get(
    `${beginUrl}delete_owner/${id}`,
    { cancelToken }
  )
}

export const getAllStylists = data => {
  const { locationid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_all_stylists/${locationid}`,
    { cancelToken }
  )
}

export const getAllWorkingStylists = data => {
  return axios.post(
    `${beginUrl}get_all_working_stylists`,
    data
  )
}

export const getStylistInfo = data => {
  const { workerid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_stylist_info/${workerid}`,
    { cancelToken }
  )
}

export const getAllWorkersTime = data => {
  const { locationid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_all_workers_time/${locationid}`,
    { cancelToken }
  )
}

export const getWorkersHour = data => {
  return axios.post(
    `${beginUrl}get_workers_hour`,
    data
  )
}

export const switchAccount = data => {
  return axios.post(
    `${beginUrl}/switch_account`,
    data
  )
}

export const verifySwitchAccount = data => {
  return axios.post(
    `${beginUrl}/verify_switch_account`,
    data
  )
}

export const getOtherWorkers = data => {
  return axios.post(
    `${beginUrl}get_other_workers`,
    data
  )
}

export const getWorkersTime = data => {
  const { locationid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_workers_time/${locationid}`,
    { cancelToken }
  )
}

export const getOwnerInfo = data => {
  const { ownerid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_owner_info/${ownerid}`,
    { cancelToken }
  )
}

export const setOwnerHours = data => {
  return axios.post(
    `${beginUrl}set_owner_hours`,
    data
  )
}

export const getAccounts = data => {
  const { locationid, cancelToken } = data

	return axios.get(
    `${beginUrl}get_accounts/${locationid}`,
    { cancelToken }
  )
}

export const getCode = data => {
  const { cellnumber, cancelToken } = data

	return axios.get(
    `${beginUrl}get_reset_code/${cellnumber}`,
    { cancelToken }
  )
}

export const resetPassword = data => {
	return axios.post(
		`${beginUrl}reset_password`,
		data
	)
}
