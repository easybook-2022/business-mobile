import axios from 'axios'
import { url } from '../../assets/info'

export const verifyUser = cellnumber => {
	return axios.get(`${url}/owners/verify/${cellnumber}`)
}

export const loginUser = data => {
	return axios.post(
		`${url}/owners/login`,
		data
	)
}

export const registerUser = data => {
  return axios.post(
    `${url}/owners/register`,
    data
  )
}

export const saveUserInfo = data => {
  const form = new FormData()
  const { uri, name, type = "image/jpeg", size } = data.profile
  
  form.append("id", data.id)
  form.append("username", data.username)
  form.append("profile", { uri, name, type })
  form.append("size", JSON.stringify(size))

  return axios.post(
    `${url}/owners/save_user_info`,
    form
  )
}

export const addOwner = data => {
	const form = new FormData()
	const { uri, name, type = "image/jpeg", size } = data.profile

	form.append("ownerid", data.ownerid)
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
		`${url}/owners/add_owner`,
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
		`${url}/owners/update_owner`,
		form
	)
}

export const deleteOwner = id => {
  return axios.get(`${url}/owners/delete_owner/${id}`)
}

export const getWorkerInfo = id => {
  return axios.get(`${url}/owners/get_worker_info/${id}`)
}

export const getOtherWorkers = data => {
  return axios.post(
    `${url}/owners/get_other_workers`,
    data
  )
}

export const setOwnerHours = data => {
  return axios.post(
    `${url}/owners/set_hours`,
    data
  )
}

export const updateNotificationToken = data => {
	return axios.post(
		`${url}/owners/update_notification_token`,
		data
	)
}

export const getAccounts = locationid => {
	return axios.get(`${url}/owners/get_accounts/${locationid}`)
}

export const getCode = cellnumber => {
	return axios.get(`${url}/owners/get_reset_code/${cellnumber}`)
}

export const resetPassword = data => {
	return axios.post(
		`${url}/owners/reset_password`,
		data
	)
}
