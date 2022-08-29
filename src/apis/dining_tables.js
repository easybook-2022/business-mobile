import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/dining_tables/`

export const getTables = data => {
  const { locationid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_tables/${locationid}`,
    { cancelToken }
  )
}

export const getQrCode = data => {
  const { tableid, cancelToken } = data

  return axios.get(
    `${beginUrl}get_qr_code/${tableid}`,
    { cancelToken }
  )
}

export const addTable = data => {
  return axios.post(
    `${beginUrl}add_table`,
    data
  )
}

export const removeTable = data => {
  const { id, cancelToken } = data

  return axios.get(
    `${beginUrl}remove_table/${id}`,
    { cancelToken }
  )
}
