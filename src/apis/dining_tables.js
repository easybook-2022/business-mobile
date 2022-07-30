import axios from 'axios'
import { url } from '../../assets/info'

const beginUrl = `${url}/dining_tables/`

export const getTables = id => {
  return axios.get(`${beginUrl}get_tables/${id}`)
}

export const getTableBills = id => {
  return axios.get(`${beginUrl}get_table_bills/${id}`)
}

export const getOrderingTables = id => {
  return axios.get(`${beginUrl}get_ordering_tables/${id}`)
}

export const getQrCode = id => {
  return axios.get(`${beginUrl}get_qr_code/${id}`)
}

export const addTable = data => {
  return axios.post(
    `${beginUrl}add_table`,
    data
  )
}

export const removeTable = id => {
  return axios.get(`${beginUrl}remove_table/${id}`)
}

export const finishOrder = data => {
  return axios.post(
    `${beginUrl}finish_order`,
    data
  )
}

export const viewPayment = id => {
  return axios.get(`${beginUrl}view_payment/${id}`)
}

export const finishDining = id => {
  return axios.get(`${beginUrl}finish_dining/${id}`)
}
