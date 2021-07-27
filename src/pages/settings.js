import React, { useState, useEffect } from 'react'
import { AsyncStorage, ActivityIndicator, Dimensions, ScrollView, View, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import stripe from 'tipsi-stripe'
import { 
	addOwner, updateOwner, addBankaccount, getAccounts, getBankaccounts, 
	setBankaccountDefault, getBankaccountInfo, deleteTheBankAccount
} from '../apis/owners'
import { info } from '../../assets/info'

import AntDesign from 'react-native-vector-icons/AntDesign'

stripe.setOptions({
	publishableKey: 'pk_test_bWW1YHLx5wgY3rU9fk6cNhBu'
})

const { height, width } = Dimensions.get('window')
const offsetPadding = Constants.statusBarHeight
const screenHeight = height - (offsetPadding * 2)

export default function settings({ navigation }) {
	const [ownerid, setOwnerid] = useState('')
	const [accountHolders, setAccountHolders] = useState([])
	const [bankAccounts, setBankAccounts] = useState([])
	const [loaded, setLoaded] = useState(false)
	const [accountForm, setAccountform] = useState({
		show: false,
		type: '',
		cellnumber: '', password: '', confirmPassword: ''
	})
	const [bankAccountForm, setBankaccountform] = useState({
		show: false,
		index: -1,
		type: '',
		accountNumber: '', 
		countryCode: 'ca',
		currency: 'cad',

		// routing number: '0' + institution + transit number
		institutionNumber: '',
		placeholder: '',
		transitNumber: '',

		accountHolderName: '', 
		accountHolderType: 'company' 
	})

	const addNewOwner = async() => {
		const { cellnumber, password, confirmPassword } = accountForm
		const data = { ownerid, cellnumber, password, confirmPassword }

		addOwner(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}

				return
			})
			.then((res) => {
				if (res) {
					setAccountform({
						show: false,
						type: '',
						cellnumber: '',
						password: '',
						confirmPassword: ''
					})
					getAllAccounts()
				}
			})
	}
	const updateTheOwner = async() => {
		const { cellnumber, password, confirmPassword } = accountForm
		const data = { ownerid, cellnumber, password, confirmPassword }

		updateOwner(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}

				return
			})
			.then((res) => {
				if (res) {
					setAccountform({
						show: false,
						type: '',
						cellnumber: '',
						password: '',
						confirmPassword: ''
					})
					getAllAccounts()
				}
			})
	}

	const addNewBankAccount = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const { accountHolder, accountNumber, transitNumber, routingNumber } = bankAccountForm
		const data = { locationid }
		const params = {
			// mandatory
			accountNumber: '000123456789',
			countryCode: 'us',

			currency: 'usd',

			// optional
			routingNumber: '110000000', // 9 digits
			accountHolderName: 'Test holder name',
			accountHolderType: 'company', // "company" or "individual"
		}

		const token = await stripe.createTokenWithBankAccount(params)

		data['banktoken'] = token.tokenId

		addBankaccount(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}

				return
			})
			.then((res) => {
				if (res) {
					setBankaccountform({
						...bankAccountForm,
						show: false,
						index: 0,
						accountHolder: '', accountNumber: '', transitNumber, routingNumber: ''
					})
					getAllBankaccounts()
				}
			})
	}
	const updateTheBankAccount = () => {

	}

	const useBankAccount = async(bankid) => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, bankid }

		setBankaccountDefault(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newBankaccounts = [...bankAccounts]

					newBankaccounts.forEach(function (data) {
						data.default = false

						if (data.bankid == bankid) {
							data.default = true
						}
					})

					setBankAccounts(newBankaccounts)
				}
			})
	}
	const editBankAccount = async(bankid, index) => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, bankid }

		getBankaccountInfo(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const { account_holder_name, last4, transit_number, institution_number } = res.bankaccountInfo

					setBankaccountform({
						show: true,
						index,
						type: 'edit',

						accountNumber: "",
						institutionNumber: institution_number,
						placeholder: "****" + last4,
						accountHolderName: account_holder_name, 
						transitNumber: transit_number
					})
				}
			})
	}
	const deleteBankAccount = async(bankid, index) => {
		const locationid = await AsyncStorage.getItem("locationid")
		const data = { locationid, bankid }

		deleteTheBankAccount(data)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					const newBankaccounts = [...bankAccounts]

					newBankaccounts.splice(index, 1)

					setBankAccounts(newBankaccounts)
				}
			})
	}

	const getAllAccounts = async() => {
		const locationid = await AsyncStorage.getItem("locationid")
		const ownerid = await AsyncStorage.getItem("ownerid")

		getAccounts(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setOwnerid(ownerid)
					setAccountHolders(res.accounts)
				}
			})
	}
	const getAllBankaccounts = async() => {
		const locationid = await AsyncStorage.getItem("locationid")

		getBankaccounts(locationid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setBankAccounts(res.bankaccounts)
					setLoaded(true)
				}
			})
	}

	useEffect(() => {
		getAllAccounts()
		getAllBankaccounts()
	}, [])

	return (
		<View style={{ paddingVertical: offsetPadding }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				{loaded ? 
					<ScrollView>
						<Text style={style.boxHeader}>Setting(s)</Text>

						<View style={style.accountHolders}>
							<Text style={style.accountHoldersHeader}>Login User(s)</Text>

							<TouchableOpacity style={style.accountHoldersAdd} onPress={() => {
								setAccountform({
									...accountForm,
									show: true,
									type: 'add',
									cellnumber: '', password: '', confirmPassword: ''
								})
							}}>
								<Text>Add a Login User</Text>
							</TouchableOpacity>

							{accountHolders.map((info, index) => (
								<View key={info.key} style={style.account}>
									<Text style={style.accountHeader}>#{index + 1}:</Text>

									<View style={style.accountEdit}>
										<Text style={style.accountEditHeader}>{info.cellnumber}</Text>
										{info.id == ownerid && (
											<TouchableOpacity style={style.accountEditTouch} onPress={() => {
												setAccountform({
													...accountForm,
													show: true,
													type: 'edit',
													cellnumber: info.cellnumber,
													password: '',
													confirmPassword: ''
												})
											}}>
												<Text>Change Info</Text>
											</TouchableOpacity>
										)}
									</View>
								</View>
							))}
						</View>

						<View style={style.bankaccountHolders}>
							<Text style={style.bankaccountHolderHeader}>Bank Account(s)</Text>

							<TouchableOpacity style={style.bankaccountHolderAdd} onPress={() => {
								setBankaccountform({
									...bankAccountForm,
									show: true,
									type: 'add',
									accountNumber: '', 
									countryCode: 'ca',
									currency: 'cad',

									// routing number: '0' + institution + transit number
									institutionNumber: '',
									transitNumber: '',

									accountHolderName: '', 
									accountHolderType: 'company' 
								})
							}}>
								<Text>Add a bank account</Text>
							</TouchableOpacity>

							{bankAccounts.map((info, index) => (
								<View key={info.key} style={style.bankaccount}>
									<View style={style.bankaccountRow}>
										<Text style={style.bankaccountHeader}>#{index + 1}:</Text>
										<View style={style.bankaccountImageHolder}>
											<Image source={require("../../assets/rbc.png")} style={style.bankaccountImage}/>
										</View>
										<View style={style.bankaccountNumberHolder}>
											<Text style={style.bankaccountNumberHeader}>{info.number}</Text>
										</View>
									</View>
									<View style={style.bankaccountActions}>
										<TouchableOpacity style={info.default ? style.bankaccountActionDisabled : style.bankaccountAction} disabled={info.default} onPress={() => useBankAccount(info.bankid)}>
											<Text style={info.default ? style.bankaccountActionHeaderDisabled : style.bankaccountActionHeader}>Use as default</Text>
										</TouchableOpacity>
										<TouchableOpacity style={style.bankaccountAction} onPress={() => editBankAccount(info.bankid, index)}>
											<Text style={style.bankaccountActionHeader}>Change info</Text>
										</TouchableOpacity>
										<TouchableOpacity style={info.default ? style.bankaccountActionDisabled : style.bankaccountAction} disabled={info.default} onPress={() => deleteBankAccount(info.bankid, index)}>
											<Text style={info.default ? style.bankaccountActionHeaderDisabled : style.bankaccountActionHeader}>Delete</Text>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</View>
					</ScrollView>
					:
					<ActivityIndicator marginTop={'50%'} size="small"/>
				}
			</View>

			{accountForm.show && (
				<Modal transparent={true}>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.form}>
							<View style={style.formContainer}>
								<View style={{ alignItems: 'center', marginVertical: 20 }}>
									<TouchableOpacity onPress={() => {
										setAccountform({
											show: false,
											cellnumber: '', password: '', confirmPassword: ''
										})
									}}>
										<AntDesign name="closecircleo" size={30}/>
									</TouchableOpacity>
								</View>

								<Text style={style.formHeader}>{accountForm.type == 'add' ? 'Add' : 'Editing'} login user</Text>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Cell number:</Text>
									<TextInput style={style.formInputInput} onChangeText={(number) => setAccountform({
										...accountForm,
										cellnumber: number
									})} value={accountForm.cellnumber}/>
								</View>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Password:</Text>
									<TextInput style={style.formInputInput} secureTextEntry={true} onChangeText={(password) => setAccountform({
										...accountForm,
										password: password
									})} value={accountForm.password}/>
								</View>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Confirm password:</Text>
									<TextInput style={style.formInputInput} secureTextEntry={true} onChangeText={(password) => setAccountform({
										...accountForm,
										confirmPassword: password
									})} value={accountForm.confirmPassword}/>
								</View>

								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<TouchableOpacity style={style.formSubmit} onPress={() => {
										if (accountForm.type == 'add') {
											addNewOwner()
										} else {
											updateTheOwner()
										}
									}}>
										<Text style={style.formSubmitHeader}>{accountForm.type == 'add' ? 'Add' : 'Save'} Account</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}

			{bankAccountForm.show && (
				<Modal transparent={true}>
					<View style={{ paddingVertical: offsetPadding }}>
						<View style={style.form}>
							<View style={style.formContainer}>
								<View style={{ alignItems: 'center', marginVertical: 20 }}>
									<TouchableOpacity onPress={() => {
										setBankaccountform({
											show: false,
											index: -1,
											accountNumber: '', 
											countryCode: 'ca',
											currency: 'cad',

											// routing number: '0' + institution + transit number
											institutionNumber: '',
											transitNumber: '',

											accountHolderName: '', 
											accountHolderType: 'company' 
										})
									}}>
										<AntDesign name="closecircleo" size={30}/>
									</TouchableOpacity>
								</View>

								<Text style={style.formHeader}>{bankAccountForm.type == 'add' ? 'Add' : 'Editing'} bank account</Text>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Account Holder</Text>
									<TextInput style={style.formInputInput} onChangeText={(holder) => setBankaccountform({
										...bankAccountForm,
										accountHolderName: holder.toString()
									})} value={bankAccountForm.accountHolderName}/>
								</View>
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Account Number</Text>
									<TextInput style={style.formInputInput} onChangeText={(number) => setBankaccountform({
										...bankAccountForm,
										accountNumber: number.toString()
									})} value={bankAccountForm.accountNumber} placeholder={bankAccountForm.placeholder}/>
								</View>
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Institution Number</Text>
									<TextInput style={style.formInputInput} onChangeText={(number) => setBankaccountform({
										...bankAccountForm,
										institutionNumber: number.toString()
									})} value={bankAccountForm.institutionNumber}/>
								</View>
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Transit Number</Text>
									<TextInput style={style.formInputInput} onChangeText={(number) => setBankaccountform({
										...bankAccountForm,
										transitNumber: number.toString()
									})} value={bankAccountForm.transitNumber}/>
								</View>

								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<TouchableOpacity style={style.formSubmit} onPress={() => {
										if (bankAccountForm.type == 'add') {
											addNewBankAccount()
										} else {
											updateTheBankAccount()
										}
									}}>
										<Text style={style.formSubmitHeader}>{bankAccountForm.type == 'add' ? 'Add' : 'Save'} Bank Account</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</View>
				</Modal>
			)}
		</View>
	)
}

const style = StyleSheet.create({
	box: { height: '100%', width: '100%' },
	back: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 1, margin: 20, padding: 5, width: 100 },
	backHeader: { fontFamily: 'appFont', fontSize: 20 },
	boxHeader: { fontFamily: 'appFont', fontSize: 50, fontWeight: 'bold', textAlign: 'center' },

	accountHolders: { alignItems: 'center', marginHorizontal: 10, marginTop: 50 },
	accountHoldersHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	accountHoldersAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	account: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
	accountHeader: { fontSize: 20, fontWeight: 'bold', padding: 5 },
	accountEdit: { backgroundColor: 'rgba(127, 127, 127, 0.3)', borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
	accountEditHeader: { fontSize: 20, paddingVertical: 4, textAlign: 'center', width: '50%' },
	accountEditTouch: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 2, margin: 5, padding: 5 },

	bankaccountHolders: { alignItems: 'center', marginHorizontal: 10, marginTop: 50 },
	bankaccountHolderHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	bankaccountHolderAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	bankaccount: { marginVertical: 30 },
	bankaccountRow: { flexDirection: 'row', justifyContent: 'space-between' },
	bankaccountHeader: { fontSize: 20, fontWeight: 'bold', padding: 5 },
	bankaccountImageHolder: { height: 40, margin: 2, width: 40 },
	bankaccountImage: { height: 40, width: 40 },
	bankaccountNumberHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 5, width: '70%' },
	bankaccountNumberHeader: { fontSize: 20, paddingVertical: 4, textAlign: 'center', width: '50%' },
	bankaccountActions: { flexDirection: 'row', justifyContent: 'space-around' },
	bankaccountAction: { borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 100 },
	bankaccountActionHeader: { fontSize: 12, textAlign: 'center' },
	bankaccountActionDisabled: { backgroundColor: 'black', borderRadius: 2, borderStyle: 'solid', borderWidth: 2, marginTop: 5, padding: 5, width: 100 },
	bankaccountActionHeaderDisabled: { color: 'white', fontSize: 12, textAlign: 'center' },

	// form
	form: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', flexDirection: 'column', height: '100%', justifyContent: 'space-around', width: '100%' },
	formContainer: { backgroundColor: 'white', height: '70%', width: '80%' },
	formHeader: { fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
	formInputField: { marginBottom: 20, marginHorizontal: '10%', width: '80%' },
	formInputHeader: { fontSize: 20, fontWeight: 'bold' },
	formInputInput: { borderRadius: 2, borderStyle: 'solid', borderWidth: 3, padding: 5, width: '100%' },
	formSubmit: { alignItems: 'center', borderRadius: 2, borderStyle: 'solid', borderWidth: 1, padding: 5 },
	formSubmitHeader: {  },
})
