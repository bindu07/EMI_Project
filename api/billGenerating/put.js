  'use strict';
    var async = require('async');
    var moment = require('moment');
    require('../../helpers/sendSms.js');

    module.exports = post;
    global.totalconsumers=0;
    global.totalbillgeneratdconsumers=0;
    global.totalTimeToExecute   =   0;
    function post(req, res , next)
    {
        var box = {
            req: req,
            res: res,
            reqParams: req.params,
            reqBody: req.body,
            consumerDetails : [],
            resBody: {}
        };
        box.whoAmI = post.name;
        console.info(box.reqBody)
        console.info(box.whoAmI, 'Starting');
        async.series([
            checkInputParams.bind(null, box)
            ],
            function (err)
            {
                console.info(box.whoAmI, 'Completed');
                if (err)
                {
                    return respondWithError(res, err);
                }
                sendJSONResponse(res, box.resBody);
                async.series([
                    getAllConsumersOfJob.bind(null, box),
                    validateConsumption.bind(null, box),
                    calculatePricing.bind(null, box),
                    validateConsumptionForMS1.bind(null,box),
                    checkArrers.bind(null,box),
                    checkArrersForPartialPayment.bind(null,box),
                    updateArrersForCollectionDetails.bind(null,box),
                    insertIntoTempBillDetails.bind(null,box),
                    updatejobtablestatus.bind(null,box),
                    ]);
            });
    }

    function checkInputParams(box, nextFunc) {
        var whoAmI = box.whoAmI + '_' + checkInputParams.name;
        console.debug('Executing ->', whoAmI );

        if (!box.reqBody.due_date)
            return nextFunc(
                new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :due_date')
                );
        if (!box.reqBody.created_by)
            return nextFunc(
                new ActErr(whoAmI, ActErr.DataNotFound, 'Missing body data :created_by')
                );
        return nextFunc();
    }

    function getAllConsumersOfJob(box, nextFunc)
    {
        totalbillgeneratdconsumers=0;
        totalconsumers=0;
        var whoAmI = getAllConsumersOfJob.name;
        var today = new Date();
        var selected_columns = '';
        selected_columns += 'j.id as job_id,';
        selected_columns += 'j.meter_reading_month,';
        selected_columns += 'j.consumption_months,';
        selected_columns += 'jd.id as job_detail_id,';
        selected_columns += 'jd.error_code,';
        selected_columns += 'jd.previous_reading,';
        selected_columns += 'jd.meter_reading,';
        selected_columns += 'ca.consumer_account_number,';
        selected_columns += 'ca.meter_number,';
        selected_columns += 'ca.meter_status,';
        selected_columns += 'ca.own_meter,';
        selected_columns += 'pd.pipe_diameter,';
        selected_columns += 'pd.pipe_diameter_id,';
        selected_columns += 'ct.connection_type,';
        selected_columns += 'ct.connection_type_id,';
        selected_columns += 'ca.is_apartment,';
        selected_columns += 'ca.number_of_apartments,';
        selected_columns += 'ca.average_consumption';
        var status="active";
        var getAllMeterReadings = "select "+selected_columns+" from job_details as jd LEFT JOIN job j ON j.id = jd.job_id LEFT JOIN consumer_accounts as ca ON jd.consumer_account_number = ca.consumer_account_number LEFT JOIN pipe_diameter as pd on pd.pipe_diameter_id = ca.pipe_diameter LEFT JOIN connection_type as ct on ct.connection_type_id = ca.connection_type where jd.status='"+status+"' and job_id = '"+box.reqParams.job_id+"'";
        con.query(getAllMeterReadings,function (err_validate, result_validate) {
            if(result_validate.length <= 0 && err_validate)
            {
                box.resBody.messageForNormal = "No Reords Found !";
            }
            else
            {
                console.info("Building Consumer Details");
                for(var i =0; i<result_validate.length;i++)
                {
                    box.consumerDetails[i] = {
                        "row_id"                          : i,
                        "consumer_account_number"         : result_validate[i]['consumer_account_number'],
                        "job_number"                      : result_validate[i]['job_id'],
                        "job_detail_id"                   : result_validate[i]['job_detail_id'],
                        "error_code"                      : result_validate[i]['error_code'],
                        "agency_id"                       : box.reqParams.agency_id,
                        "serial_number"                   : "test",
                        "meter_number"                    : result_validate[i]['meter_number'],
                        "meter_status"                    : result_validate[i]['meter_status'],
                        "own_meter"                       : result_validate[i]['own_meter'],
                        "pipe_diameter"                   : result_validate[i]['pipe_diameter'],
                        "pipe_diameter_id"                : result_validate[i]['pipe_diameter_id'],
                        "connection_type"                 : result_validate[i]['connection_type'],
                        "connection_type_id"              : result_validate[i]['connection_type_id'],
                        "connection_name"                 : result_validate[i]['connection_name'],
                        "previous_reading"                : result_validate[i]['previous_reading'],
                        "current_reading"                 : result_validate[i]['meter_reading'],
                        "total_consumption"               : parseInt(result_validate[i]['meter_reading'] - parseInt(result_validate[i]['previous_reading'])),
                        "consumption_month_billing"       : result_validate[i]['meter_reading_month'],
                        "average_consumption_per_month"   : result_validate[i]['average_consumption_per_month'],
                        "consumption_months"              : result_validate[i]['consumption_months'],
                        "bill_month"                      : moment(today).format("MMMM YYYY"),
                        "average_consumption_per_month"   : result_validate[i]['average_consumption'],
                        "average_consumption"             : result_validate[i]['average_consumption'],
                        "is_apartment"                    : result_validate[i]['is_apartment'],
                        "number_of_apartments"            : result_validate[i]['number_of_apartments'],
                        "consumption_per_flat"            : "",
                        "total_bill"                      : 0,
                        "arrears"                         : 0,
                        "old_dpc"                         : 0,
                        "final_bill"                      : 0,
                        "new_dpc_or_penalty"              : 0,
                        "bill_after_due_date"             : 0,
                        "current_month_amount"            : 0,
                        "calculating_month_amount"        : 0,
                        "due_date"                        : box.reqBody.due_date,
                        "bill_created_month"              : today,
                        "created_by"                      : box.reqBody.created_by,
                        "created_on"                      : today,
                        "partial_paid"                    : "no",
                        "partial_paid_bill_id"            :  "",
                        "partial_paid_consumer_number"    :  ""
                    }
                    totalconsumers++;
                }
            }
        });
        setTimeout(function(){
            var size =  0;
            if(parseInt(box.consumerDetails.length) <= 100)
            {
                size    =   250;
            }else
            {
                size    =   box.consumerDetails.length;
            }
            global.totalTimeToExecute   =   parseFloat(size) * parseFloat(50);
            console.info('TIME TO EXECUTE ===> '+totalTimeToExecute);
            console.info('box.consumerDetails.length ===> '+box.consumerDetails.length);
            return nextFunc();
        }, 13000);
    }

    function validateConsumption(box, nextFunc)
    {
        
        var whoAmI = validateConsumption.name;
        async.forEach(box.consumerDetails,function(row,callback){
            console.info("<----- START VALIDATION CONSUMPTION FUNCTION ----->");
            var sqlToGetData = 'select minimum_consumption_value,minimum_billing_value,minimum_consumption_value_for_pipe_peice,minimum_billing_value_for_pipe_peice from minimum_consumption WHERE pipe_diameter_id = '+row.pipe_diameter_id+' AND connection_type_id = '+row.connection_type_id+'';
            console.info("QUERY TO GET MINIMUM CONSUMPTION");
            console.info(sqlToGetData);
            console.info("QUERY TO GET MINIMUM CONSUMPTION");
            con.query(sqlToGetData,function (err, result) {
                if (result.length <= 0 && err)
                {
                    console.info("Error In => "+whoAmI);
                }
                else
                {
                     console.info("consumption="+row.total_consumption);
                    if(row.total_consumption < result[0]['minimum_consumption_value'] && row.is_apartment != 'yes' && row.error_code != 4)
                    {
                        console.info("Assigining Minimum value : ");
                        console.info("Assigining Minimum value : "+result[0]['minimum_consumption_value']);
                        console.info(row.is_apartment);
                        console.info(row.number_of_apartments);
                        console.info(row.total_consumption);
                        if(row.is_apartment == 'yes' && row.number_of_apartments > 1)
                        {
                            row.consumption_per_flat    =   parseFloat(row.total_consumption) / parseFloat(row.number_of_apartments);
                        }
                        else
                        {
                            row.total_consumption = result[0]['minimum_consumption_value'];
                            row.total_consumption = result[0]['minimum_consumption_value'];
                        }
                    }
                    else if((row.is_apartment == 'yes' && row.number_of_apartments > 1) || (row.error_code == 1 && row.is_apartment == 'yes' && row.number_of_apartments > 1) && row.error_code != 4)
                    {
                        if(row.error_code == 1 && row.total_consumption == 0)
                        {
                            row.total_consumption = result[0]['minimum_consumption_value'];
                        }
                        else if(row.error_code == 1 && row.total_consumption < result[0]['minimum_consumption_value'])
                        {
                            row.total_consumption = result[0]['minimum_consumption_value'];
                        }
                        console.info("CHECKING VALIDATION");
                        console.info("consumer_account_number   ===> "+row.consumer_account_number);
                        console.info("is_apartment              ===> "+row.is_apartment);
                        console.info("number_of_apartments      ===> "+row.number_of_apartments);
                        console.info("total_consumption         ===> "+row.total_consumption);
                        row.consumption_per_flat                =   parseFloat(row.total_consumption) / parseFloat(row.number_of_apartments);
                        console.info("consumption_per_flat      ===> "+row.consumption_per_flat);
                        console.info("CHECKING VALIDATION");
                    }
                }
            });
            console.info("<----- END VALIDATION CONSUMPTION FUNCTION ----->");
        });
        setTimeout(function(){
            return nextFunc();
        }, global.totalTimeToExecute);
    }

    function calculatePricing(box,nextFunc)
    {
        var whoAmI = calculatePricing.name;
        async.forEach(box.consumerDetails,function(row,callback){
            var total_consumption       =      0;
            console.info("<----- START CALCULATING PRICING FUNCTION ----->");
            console.info("is_apartment          ====> "+row.is_apartment);
            console.info("number_of_apartments  ====> "+row.number_of_apartments);
            if(row.is_apartment == 'yes' && row.number_of_apartments > 1)
            {
                console.info("consumption_per_flat  ====> "+row.consumption_per_flat);
                total_consumption       =       row.consumption_per_flat;
            }
            else
            {
                total_consumption       =       row.total_consumption;
            }
            var sql_to_get_pricing = 'SELECT * FROM pricing WHERE connection_type_id = "'+row.connection_type_id+'"';
            con.query(sql_to_get_pricing,function (pricing_err, pricing_result) {
                if (pricing_result.length <= 0 || pricing_err)
                {
                    console.info(pricing_err);
                    console.info("Error In pricing_err => "+whoAmI);
                }
                else
                {
                    var temp_value            = 0;
                    var multiply_value        = 0;
                    var temp_bill             = 0;
                    var previous_max_consumption  = 0;
                    console.info("total_consumption before calculating price    =====> "+total_consumption);
                    for(var a = 0 ; a < pricing_result.length ; a++)
                    {
                        console.info("pricing_result[a]['min_consumption'] =====> "+pricing_result[a]['min_consumption']);
                        if(total_consumption > pricing_result[a]['min_consumption'])
                        {
                            console.info('min_consumption     => '+pricing_result[a]['min_consumption']);
                            console.info('max_consumption     => '+pricing_result[a]['max_consumption']);
                            console.info('total_consumption   => '+total_consumption);
                            console.info('connection_type_id  => '+row.connection_type_id);
                            console.info('PREVIOUS TEMP BILL  => '+temp_bill);
                            if(total_consumption > pricing_result[a]['max_consumption'] )
                            {
                                multiply_value = parseFloat(pricing_result[a]['max_consumption']) - parseFloat(previous_max_consumption);
                            }
                            else
                            {
                                var j = parseInt(a)-parseInt(1);
                                multiply_value = parseFloat(total_consumption) - parseFloat(previous_max_consumption);
                            }
                            console.info("multiply_value      => "+multiply_value);
                            console.info("price_per_1000_liter=> "+pricing_result[a]['price_per_1000_liter']);
                            temp_bill = parseFloat(temp_bill) + parseFloat(parseFloat(parseFloat(multiply_value)/1000) * parseFloat(pricing_result[a]['price_per_1000_liter']));
                            console.info("TEMP bill Value          => "+temp_bill);
                            if(row.is_apartment == 'yes' && row.number_of_apartments > 1)
                            {
                                //row.total_bill = parseFloat(temp_bill) * parseFloat(row.number_of_apartments);
                                /* 2=> House Lock and 6 => No Use */
                                if(row.error_code == '2' || row.error_code == '6')
                                {
                                    row.total_bill = parseFloat(temp_bill);
                                }
                                else
                                {
                                    row.total_bill = parseFloat(temp_bill) * parseFloat(row.number_of_apartments);
                                    console.info("total_billwithapartment     => "+ row.total_bill);
                                }
                                row.calculating_month_amount = parseFloat(row.total_bill);
                            }
                            else
                            {
                                row.total_bill = temp_bill;
                                row.calculating_month_amount = temp_bill;
                            }
                        }
                        previous_max_consumption = pricing_result[a]['max_consumption'];
                    }
                }
            });
            console.info("<----- END CALCULATING PRICING FUNCTION ----->");
        });
    setTimeout(function(){
        return nextFunc();
    }, global.totalTimeToExecute);
}

function validateConsumptionForMS1(box, nextFunc)
{
    var whoAmI = validateConsumptionForMS1.name;
    async.forEach(box.consumerDetails,function(row,callback){
        var sqlToGetData = 'select minimum_consumption_value,minimum_billing_value,minimum_consumption_value_for_pipe_peice,minimum_billing_value_for_pipe_peice from minimum_consumption WHERE pipe_diameter_id = '+row.pipe_diameter_id+' AND connection_type_id = '+row.connection_type_id+'';
        con.query(sqlToGetData,function (err, result) {
            if (result.length <= 0 && err)
            {
                console.info("Error In => "+whoAmI);
            }
            else
            {
                if(row.total_consumption <= result[0]['minimum_consumption_value'] && row.error_code == 1 && row.is_apartment != 'yes')
                {
                    row.total_bill = result[0]['minimum_billing_value'];
                    row.calculating_month_amount = result[0]['minimum_billing_value'];
                }
                if(row.connection_type_id == '1')
                {
                    if(row.error_code == '2' || row.error_code == '6' || row.error_code == '10')
                    {
                        row.total_bill = result[0]['minimum_billing_value'];
                        row.calculating_month_amount = result[0]['minimum_billing_value'];
                    }
                    else if(row.error_code == '3')
                    {
                        if(parseInt(row.average_consumption) < parseInt(result[0]['minimum_consumption_value'])){
                            row.total_bill = result[0]['minimum_billing_value'];
                            row.calculating_month_amount = result[0]['minimum_billing_value'];
                        }
                    }
                    else if(row.error_code == '5' || row.error_code == '8')
                    {
                        if(parseInt(row.average_consumption) < parseInt(result[0]['minimum_consumption_value_for_pipe_peice'])){
                            row.total_bill = result[0]['minimum_billing_value_for_pipe_peice'];
                            row.calculating_month_amount = result[0]['minimum_billing_value_for_pipe_peice'];
                        }
                    }
                }
            }
        });
    });
    setTimeout(function(){
        return nextFunc();
    }, global.totalTimeToExecute);
}

function checkArrers(box,nextFunc)
{
    var whoAmI = checkArrers.name;
    async.forEach(box.consumerDetails,function(row,callback){
        if(row.error_code == '4')
        {
            row.total_bill                  =   0;
            row.calculating_month_amount    =   0;
        }
        console.info("<----- START CHECK ARRERS FUNCTION ----->");
        var sql_to_not_paid_bills = 'SELECT consumer_account_number,bill_id,payment_status,bill_after_due_date,current_month_amount,total_bill,arrears,delayed_payment_charges,penalty FROM temp_bill_details WHERE consumer_account_number = "'+row.consumer_account_number+'" AND payment_status = "Not Paid" AND bill_status = "active" order by bill_id desc Limit 1 ';
        con.query(sql_to_not_paid_bills,function (not_paid_bills_err, not_paid_bills_result) {
            if (not_paid_bills_err)
            {
                console.info("Error In not_paid_bills_err => "+whoAmI);
            }
            else
            {
                if(not_paid_bills_result.length <= 0)
                {
                    console.info("With out arrears");
                    var total_bill          =   row.total_bill;
                    if(row.is_apartment == 'yes' && row.number_of_apartments > 1)
                    {
                        //row.current_month_amount=   parseFloat(row.calculating_month_amount)*parseFloat(row.number_of_apartments);
                         row.current_month_amount=   parseFloat(row.calculating_month_amount);
                    }
                    else
                    {
                        row.current_month_amount=   row.calculating_month_amount;
                    }
                    var arrears             =   0;
                    var old_dpc             =   0;
                    var final_bill          =   parseFloat(row.total_bill) ;
                    var new_dpc_or_penalty  =   parseFloat(parseFloat(row.current_month_amount)*parseFloat(2)) / 100;
                    var bill_after_due_date =   parseFloat(final_bill) + parseFloat(new_dpc_or_penalty);
                    console.info("total_bill            => "+total_bill);
                    console.info("arrears               => "+arrears);
                    console.info("old_dpc               => "+old_dpc);
                    console.info("final_bill            => "+final_bill);
                    console.info("new_dpc_or_penalty    => "+new_dpc_or_penalty);
                    console.info("bill_after_due_date   => "+bill_after_due_date);
                    console.info("<---------   Not Paid Bill is ZERO ------------>");
                    row.total_bill          =   final_bill;
                    row.arrears             =   arrears;
                    row.old_dpc             =   old_dpc;
                    row.final_bill          =   final_bill;
                    row.new_dpc_or_penalty  =   new_dpc_or_penalty;
                    row.bill_after_due_date =   bill_after_due_date;
                }
                else
                {
                    for(var a = 0 ; a < not_paid_bills_result.length ; a++)
                    {
                        console.info("oldCMA"+not_paid_bills_result[a]['current_month_amount'])
                        var total_bill          =   row.total_bill;
                        if(row.is_apartment == 'yes' && row.number_of_apartments > 1)
                        {
                            //row.current_month_amount=   parseFloat(row.calculating_month_amount)*parseFloat(row.number_of_apartments);
                            row.current_month_amount=   parseFloat(row.calculating_month_amount);
                        }
                        else
                        {
                            row.current_month_amount=   row.calculating_month_amount;
                        }
                        var arrears             =   parseFloat(not_paid_bills_result[a]['current_month_amount']) + (parseFloat(not_paid_bills_result[a]['arrears']));
                        //var arrears             =   parseFloat(not_paid_bills_result[a]['bill_after_due_date']) - (parseFloat(not_paid_bills_result[a]['delayed_payment_charges']) - parseFloat(not_paid_bills_result[a]['penalty']));
                        //var old_dpc             =   parseFloat(not_paid_bills_result[a]['penalty']) + parseFloat(not_paid_bills_result[a]['delayed_payment_charges']);
                        var old_dpc             =   parseFloat(parseFloat(parseFloat(parseFloat(arrears)*parseFloat(2)) / 100)) + parseFloat(not_paid_bills_result[a]['delayed_payment_charges']);
                        var final_bill          =   parseFloat(row.calculating_month_amount) + parseFloat(not_paid_bills_result[a]['total_bill']);
                        var new_dpc_or_penalty  =   parseFloat(parseFloat(parseFloat(row.current_month_amount)*parseFloat(2)) / 100) + parseFloat(parseFloat(parseFloat(arrears)*parseFloat(2)) / 100);
                        var bill_after_due_date =   parseFloat(final_bill) + parseFloat(new_dpc_or_penalty);

                       //var bill_after_due_date =   parseFloat(final_bill) + parseFloat(new_dpc_or_penalty) + parseFloat(old_dpc);========>OLD Bill after due date
                        
                        console.info("total_bill            => "+total_bill);
                        console.info("arrears               => "+arrears);
                        console.info("old_dpc               => "+old_dpc);
                        console.info("final_bill            => "+final_bill);
                        console.info("new_dpc_or_penalty    => "+new_dpc_or_penalty);
                        console.info("bill_after_due_date   => "+bill_after_due_date);
                        console.info("<---------   Not Paid Bill is there ------------>");
                        row.total_bill          =   final_bill;
                        row.arrears             =   arrears;
                        //row.old_dpc             =   parseFloat(not_paid_bills_result[a]['penalty']) + parseFloat(not_paid_bills_result[a]['delayed_payment_charges']);
                        if(parseFloat(arrears) <= 0)
                        {
                            row.old_dpc             =   0;
                            new_dpc_or_penalty      =   parseFloat(parseFloat(parseFloat(row.current_month_amount)*parseFloat(2)) / 100);
                        }
                        else
                        {
                            row.old_dpc             =   parseFloat(parseFloat(parseFloat(parseFloat(arrears)*parseFloat(2)) / 100)) + parseFloat(not_paid_bills_result[a]['delayed_payment_charges']);
                        }
                        row.final_bill          =   parseFloat(row.calculating_month_amount)+ parseFloat(arrears)+ parseFloat(old_dpc);
                        row.new_dpc_or_penalty  =   new_dpc_or_penalty;
                        row.bill_after_due_date =   parseFloat(row.final_bill)+parseFloat(new_dpc_or_penalty);
                    }
                }
            }
        });
    console.info("<----- END CHECK ARRERS FUNCTION ----->");
});
    setTimeout(function(){
        return nextFunc();
    }, global.totalTimeToExecute);
}

function checkArrersForPartialPayment(box,nextFunc)
{
    var whoAmI = checkArrers.name;
    async.forEach(box.consumerDetails,function(row,callback){
        if(row.error_code == '4')
        {
            row.total_bill                  =   0;
            row.calculating_month_amount    =   0;
        }
        console.info("<----- START CHECK ARRERS FUNCTION ----->");
        var sql_to_not_paid_bills = 'SELECT consumer_account_number,bill_id,payment_status,bill_after_due_date,current_month_amount,total_bill,arrears,delayed_payment_charges,penalty FROM temp_bill_details WHERE consumer_account_number = "'+row.consumer_account_number+'" AND payment_status = "Partial Payment" AND bill_status = "active" Limit 1';
        con.query(sql_to_not_paid_bills,function (not_paid_bills_err, not_paid_bills_result) {
            if (not_paid_bills_err)
            {
                console.info("Error In not_paid_bills_err => "+whoAmI);
            }
            else
            {
                if(not_paid_bills_result.length > 0)
                {
                    console.info("Length of Partial paid bills => "+not_paid_bills_result.length);
                    for(var a = 0 ; a < not_paid_bills_result.length ; a++)
                    {
                        console.info("consumer account number=> "+not_paid_bills_result[a]['consumer_account_number']);
                        var total_bill          =   row.total_bill;
                        if(row.is_apartment == 'yes' && row.number_of_apartments > 1)
                        {
                            //row.current_month_amount=   parseFloat(row.calculating_month_amount)*parseFloat(row.number_of_apartments);
                            row.current_month_amount=   parseFloat(row.calculating_month_amount);
                        }
                        else
                        {
                            row.current_month_amount=   row.calculating_month_amount;
                        }
                        row.partial_paid                    =  "yes"
                        row.partial_paid_bill_id            =   not_paid_bills_result[a]['bill_id'];
                        row.partial_paid_consumer_number    =   not_paid_bills_result[a]['consumer_account_number'];
                        console.info(" Setting partial paid to YES for consumer "+row.partial_paid_consumer_number);
                    }
                }
            }
        });
    console.info("<----- END CHECK ARRERS FUNCTION ----->");
});
 setTimeout(function(){
    console.info("Returning to Next function");
        return nextFunc();
    }, global.totalTimeToExecute);
}

function updateArrersForCollectionDetails(box,nextFunc)
{
    var whoAmI = updateArrersForCollectionDetails.name;
    console.info(" whoAmI => "+whoAmI);
    async.forEach(box.consumerDetails,function(row,callback){
        console.info("Parital Paid  VALUE ==> "+row.partial_paid);
        if(row.partial_paid == "yes")
        {
            var sql_to_get_partial_paid_bills = 'SELECT * FROM collection_details where bill_id = "'+row.partial_paid_bill_id+'" AND consumer_account_number = "'+row.partial_paid_consumer_number+'" ';
            con.query(sql_to_get_partial_paid_bills,function (partial_paid_bills_err, partial_paid_bills_result) 
            {
                if (partial_paid_bills_err)
                {
                    console.info("Error In partial_paid_bills_err => "+whoAmI);
                    console.info(partial_paid_bills_err);
                }
                else
                {
                    console.info(" Collection Details Length ==> "+partial_paid_bills_result.length);
                    for(var b = 0 ; b < partial_paid_bills_result.length ; b++)
                    {
                        var total_bill          =   row.total_bill;
                        console.info("Out stading month amount ===>  "+partial_paid_bills_result[b]['outstanding_current_month_amount']);
                        console.info("outstanding_arrears ===>  "+partial_paid_bills_result[b]['outstanding_arrears']);
                        console.info("Ooutstanding_penaltyt ===>  "+partial_paid_bills_result[b]['outstanding_penalty']);
                        console.info("outstanding_dpc ===>  "+partial_paid_bills_result[b]['outstanding_dpc']);
                    if(partial_paid_bills_result[b]['outstanding_current_month_amount'] == null || partial_paid_bills_result[b]['outstanding_current_month_amount'] == "")
                    {
                        partial_paid_bills_result[b]['outstanding_current_month_amount']    =   0;
                    }
                    if(partial_paid_bills_result[b]['outstanding_arrears'] == null || partial_paid_bills_result[b]['outstanding_arrears'] == "")
                    {
                        partial_paid_bills_result[b]['outstanding_arrears']    =   0;
                    }
                    if(partial_paid_bills_result[b]['outstanding_penalty'] == null || partial_paid_bills_result[b]['outstanding_penalty'] == "")
                    {
                        partial_paid_bills_result[b]['outstanding_penalty']    =   0;
                    }
                    if(partial_paid_bills_result[b]['outstanding_dpc'] == null || partial_paid_bills_result[b]['outstanding_dpc'] == "")
                    {
                        partial_paid_bills_result[b]['outstanding_dpc']    =   0;
                    }


                        var arrears             =   parseFloat(partial_paid_bills_result[b]['outstanding_current_month_amount']) + parseFloat(parseFloat(partial_paid_bills_result[b]['outstanding_arrears']));
                        //var old_dpc             =   parseFloat(partial_paid_bills_result[a]['outstanding_penalty']) + parseFloat(partial_paid_bills_result[a]['outstanding_dpc']);
                        var old_dpc             =   parseFloat(parseFloat(parseFloat(parseFloat(arrears)*parseFloat(2)) / 100)) + parseFloat(partial_paid_bills_result[b]['outstanding_dpc']);
                        var final_bill          =   parseFloat(row.calculating_month_amount) + parseFloat(partial_paid_bills_result[b]['outstanding_current_month_amount']) + (parseFloat(partial_paid_bills_result[b]['outstanding_arrears'])) + parseFloat(old_dpc);
                        var new_dpc_or_penalty  =   parseFloat(parseFloat(parseFloat(row.current_month_amount)*parseFloat(2)) / 100) + parseFloat(parseFloat(parseFloat(arrears)*parseFloat(2)) / 100) +  parseFloat(partial_paid_bills_result[b]['outstanding_penalty']);
                        var bill_after_due_date =   parseFloat(final_bill) + parseFloat(new_dpc_or_penalty);
                        console.info("total_bill            => "+total_bill);
                        console.info("arrears               => "+arrears);
                        console.info("old_dpc               => "+old_dpc);
                        console.info("final_bill            => "+final_bill);
                        console.info("new_dpc_or_penalty    => "+new_dpc_or_penalty);
                        console.info("bill_after_due_date   => "+bill_after_due_date);
                        console.info("<---------   Partial Paid Bill is there ------------>");
                        row.total_bill          =   final_bill;
                        row.arrears             =   arrears;
                        //row.old_dpc             =   parseFloat(partial_paid_bills_result[a]['outstanding_penalty']) + parseFloat(partial_paid_bills_result[a]['outstanding_dpc']);;
                        if(parseFloat(arrears) <= 0)
                        {
                            row.old_dpc             =   0;
                        }
                        else
                        {
                            row.old_dpc             =   parseFloat(parseFloat(parseFloat(parseFloat(arrears)*parseFloat(2)) / 100)) + parseFloat(partial_paid_bills_result[b]['outstanding_dpc']);
                        }
                        row.final_bill          =   final_bill;
                        row.new_dpc_or_penalty  =   new_dpc_or_penalty;
                        row.bill_after_due_date =   bill_after_due_date;
                    }
                }
            });
        }
    });
     setTimeout(function(){
        return nextFunc();
    }, global.totalTimeToExecute);
}

function insertIntoTempBillDetails(box, nextFunc)
{
    var whoAmI = insertIntoTempBillDetails.name;
    var today = new Date();
    var len = 4;
    var charSet = '0123456789';
    var serial_number = 0;
    async.forEach(box.consumerDetails,function(row,callback){
        var get_count = "select count(*) as count from temp_bill_details where agency_id = "+box.reqParams.agency_id;
        con.query(get_count,function (get_count_error, get_count) {
            if(get_count_error)
            {
                console.info("<---- Error In  get_count---->");
                console.info(get_count_error);
            }
            else
            {
                var randomString = '';
                for (var j = 0; j < len; j++)
                {
                    var randomPoz = Math.floor(Math.random() * charSet.length);
                    randomString += charSet.substring(randomPoz,randomPoz+1);
                }
                // console.info("Count Of Records In Table => "+get_count[0]['count']);
                serial_number =  box.reqParams.agency_id+randomString+(parseInt(get_count[0]['count'])+parseInt(row.row_id));
                row.serial_number = serial_number;
                var sql = "INSERT temp_bill_details SET ? ";
                    /*console.info(row);
                    console.info(sql);*/
                    updatePrviousBillsOfConsumerToInactive(row.consumer_account_number);
                    if(row.meter_number == "")
                    {
                        row.meter_number = null;
                    }
                    if(row.meter_status == "")
                    {
                        row.meter_status = null;
                    }
                    if(row.own_meter == "")
                    {
                        row.own_meter = null;
                    }
                    var InsertingValues = {
                        "row_id"                            : row.row_id,
                        "consumer_account_number"           : row.consumer_account_number,
                        "job_number"                        : row.job_number,
                        "job_detail_id"                     : row.job_detail_id,
                        "error_code"                        : row.error_code,
                        "agency_id"                         : box.reqParams.agency_id,
                        "serial_number"                     : row.serial_number,
                        "meter_number"                      : row.meter_number,
                        "meter_status"                      : row.meter_status,
                        "own_meter"                         : row.own_meter,
                        "previous_reading"                  : row.previous_reading,
                        "current_reading"                   : row.current_reading,
                        "consumption_month_billing"         : row.meter_reading_month,
                        "average_consumption_per_month"     : row.average_consumption_per_month,
                        "consumption_months"                : row.consumption_months,
                        "total_bill"                        : parseFloat(row.final_bill),
                        "current_month_amount"              : parseFloat(row.current_month_amount),
                        "arrears"                           : parseFloat(row.arrears),
                        "delayed_payment_charges"           : parseFloat(row.old_dpc),
                        "penalty"                           : parseFloat(row.new_dpc_or_penalty),
                        "bill_after_due_date"               : parseFloat(row.bill_after_due_date),
                        "bill_month"                        : moment(today).format("MMMM YYYY"),
                        "average_consumption_per_month"     : row.average_consumption,
                        "due_date"                          : box.reqBody.due_date,
                        "bill_created_month"                : today,
                        "created_by"                        : box.reqBody.created_by,
                        "created_on"                        : today,
                        "charges_per_1k"                    : row.charges_per_1k,
                        "original_total_bill"               : parseFloat(row.final_bill),
                        "original_month_bill_amount"        : parseFloat(row.current_month_amount),
                        "original_arrears"                  : parseFloat(row.arrears),
                        "original_delayed_payment_charges"  : parseFloat(row.old_dpc)
                    }
                    con.query(sql,InsertingValues,function (errUpdate,resultUpdate ) {
                        if(errUpdate)
                        {
                            console.info("<---- Error In  Insert temp_bill_details ---->");
                            console.info(errUpdate);
                        }
                        else
                        {   
                            console.info("<------ INSERTING DONE FOR CONSUMER ACCOUNT NUMBER : "+row.consumer_account_number+" ------>");
                            totalbillgeneratdconsumers++;
                            var activity_type = 'bill';
                            sendSmsToConsumer(row.consumer_account_number,row.final_bill,box.reqBody.due_date);
                            updatePrviousReadingOfConsumer(row.current_reading,row.meter_reading_month,row.error_code,row.consumer_account_number)
                            validatingAndBillLogs(row.created_by,row.job_id,row.job_detail_id,row.consumer_account_number,activity_type);
                            updatejobdetailstablestatus(box.reqParams.job_id,row.consumer_account_number);
                            callback();
                        }
                    });
                }
            });
});
    return nextFunc();
}

function sendSmsToConsumer(consumer_account_number,final_bill,due_date){
    var today = new Date();
    var month= moment(today).format("MMMM YYYY");
    var sql="SELECT U.mobile_number FROM consumer_accounts as CA LEFT JOIN users U ON CA.user_id = U.user_id WHERE CA.consumer_account_number="+consumer_account_number;
    con.query(sql,function (err, result) {
        if (err)
        {
            return false;
        }
        else
        {
            if(result.length >= 1)
            {
                    // console.info(result);
                    var mobile_number=result[0].mobile_number;
                    var due_date1 = moment(due_date).format("DD-MM-YYYY");
                    sendSms(mobile_number,'MJP water bill is generated for Consumer No : '+consumer_account_number+' Month '+month+' bill Amount '+final_bill+'.please view and pay bill by Mobile App/ online on '+due_date1+'.');
                }
            }
        });
    return true;
}

function updatePrviousReadingOfConsumer(current_reading,meter_reading_month,previous_error_code,consumer_account_number)
{
    var inserting_data = {
        "previous_reading"          : current_reading,
        "previous_reading_month"    : meter_reading_month,
        "previous_error_code"       : previous_error_code
    }
    var sql = "UPDATE consumer_accounts SET ? WHERE consumer_account_number = '"+consumer_account_number+"'";
    // console.info(sql);
    con.query(sql,inserting_data,function (errUpdate,resultUpdate ) {
        if(errUpdate){
            return false;        
        }else {
            return true;
        }
    });
}


function updatePrviousBillsOfConsumerToInactive(consumer_account_number)
{
    var inserting_data = {
        "bill_status"          : 'inactive'
    }
    var sql = "UPDATE temp_bill_details SET ? WHERE consumer_account_number = '"+consumer_account_number+"'";
    // console.info(sql);
    con.query(sql,inserting_data,function (errUpdate,resultUpdate ) {
        if(errUpdate){
            return false;        
        }else {
            return true;
        }
    });
}
function updatejobdetailstablestatus(job_id,consumer_account_number)
{
    var inserting_data = {
        "status"          : 'billgenerated'
    }
    var sql = 'UPDATE job_details SET ? WHERE consumer_account_number = "'+consumer_account_number+'" and job_id="'+job_id+'"';
    // console.info(sql);
    con.query(sql,inserting_data,function (errUpdate,resultUpdate ) {
        if(errUpdate){
            return false;        
        }else {
            
            return true;
        }
    });
}

function updatejobtablestatus(box,job_id,status)
{
     
  if((totalbillgeneratdconsumers==totalconsumers) && totalbillgeneratdconsumers!=0 &&totalconsumers !=0){
        var status="Billgenerated";
        updatejobstatus(box,box.reqParams.job_id,status);
            }
            else{
        var status="Partialbillgenerated";
        updatejobstatus(box,box.reqParams.job_id,status);
            }
     
}

function updatejobstatus(box,job_id,status)
{
     console.info("totalbillgeneratdconsumers=>"+totalbillgeneratdconsumers);
     console.info("totalconsumers=>"+totalconsumers);
    console.info("jobstatus=>"+status);
    var inserting_status = {
        "status"          : status
    }
    var sql = 'UPDATE job SET ? WHERE id="'+job_id+'"';
    // console.info(sql);
    con.query(sql,inserting_status,function (errUpdate,resultUpdate ) {
        if(errUpdate){
            return false;
        }else {
            return true;
        
        }
    });
}