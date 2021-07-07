import React, { useState } from 'react'
import { AsyncStorage, SafeAreaView, ScrollView, View, Image, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { addBankaccount, getAccount, getBankaccount } from '../apis/users'

import AntDesign from 'react-native-vector-icons/AntDesign'

export default function settings({ navigation }) {
	const [accountHolders, setAccountHolders] = useState([
		{ key: "account-0", id: "1-d9d9diidssd-0", cellnumber: "1231231234" },
		{ key: "account-1", id: "1-d9d9diidssd-1", cellnumber: "2342342345" }
	])
	const [bankAccounts, setBankAccounts] = useState([
		{ key: "bankaccount-0", id: "10c0d-ds-f9d9f09d-0", bankimage: { photo: require("../../assets/bankaccount.png"), width: 0, height: 0 }, number: "****7890", default: true },
		{ key: "bankaccount-1", id: "10c0d-ds-f9d9f09d-1", bankimage: { photo: require("../../assets/bankaccount.png"), width: 0, height: 0 }, number: "****7890", default: false },
		{ key: "bankaccount-2", id: "10c0d-ds-f9d9f09d-2", bankimage: { photo: require("../../assets/bankaccount.png"), width: 0, height: 0 }, number: "****7890", default: false }
	])
	const [accountForm, setAccountform] = useState({
		show: false,
		type: '',
		cellnumber: '', password: '', confirmpassword: ''
	})
	const [bankAccountForm, setBankaccountform] = useState({
		show: false,
		id: '',
		type: '',
		accountHolder: '', accountNumber: '', transitNumber: '', routingNumber: ''
	})

	const addNewBankAccount = () => {
		let { accountHolder, accountNumber, transitNumber, routingNumber } = bankAccountForm
		let data = { accountHolder, accountNumber, transitNumber, routingNumber }

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
				}
			})
	}
	const editAccount = (accountid, index) => {
		let { cellnumber } = accountHolders[index]

		getAccount(accountid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setAccountform({
						...accountForm,
						show: true,
						type: 'edit',
						cellnumber: cellnumber,
						password: 'password',
						confirmpassword: 'password'
					})
				}
			})
	}
	const editBankAccount = (bankaccountid) => {
		getBankaccount(bankaccountid)
			.then((res) => {
				if (res.status == 200) {
					return res.data
				}
			})
			.then((res) => {
				if (res) {
					setBankaccountform({
						show: true,
						type: 'edit',
						id: bankaccountid,
						accountHolder: '123', accountNumber: '123', transitNumber: '123', routingNumber: '123'
					})
				}
			})
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={style.box}>
				<TouchableOpacity style={style.back} onPress={() => navigation.goBack()}>
					<Text style={style.backHeader}>Back</Text>
				</TouchableOpacity>

				<ScrollView>
					<Text style={style.boxHeader}>Setting(s)</Text>

					<View style={style.accountHolders}>
						<Text style={style.accountHoldersHeader}>Login User(s)</Text>

						<TouchableOpacity style={style.accountHoldersAdd} onPress={() => {
							setAccountform({
								...accountForm,
								show: true,
								type: 'add',
								cellnumber: '', password: '', confirmpassword: ''
							})
						}}>
							<Text>Add a Login User</Text>
						</TouchableOpacity>

						{accountHolders.map((info, index) => (
							<View key={info.key} style={style.account}>
								<Text style={style.accountHeader}>#{index + 1}:</Text>

								<View style={style.accountEdit}>
									<Text style={style.accountEditHeader}>{info.cellnumber}</Text>
									<TouchableOpacity style={style.accountEditTouch} onPress={() => editAccount(info.id, index)}>
										<Text>Change Info</Text>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>

					<View style={style.bankaccountHolders}>
						<Text style={style.bankaccountHoldersHeader}>Bank Account(s)</Text>

						<TouchableOpacity style={style.bankaccountHoldersAdd} onPress={() => {
							setBankaccountform({
								...bankAccountForm,
								show: true,
								type: 'add',
								accountHolder: '', accountNumber: '', transitNumber: '', routingNumber: ''
							})
						}}>
							<Text>Add a bank account</Text>
						</TouchableOpacity>

						{bankAccounts.map((info, index) => (
							<View key={info.key} style={style.bankaccount}>
								<Text style={style.bankaccountHeader}>#{index + 1}:</Text>
								<View style={style.bankaccountImageHolder}>
									<Image source={info.bankimage.photo} style={style.bankaccountImage}/>
								</View>
								<View style={style.bankaccountNumberHolder}>
									<Text style={style.bankaccountNumberHeader}>{info.number}</Text>
									<TouchableOpacity style={style.bankaccountEditTouch} onPress={() => editBankAccount(info.id)}>
										<Text style={style.bankaccountEditHeader}>Change Info</Text>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>
				</ScrollView>
			</View>

			{accountForm.show && (
				<Modal transparent={true}>
					<SafeAreaView style={{ flex: 1 }}>
						<View style={style.form}>
							<View style={style.formContainer}>
								<View style={{ alignItems: 'center', marginVertical: 20 }}>
									<TouchableOpacity onPress={() => {
										setAccountform({
											show: false,
											cellnumber: '', password: '', confirmpassword: ''
										})
									}}>
										<AntDesign name="closecircleo" size={30}/>
									</TouchableOpacity>
								</View>

								<Text style={style.formHeader}>{accountForm.type == 'add' ? 'Add' : 'Editing'} login user</Text>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Cell number:</Text>
									<TextInput style={style.formInputInput} onPress={(number) => setAccountform({
										...accountForm,
										cellnumber: number
									})} value={accountForm.cellnumber}/>
								</View>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Password:</Text>
									<TextInput style={style.formInputInput} onPress={(password) => setAccountform({
										...accountForm,
										password: password
									})} value={accountForm.password}/>
								</View>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Confirm password:</Text>
									<TextInput style={style.formInputInput} onPress={(password) => setAccountform({
										...accountForm,
										confirmpassword: confirmpassword
									})} value={accountForm.confirmpassword}/>
								</View>

								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<TouchableOpacity style={style.formSubmit} onPress={() => addNewAccount()}>
										<Text style={style.formSubmitHeader}>{accountForm.type == 'add' ? 'Add' : 'Save'} Account</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}

			{bankAccountForm.show && (
				<Modal transparent={true}>
					<SafeAreaView style={{ flex: 1 }}>
						<View style={style.form}>
							<View style={style.formContainer}>
								<View style={{ alignItems: 'center', marginVertical: 20 }}>
									<TouchableOpacity onPress={() => {
										setBankaccountform({
											show: false,
											id: '',
											accountHolder: '', accountNumber: '', transitNumber: '', routingNumber: ''
										})
									}}>
										<AntDesign name="closecircleo" size={30}/>
									</TouchableOpacity>
								</View>

								<Text style={style.formHeader}>{bankAccountForm.type == 'add' ? 'Add' : 'Editing'} bank account</Text>

								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Account Holder</Text>
									<TextInput style={style.formInputInput} onPress={(holder) => setBankaccountform({
										...bankAccountForm,
										accountHolder: holder
									})} value={bankAccountForm.accountHolder}/>
								</View>
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Account Number #</Text>
									<TextInput style={style.formInputInput} onPress={(number) => setBankaccountform({
										...bankAccountForm,
										accountNumber: number
									})} value={bankAccountForm.accountNumber}/>
								</View>
								
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Transit Number #</Text>
									<TextInput style={style.formInputInput} onPress={(number) => setBankaccountform({
										...bankAccountForm,
										transitNumber: number
									})} value={bankAccountForm.transitNumber}/>
								</View>
								<View style={style.formInputField}>
									<Text style={style.formInputHeader}>Routing Number</Text>
									<TextInput style={style.formInputInput} onPress={(number) => setBankaccountform({
										...bankAccountForm,
										routingNumber: number
									})} value={bankAccountForm.routingNumber}/>
								</View>

								<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
									<TouchableOpacity style={style.formSubmit} onPress={() => addNewBankAccount()}>
										<Text style={style.formSubmitHeader}>{bankAccountForm.type == 'add' ? 'Add' : 'Save'} Bank Account</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
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
	bankaccountHoldersHeader: { fontFamily: 'appFont', fontSize: 20, textAlign: 'center' },
	bankaccountHoldersAdd: { alignItems: 'center', borderRadius: 5, borderStyle: 'solid', borderWidth: 2, marginVertical: 3, padding: 5 },
	bankaccount: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
	bankaccountHeader: { fontSize: 20, fontWeight: 'bold', padding: 5 },
	bankaccountImageHolder: {  },
	bankaccountImage: { height: 40, width: 40 },
	bankaccountNumberHolder: { backgroundColor: 'rgba(127, 127, 127, 0.2)', borderRadius: 5, flexDirection: 'row', justifyContent: 'space-between', padding: 5, width: '70%' },
	bankaccountNumberHeader: { fontSize: 20, paddingVertical: 4, textAlign: 'center', width: '50%' },
	bankaccountEditTouch: { alignItems: 'center', borderRadius: 3, borderStyle: 'solid', borderWidth: 2, padding: 5 },

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
