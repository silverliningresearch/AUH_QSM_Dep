var quota_data;
var interview_data;
var today_flight_list;
var this_month_flight_list;
var daily_plan_data;
var removed_ids_data;

var currentDate; //dd-mm-yyyy
var currentMonth; //mm
var currentQuarter; //1, 2, 3, 4
var nextDate; //dd-mm-yyyy

var download_time;

var total_completed;
var total_completed_percent;
var total_quota_completed;
var total_hard_quota;
var total_quota = 500;

var T1_quota = 167;
var T1_completed;
var T3_quota = 333;
var T3_completed;

/************************************/
function initCurrentTimeVars() {
  var today = new Date();

  var day = '' + today.getDate();
  var month = '' + (today.getMonth() + 1); //month start from 0;
  var year = today.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  currentMonth =[month,year].join('-')
  currentDate = [day, month,year].join('-');
  //return [day, month,year].join('-');
  if (document.getElementById('year_month') && document.getElementById('year_month').value.length > 0)
  {
    if (document.getElementById('year_month').value != "current-month")
    {
      currentMonth = document.getElementById('year_month').value;
    }
  }
  console.log("currentMonth: ", currentMonth);
}

function isCurrentMonth(interviewEndDate)
{
// Input: "2023-04-03 10:06:22 GMT"
  var interviewDateParsed = interviewEndDate.split("-")

  var interviewYear = (interviewDateParsed[0]);
  var interviewMonth =(interviewDateParsed[1]);
  
  var result = false;

  if ( currentMonth ==[interviewMonth,interviewYear].join('-'))
  {
    result = true;
  }

   return result;
}

function getQuarterFromMonth(month)
{
  //Input: mm
  var quarter = 0;
  
  if ((month == '01') || (month == '02') || (month == '03')) {
    quarter = 1;  
  }
  else if ((month == '04') || (month == '05') || (month == '06')) {
    quarter = 2;  
  }
  else if ((month == '07') || (month == '08') || (month == '09')) {
    quarter = 3;  
  }
  else if ((month == '10') || (month == '11') || (month == '12')) {
    quarter = 4;  
  }
  return quarter;
}

function notDeparted(flight_time) {
  var current_time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai', hour12: false});
  //15:13:27
  var current_time_value  = current_time.substring(current_time.length-8,current_time.length-6) * 60;
  current_time_value += current_time.substring(current_time.length-5,current_time.length-3)*1;

  //Time: 0805    
  var flight_time_value = flight_time.substring(0,2) * 60 + flight_time.substring(2,4)*1;
  var result = (flight_time_value > current_time_value);
  return (result);
}

function isvalid_id(id)
{
  valid = true;

  var i = 0;
  for (i = 0; i < removed_ids_data.length; i++) 
  { 
    if (removed_ids_data[i].removed_id == id)
    {
      valid = false;
    }
  }
  return valid;
}

function prepareInterviewData() {
  var quota_data_temp = JSON.parse(target_quota);
  removed_ids_data = JSON.parse(removed_ids);

  var interview_data_full  = JSON.parse(interview_data_raw);
  var flight_list_full  = JSON.parse(AUH_Flight_List_Raw);

  initCurrentTimeVars();					
  
   //get quota data
   quota_data = [];
   quota_data.length = 0;
   for (i = 0; i < quota_data_temp.length; i++) {
     var quota_month =  quota_data_temp[i].Month + "-"  + quota_data_temp[i].Year; 
     if ((quota_month== currentMonth) && (quota_data_temp[i].Quota>0))
     {
       quota_data.push(quota_data_temp[i]);
     }
   }

  //get relevant interview data
  //empty the list
  interview_data = [];
  interview_data.length = 0;

  download_time = interview_data_full[0].download_time;
  for (i = 0; i < interview_data_full.length; i++) {
    var interview = interview_data_full[i];

    var interview_month = interview["InterviewEndDate"].substring(5,7);//"2023-04-03 06:18:18"
    
    if ((interview.InterviewState == "Complete") 
        && (isCurrentMonth(interview.InterviewEndDate))
      //&& (currentQuarter == interview_quarter)  
      )
    {
      if (interview["Dest"]) {

        var Terminal_Dest = '"Terminal_Dest"' + ":" + '"' + interview["Terminal"] +"-" + interview["Dest"] + '", ';
        var InterviewEndDate = '"InterviewEndDate"' + ":" + '"' +  interview["InterviewEndDate"]  + '", ';
        var Terminal = '"Terminal"' + ":" + '"' +  interview["Terminal"] ;
        var str = '{' + Terminal_Dest + InterviewEndDate + Terminal +'"}';

        if (isvalid_id(interview["InterviewId"])) //check if valid
        {
          interview_data.push(JSON.parse(str));
        }
        else
        {
          console.log("invalid id: ", interview);
        }
      }
      else{
        console.log("ignored interview: ", interview);
      }
    }
  }

  //prepare flight list
  //empty the list
  today_flight_list = [];
  today_flight_list.length = 0;
  
  this_month_flight_list  = []; //for DOOP
  this_month_flight_list.length = 0;
  
  for (i = 0; i < flight_list_full.length; i++) {
    let flight = flight_list_full[i];

    //only get today & not departed flight
    if (((currentDate ==flight.Date) && notDeparted(flight.Time))
        //|| (nextDate ==flight.Date)
        ) 
    { 
      //flight.Date_Time = flight.Date + " " + flight.Time;
      flight.Date_Time = flight.Time;
      today_flight_list.push(flight);
    }
    
    //currentMonth: 02-2023
    //flight.Date: 08-02-2023
    if (currentQuarter ==  getQuarterFromMonth(flight.Date.substring(3,5))) { 
      this_month_flight_list.push(flight);
    }		   
  }
 
  //add quota data
  daily_plan_data = [];
  daily_plan_data.length = 0;
  
  for (i = 0; i < today_flight_list.length; i++) {
    let flight = today_flight_list[i];
    for (j = 0; j < quota_data.length; j++) {
      let quota = quota_data[j];
      if ((quota.Terminal_Dest == flight.Terminal_Dest) && (quota.Quota>0))
      {
        flight.Quota = quota.Quota;
        daily_plan_data.push(flight);
       }
    }
  }
  // console.log("today_flight_list: ", today_flight_list);
  // console.log("quota_data: ", quota_data);
  // console.log("daily_plan_data: ", daily_plan_data);
  // console.log("interview_data: ", interview_data);
}
