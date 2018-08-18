"use strict";
module.exports = routes;

/*	ALL ROUTES MUST BE ARRANGED IN ALPHABETICAL ORDER 	*/

function routes(app) {
  console.info("Configuring Routes");

  /* Health Check API */
  app.get("/", require("./api/healthCheck/healthCheck.js"));

  /*Bindu EMI Project API*/
  app.get(
    "/getUserDetailsById/:user_id",
    require("./api/userDetails/getUserDetailsById.js")
  );
  app.get(
    "/getUserDetailsById",
    require("./api/userDetails/getAllUserDetails.js")
  );
  /*End Of Bindu's Emi Apis*/

  /* <==== Start States API ====> */
  /* Get All Countires API */
  app.get("/getAllCountires", require("./api/countries/getAllCountries.js"));
  /*  Get One Country */
  app.get("/getCountry/:country_id", require("./api/countries/getById.js"));
  /* <==== End States API ====> */

  /* <==== Start States API ====> */
  /* Get All State API */
  app.get("/getAllStates", require("./api/states/getAllStates.js"));
  /* Get One State API */
  app.get("/getState/:state_id", require("./api/states/getById.js"));
  /* <==== End States API ====> */

  /* <==== Start Users API ====> */
  /* Create User */
  app.post("/createUser", require("./api/users/post.js"));
  /* Update User Details */
  app.put("/updateUser/:user_id", require("./api/users/put.js"));
  /* Get All Users */
  app.get("/getAllUsers", require("./api/users/getAll.js"));
  /* Get User By Id */
  app.get("/getUserById/:user_id", require("./api/users/get.js"));
  /* Validate User */
  app.post("/validateUser", require("./api/users/validate.js"));
  /* Validate Agency User */
  app.post("/validateAgencyUser", require("./api/users/validateAgencyUser.js"));
  /* Validate Agency User */
  app.post("/validateConsumer", require("./api/users/validateConsumer.js"));
  /* Get All Agency Users based On Agency Id */
  app.get(
    "/getAllUsers/agency/:agency_id",
    require("./api/users/getAllAgencyUsers.js")
  );
  /* Update Status Of the user */
  app.put(
    "/updateUserStatus/:user_id",
    require("./api/users/changeUserStatus.js")
  );
  /* Update Password Of the user */
  app.put(
    "/updateUserPassword/:user_id",
    require("./api/users/changeUserPassword.js")
  );
  /* Get All Consumers Of Agency */
  app.get(
    "/getAllConsumers/agency/:agency_id",
    require("./api/users/getAllConsumarByAgencyId.js")
  );
  /* <==== End Users API ====> */

  /* Account Creation*/
  app.post("/createAccount", require("./api/accounts/post.js"));
  app.put(
    "/updateAccountDetails/:user_id/:consumer_account_number",
    require("./api/accounts/put.js")
  );
  app.get(
    "/getAllAccountsByUserId/:user_id",
    require("./api/accounts/getAllAccountsByUserId.js")
  );
  app.get(
    "/getOneAccountsByAccountId/:consumer_account_id",
    require("./api/accounts/getOneAccountsByAccountId.js")
  );

  /*Consumer Creation*/
  app.post("/createConsumer", require("./api/consumer/post.js"));
  app.get("/getAllConsumers", require("./api/consumer/getAllConsumers.js"));
  app.get(
    "/getOneConsumerAccountsByAccountId/:consumer_account_number",
    require("./api/consumer/getConsumerById.js")
  );
  app.put("/updateConsumer/user_id/:user_id", require("./api/consumer/put.js"));

  /* Meter Reading Details */
  app.get(
    "/getMeterReadingDetails/:account_number",
    require("./api/meterreading/getAllDetailsByAccountId.js")
  );

  /* Payment Details */
  app.get(
    "/getPaymentDetails/:account_number",
    require("./api/payment/getAllDetailsByAccountId.js")
  );
  app.post("/paymoney", require("./api/payment/post.js"));
  app.get(
    "/getReceipt/bill_id/:bill_id",
    require("./api/payment/getreceiptBybillId.js")
  );

  /* <==== Start Bill Details API ====> */
  /* Bill Details Based On Consumer Account */
  app.get(
    "/getBillDetails/acnumber/:account_number",
    require("./api/bill/getAllDetailsByAccountId.js")
  );
  /* Last Bill Details Based On Consumer Account */
  app.get(
    "/getLastBillDetails/acnumber/:account_number",
    require("./api/bill/getLastBillDetailByAccountId.js")
  );
  /* Bill Details Based On Agency ID */
  app.get(
    "/getBillDetails/agency/:agency_id",
    require("./api/bill/getBillDetailsByAgencyId.js")
  );
  /* Bill Details Based On Agency Id And Consumer Account */
  app.get(
    "/getBillDetails/agency/:agency_id/acnumber/:account_number",
    require("./api/bill/getAccountIdAndAgencyIdDetails.js")
  );
  /* Last Bill Details Based On Agency Id And Consumer Account */
  app.get(
    "/getLastBillDetails/agency/:agency_id/acnumber/:account_number",
    require("./api/bill/getLastBillDetailsByAccountIdAndAgencyId.js")
  );
  /* Create Bill Details */
  app.post("/createBill", require("./api/bill/post.js"));
  /* Edit Bill Details */
  app.put(
    "/editBill/:agency_id/:account_number/:bill_id",
    require("./api/bill/put.js")
  );
  /* <==== End Bill Details API ====> */

  /* <==== Start Agency API ====> */
  /* Create Agency */
  app.post("/createAgency", require("./api/agency/post.js"));
  /* Edit Agency Details */
  app.put("/editAgency/:agency_id", require("./api/agency/put.js"));
  /* Get All Agencies */
  app.get("/getAgencies", require("./api/agency/getAllAgency.js"));
  /* Get One Agency */
  app.get("/getAgency/:agency_id", require("./api/agency/getAgencyById.js"));
  /* <==== End Agency API ====> */

  /* <==== Start Sub Division API ====> */
  /* Create Sub Division */
  app.post("/createSubDivision", require("./api/subDivision/post.js"));
  /* Edit Sub Division */
  app.put(
    "/editSubDivision/:sub_division_id",
    require("./api/subDivision/put.js")
  );
  /* Get All Sub Divisions */
  app.get(
    "/getAllSubDivisions",
    require("./api/subDivision/getAllSubDivision.js")
  );
  /* Get One Sub Division */
  app.get(
    "/getSubDivision/:sub_division_id",
    require("./api/subDivision/getSubDivisionById.js")
  );
  /* <==== End Sub Division API ====> */

  /* <==== Start Sub Division Agency Mapping API ====> */
  /* Link Sub Division With Agency */
  app.post(
    "/mapSubDivisionWithAgency",
    require("./api/buMapingAgency/post.js")
  );
  /* Edit Link Sub Division Agency */
  app.put(
    "/editMapSubDivisionWithAgency/:bu_agency_mapping_id",
    require("./api/buMapingAgency/put.js")
  );
  /* Get One Sub Division Mapping Agency Details */
  app.get(
    "/getOne/subDivisionMapping/:bu_agency_mapping_id",
    require("./api/buMapingAgency/getMapSubDivionWithAgencyById.js")
  );
  /* Get All Sub Division Mapping Agency Details */
  app.get(
    "/getAll/subDivisionMapping",
    require("./api/buMapingAgency/getAllSubDivionsMappedAgencies.js")
  );
  /* <==== End Sub Division Agency Mapping API ====> */

  /* <==== Start Utilities API ====> */
  /* Create Utility  */
  app.post("/createUtility", require("./api/utilities/post.js"));
  /* Edit Utility */
  app.put("/editUtility/:utility_id", require("./api/utilities/put.js"));
  /* Get All Utilities */
  app.get("/getAllUtilities", require("./api/utilities/getAllUtilities.js"));
  /* Get One Utlitiy */
  app.get(
    "/getOneUtility/:utility_id",
    require("./api/utilities/getUtilityById.js")
  );
  /* <==== End Utilities API ====> */

  /* <==== Start Utility Board API ====> */
  /* Create Utlity Board */
  app.post("/createUtilityBoard", require("./api/utilityBoard/post.js"));
  /* Edit Utility Board */
  app.put(
    "/editUtilityBoard/:utility_board_id",
    require("./api/utilityBoard/put.js")
  );
  /* Get All Utility Boards */
  app.get(
    "/getAllUtilityBoards",
    require("./api/utilityBoard/getAllUtilityBoards.js")
  );
  /* Get One Utility Board*/
  app.get(
    "/getUtilityBoardById/:utility_board_id",
    require("./api/utilityBoard/getUtilityBoardById.js")
  );
  /* <==== End Utility Board API ====> */

  /* <==== Start Temp Bill Details API ====> */
  /* Get All Consumers Based On Agency Id */
  app.get(
    "/getAllConsumerBillDetails/agency/:agency_id",
    require("./api/tempCashCollection/getAllConsumerDetailsByAgencyId.js")
  );
  /* Get One Consumber Based On Agency And Consumer Account Number */
  app.get(
    "/getOneConsumerBillDetails/agency/:agency_id/consumer/:consumer_number",
    require("./api/tempCashCollection/getOneConsumerDetailsByAgencyIdAndConsumerNumber.js")
  );
  /* Update Amount Paid to consumer */
  app.put(
    "/updatePayment/:bill_id/consumer/:consumer_number",
    require("./api/tempCashCollection/updateAmountPaid.js")
  );
  /* Get One Consumer Based On Agency And Bill Id(Bill Number) */
  app.get(
    "/getOneConsumerBillDetails/agency/:agency_id/bill/:bill_id",
    require("./api/tempCashCollection/getOneConsumerDetailsByAgencyIdAndBillNumber.js")
  );
  /* Edit Bill By Bill Number (Bill Id) */
  app.put(
    "/editBill/:bill_id",
    require("./api/tempCashCollection/editBillWithNewBillAmount.js")
  );
  /* <==== End Temp Bill Details API ====> */

  /* <==== Start Receipt Details API ====> */
  /* Create Receipt */
  app.post("/createReceipt", require("./api/collectionDetails/post.js"));
  /* Create Receipt For Meter Redear person */
  app.post(
    "/meterReader/createReceipt",
    require("./api/collectionDetails/createReceiptValidateCreditLimit.js")
  );
  /* Edit Receipt */
  app.put(
    "/updateReceipt/:receipt_id",
    require("./api/collectionDetails/put.js")
  );
  /* Update Check Status of the Receipt */
  app.put(
    "/updateCheckStatus/receipt/:receipt_id",
    require("./api/collectionDetails/updateCheckStatusOfReceipt.js")
  );
  /* Get All Receipt */
  app.get(
    "/getAllReceipts/agency/:agency_id",
    require("./api/collectionDetails/getAll.js")
  );
  /* Get One Receipt by User id And Agency Id */
  app.get(
    "/getReceipt/:receipt_id",
    require("./api/collectionDetails/getOneConsumerReceipt.js")
  );
  /* Get All Receipts by Consumer Account Number */
  app.get(
    "/getAllReceipt/consumer/:consumer_account_number",
    require("./api/collectionDetails/getAllReceiptsByConsumerNumber.js")
  );
  /* <==== End Receipt Details API ====> */
  app.get(
    "/getAllReceiptCheck/agency/:agency_id",
    require("./api/collectionDetails/getAllReceiptCheck.js")
  );
  /* <==== Start Receipt Details API ====> */
  app.get(
    "/getPaymentCategories/utilityBoard/:utility_board_id",
    require("./api/paymentCategories/getPaymentCategories.js")
  );
  /* <==== End Receipt Details API ====> */

  /* <==== Start Credit Limit API ====> */
  /* Create Credit Limit */
  app.post("/createCreditLimit", require("./api/creditLimit/post.js"));
  /* Approve Credit Limit From MJP Side */
  app.put(
    "/approveCreditLimit/:agency_credit_limit_id",
    require("./api/creditLimit/approveCreditLimit.js")
  );
  /* Delete Credit Limit */
  app.put(
    "/deleteCreditLimit/:agency_credit_limit_id",
    require("./api/creditLimit/deleteCreditLimit.js")
  );
  /* Get All Credit Limit */
  app.get(
    "/getAll/creditLimit",
    require("./api/creditLimit/getAllCreditLimit.js")
  );
  /* Get One Credit Limit WHICH IS Approved */
  app.get(
    "/getOne/creditLimit/:agency_credit_limit_id",
    require("./api/creditLimit/getOneCreditLimit.js")
  );
  /* Get One Credit Limit */
  app.get(
    "/getOneCreditLimit/agency/:agency_id/subDivision/:sub_division_id",
    require("./api/creditLimit/getOneApprovedCreditLimit.js")
  );
  /* Get All Credit Limit By Agency Id */
  app.get(
    "/get/creditLimit/agency/:agency_id",
    require("./api/creditLimit/getAllCreditLimitByAgencyId.js")
  );
  /* Edit Credit Limit From Agency Side */
  app.put(
    "/editCreditLimit/:agency_credit_limit_id",
    require("./api/creditLimit/put.js")
  );
  /* <==== End Credit Limit API ====> */

  /* <==== Start Credit Limit API ====> */
  app.post("/createProcessingCycle", require("./api/processingCycle/post.js"));
  app.put(
    "/updateProcessingCycle/:processing_cycle_id",
    require("./api/processingCycle/put.js")
  );
  app.get("/getAllProcessingCycle", require("./api/processingCycle/getAll.js"));
  app.get(
    "/getOneProcessingCycle/:processing_cycle_id",
    require("./api/processingCycle/getOne.js")
  );
  /* <==== End Credit Limit API ====>

	/* <==== Start Filter Receipt API ====> */
  app.get(
    "/getReceipts/agency/:agency_id/date/:start_date/:end_date/payment_mode/:payment_mode/payment_category_id/:payment_category_id",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );
  app.get(
    "/getReceipts/agency/:agency_id/collected_by/:collected_by",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );
  app.get(
    "/getReceipts/agency/:agency_id/payment_mode/:payment_mode",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );

  app.get(
    "/getReceipts/agency/:agency_id/date/:start_date/:end_date/collected_by/:collected_by",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );
  app.get(
    "/getReceipts/agency/:agency_id/date/:start_date/:end_date/payment_mode/:payment_mode",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );
  app.get(
    "/getReceipts/agency/:agency_id/collected_by/:collected_by/payment_mode/:payment_mode",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );

  app.get(
    "/getReceipts/agency/:agency_id/date/:start_date/:end_date/collected_by/:collected_by/payment_mode/:payment_mode/payment_category_id/:payment_category_id",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );
  app.get(
    "/getReceipts/agency/:agency_id/date/:start_date/:end_date/collected_by/:collected_by/payment_mode/:payment_mode",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );
  app.get(
    "/getCollectionreport",
    require("./api/collectionDetails/getAllCollectionDetails.js")
  );
  app.get(
    "/getReceipts/agency/:agency_id/date/:start_date/:end_date",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );
  app.get(
    "/getReceipts/agency/:agency_id/date/:start_date/:end_date/collected_by/:collected_by/payment_category_id/:payment_category_id",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );
  app.get(
    "/getReceipts/agency/:agency_id/date/:start_date/:end_date/payment_category_id/:payment_category_id",
    require("./api/collectionDetails/getAllReceiptByFilters.js")
  );

  /* <==== End Filter Receipt API ====> */

  /* <==== Start Job Creation API ====> */
  app.post("/createJob", require("./api/job/post.js"));
  app.post("/createJobLine", require("./api/job/postJobDetails.js"));
  app.get("/getAllJob/agency/:agency_id", require("./api/job/getAllJob.js"));
  app.get(
    "/getOneJob/agency/:agency_id/job/:job_id",
    require("./api/job/getOneJob.js")
  );
  /* Get All Consumers By sub division Id and Processing Cycle */
  app.get(
    "/getAllAccounts/agency/:agency_id/subDivision/:sub_division_id/processingCycle/:processing_cycle_id",
    require("./api/accounts/getAllAccountsJobAssiginedIsNo.js")
  );
  /* Get All Job By agency Id and Sub Division Id and Meter Reader ID */
  app.get(
    "/getAllJobs/agency/:agency_id/subDivision/:sub_division_id/meterReader/:meter_reader_id",
    require("./api/job/getAllJobsOfMeterReader.js")
  );
  app.get(
    "/getAllJobDetails/agency/:agency_id/job/:job_id",
    require("./api/job/getAllJobDetailsByJobId.js")
  );
  app.get(
    "/getAllJobDetailsForMeterReader/agency/:agency_id/job/:job_id",
    require("./api/job/getAllJobDetailsByJobIdForMeterReader.js")
  );
  app.get(
    "/getAllJobDetailsSort/agency/:agency_id/job/:job_id/limit/:from_limit/:to_limit",
    require("./api/job/getAllJobDetailsByJobIdToSort.js")
  );
  app.get(
    "/getAllMeterReadingDetails/agency/:agency_id/job/:job_id/consumerAccountNumber/:consumer_account_number",
    require("./api/job/getAllJobDetailsByJobIdAndConsumerAccountNumber.js")
  );
  app.put("/updateJobStatus/:job_id", require("./api/job/JobStatusUpdate.js"));
  app.get(
    "/jobSearch/agency/:agency_id/subDivision/:sub_division_id/processingCycle/:processing_cycle_id/meterReadingMonth/:meter_reading_month/job/:job_id/meterReader/:meter_reader_id",
    require("./api/job/jobSearch.js")
  );
  // app.get('/jobSearch/:agency_id/:sub_division_id/:processing_cycle_id/:meter_reading_month/:job_id',require('./api/job/jobSearch.js'));

  /* Get Consumption Part */
  app.get(
    "/getConsumptionDetails/consumerAccountNumber/:consumer_account_number/year/:year",
    require("./api/job/getConsumptionDetailsByConsumerAccountNumber.js")
  );
  app.get(
    "/getConsumptionDetails/consumerAccountNumber/:consumer_account_number/month/:month/year/:myear",
    require("./api/job/getConsumptionDetailsByConsumerAccountNumber.js")
  );
  /* <==== End Job Creation API ====> */
  /* <==== Start Meter Reading API ====> */
  /* Create Meter Reading */
  app.post("/createMeterReading", require("./api/meterreading/post.js"));
  /* Update Meter Reading */
  app.put(
    "/updateMeterReading/:job_detail_id/:job_id/:consumer_account_number",
    require("./api/meterreading/put.js")
  );
  /* <==== End Meter Reading API ====> */
  /* <==== Start Codes API ====> */
  app.post("/createCodes", require("./api/codes/post.js"));
  app.put("/editCodes/:code_id", require("./api/codes/put.js"));
  app.get(
    "/getOneCode/agency/:agency_id/code/:code_id",
    require("./api/codes/getOneCode.js")
  );
  app.get(
    "/getAllCodes/agency/:agency_id",
    require("./api/codes/getAllCodes.js")
  );
  /* <==== End Code API ====> */

  /*
	* Update Consumer Contact Details
	*/
  app.put(
    "/editContactDetails/consumerAccountNumber/:consumer_account_number",
    require("./api/users/updateContactDetailsOfConusmer.js")
  );

  app.get("/getAllConnectionType", require("./api/connectionType/getAll.js"));

  app.post(
    "/validateJobMeterReading/:agency_id/:job_id",
    require("./api/validatingAndUpdatingMeterReading/put.js")
  );

  app.post("/generateBill/:job_id", require("./api/billGenerating/put.js"));

  app.post(
    "/generateBill/:agency_id/:job_id",
    require("./api/billGenerating/put.js")
  );

  /* get pipe_diameter*/
  app.get(
    "/getAllPipeDaimeter",
    require("./api/connectionType/getAllPipeDiameter.js")
  );

  /*bill generating in pdf*/
  app.get(
    "/generateBillinpdf/bill_id/:bill_id",
    require("./api/billGenerating/getBilldetailsinPdf.js")
  );
  app.get(
    "/sendSmsToNotPaidConsumers",
    require("./api/billGenerating/sendsmstoNotPaidConsumers.js")
  );
  /*
	correction Report
	*/
  app.get(
    "/getAllCorrectionReport/date/:start_date/:end_date/:bill_modified",
    require("./api/correctionReport/getAllCorrectionreportByFilter.js")
  );
  app.get(
    "/getAllCorrectionReportbyAll/date/all/:start_date/:end_date",
    require("./api/correctionReport/getallcorrectionreportall.js")
  );
  app.get(
    "/getAllConsumerByJobIdAndAgencyID/agency/:agency_id/job_id/:job_id",
    require("./api/job/getallConsumerdetailsByJobIdAndAgencyId.js")
  );
  app.get(
    "/getAllbill/bill_id/bill_id/:bill_id_from/:bill_id_to",
    require("./api/billGenerating/getbilldetailsbyBillids.js")
  );
  app.get(
    "/getAllbill/job_id/:job_id",
    require("./api/billGenerating/getallbillpdfbyfilter.js")
  );
  app.get(
    "/getonebillBybilldi/agency_id/:agency_id/consumer_account_number/:consumer_account_number",
    require("./api/billGenerating/gteonebillbybillid.js")
  );
  app.put(
    "/updatebillvalidation/bill_id/:bill_id/consumer_account_number/:consumer_account_number",
    require("./api/tempCashCollection/updatebillvalidation.js")
  );
  app.get(
    "/getAllActivebillbyagencyid/agency/:agency_id",
    require("./api/tempCashCollection/getAllactivebillbyAgencyid.js")
  );
  app.get(
    "/getlastbillforthatjob/job_id/:job_id",
    require("./api/billGenerating/getlastbillforthatjob.js")
  );
  /*
	job reallaocating
	*/
  app.put(
    "/updateConsumerstatusreallocate/:job_id/:consumer_account_number",
    require("./api/job/updatejobreallocate.js")
  );
  app.get(
    "/getAllpricing",
    require("./api/tempCashCollection/getallpricing.js")
  );
  app.get(
    "/getAllminimumconsumption",
    require("./api/tempCashCollection/getallminimumconsumption.js")
  );
  app.post(
    "/getforgetpasswordemailvaliadtion",
    require("./api/users/forgotpasswordsendemail.js")
  );
  app.put(
    "/updateforgetpassword",
    require("./api/users/updateforgetpassword.js")
  );

  /*
	New Reports
	*/
  app.get(
    "/getReceiptbyConsumernumbernaddates/agency/:agency_id/consumer_account_number/:consumer_account_number/date/:start_date/:end_date",
    require("./api/collectionDetails/getallreceiptbyconsumernumberandfilter.js")
  );
  /*
	consumerjobdetislapis
	*/
  app.get(
    "/getjobdetailsby/agency_id/:agency_id/consumer_account_number/:consumer_account_number",
    require("./api/meterreading/getjobdetailbyconsumernumber.js")
  );
  app.put(
    "/consumersendmeterreading",
    require("./api/meterreading/consumerupdatemeterreading.js")
  );
  /*
	payment history
	*/
  app.get(
    "/getPaymentHistory/:consumer_account_number",
    require("./api/payment/getallpaymentHistorybyaccountnumber.js")
  );
  /*
	consolidation report
	*/
  app.get(
    "/consolidationreport/:processing_cycle/date/:start_date/:end_date",
    require("./api/consumer/assessmentreport.js")
  );
  /*
	meterreading validation 
	*/
  app.put(
    "/validatemeterreadinhouselocked",
    require("./api/meterreading/validatemeterreading.js")
  );
  /*
	RR Report
	*/
  app.get(
    "/getRRreport/:job_id/date/:start_date/:end_date",
    require("./api/consumer/rrReport.js")
  );
  app.get(
    "/threetimesbillmodefiedconsumers/date/:start_date/:end_date",
    require("./api/correctionReport/conteneouethreetimesbillmodefiedconsumers.js")
  );
  app.get(
    "/pendingCollectionreports/date/:start_date/:end_date",
    require("./api/correctionReport/pendingcollectionreports.js")
  );
  /*
    quickbillapi
    */
  app.get(
    "/latestactivenotpaidbill/agency/:agency_id/consumer/:consumer_number",
    require("./api/tempCashCollection/getlatestactivebillbyconsumer.js")
  );

  /*
    getConsumptionby consumeraccount_number
    */
  app.get(
    "/getConsumptionDetailsByConsumerAccountNumber/:consumer_account_number",
    require("./api/meterreading/getconsumptionbyconsumerid.js")
  );
  app.get(
    "/getAllBillDetails/account/:consumer_account_number",
    require("./api/tempCashCollection/getBillDetailsByAccountId.js")
  );
  app.get(
    "/getOneConsumerBillDetailsactivenotpaid/agency/:agency_id/consumer/:consumer_number",
    require("./api/tempCashCollection/getlatestnotpaidbillbycan.js")
  );
  app.put(
    "/upadateuserdata/user_id/:user_id",
    require("./api/consumer/updateuserdetails.js")
  );
  app.get(
    "/getbilldetailsdata/agency_id/:agency_id/bill_id/:bill_id",
    require("./api/tempCashCollection/getbillbybillid.js")
  );

  /*
   new port required api
   */

  app.get(
    "/getallgeneratedbills/:job_number",
    require("./api/billGenerating/getallgeneratedbill.js")
  );
  app.post(
    "/insertbillgeneratingjob",
    require("./api/billGenerating/billgeneratingjob.js")
  );
  app.get(
    "/getbillgeneratingjob/:job_id",
    require("./api/billGenerating/getjobformbillgeneratedtable.js")
  );
  app.post(
    "/deletebillgeneratingjob",
    require("./api/billGenerating/deletejobformbillgeneratedjob.js")
  );
}
