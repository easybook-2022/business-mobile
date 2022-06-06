import axios from 'axios'
import { url } from '../../assets/info'

export const verifyUser = cellnumber => {
	return axios.get(`${url}/workers/worker_verify/${cellnumber}`)
}

export const loginUser = data => {
	return axios.post(
		`${url}/workers/worker_login`,
		data
	)
}

export const logoutUser = id => {
  return axios.get(`${url}/workers/worker_logout/${id}`)
}

export const registerUser = data => {
  return axios.post(
    `${url}/workers/worker_register`,
    data
  )
}

export const saveWorkerInfo = data => {
  const form = new FormData()
  const { uri, name, type = "image/jpeg", size } = data.profile
  
  form.append("id", data.id)
  form.append("username", data.username)

  if (data.profile.uri.includes("file")) {
    form.append("profile", { uri, name, type })
  }
  
  form.append("size", JSON.stringify(size))
  form.append("hours", JSON.stringify(data.hours))

  return axios.post(
    `${url}/workers/save_worker_info`,
    form
  )
}

export const addWorker = data => {
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
		`${url}/workers/add_worker`,
		form
	)
}

export const updateWorker = data => {
	const form = new FormData()

  form.append("workerid", data.workerid)
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
		`${url}/workers/update_worker`,
		form
	)
}

export const deleteWorker = id => {
  return axios.get(`${url}/workers/delete_worker/${id}`)
}

export const getWorkers = id => {
  return axios.get(`${url}/workers/get_workers/${id}`)
}

export const getWorkerInfo = id => {
  return axios.get(`${url}/workers/get_worker_info/${id}`)
}

export const getAllWorkersTime = id => {
  return axios.get(`${url}/workers/get_all_workers_time/${id}`)
}

export const getWorkersHour = data => {
  return axios.post(
    `${url}/workers/get_workers_hour`,
    data
  )
}

export const getOtherWorkers = data => {
  return axios.post(
    `${url}/workers/get_other_workers`,
    data
  )
}

export const getWorkersTime = id => {
  return axios.get(`${url}/workers/get_workers_time/${id}`)
}

export const getOwnerInfo = id => {
  return axios.get(`${url}/workers/get_owner_info/${id}`)
}

export const setWorkerHours = data => {
  return axios.post(
    `${url}/workers/set_worker_hours`,
    data
  )
}

export const updateNotificationToken = data => {
	return axios.post(
		`${url}/workers/update_worker_notification_token`,
		data
	)
}

export const getAccounts = id => {
	return axios.get(`${url}/workers/get_accounts/${id}`)
}

export const getCode = cellnumber => {
	return axios.get(`${url}/workers/get_reset_code/${cellnumber}`)
}

export const resetPassword = data => {
	return axios.post(
		`${url}/workers/reset_password`,
		data
	)
}
