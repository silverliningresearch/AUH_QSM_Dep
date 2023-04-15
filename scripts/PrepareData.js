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
var total_quota;

/************************************/
function initCurrentTimeVars() {
  var today = new Date();

  var day = '' + today.getDate();
  var month = '' + (today.getMonth() + 1); //month start from 0;
  var year = today.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  currentDate = [day, month, year].join('-');
  currentMonth = month; //[month, year].join('-');;
  currentQuarter = getQuarterFromMonth(currentMonth);

  //////////
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate()+1);
  var tomorrowMonth = '' + (tomorrow.getMonth() + 1); //month start from 0;
  var tomorrowDay = '' + tomorrow.getDate();
  var tomorrowYear = tomorrow.getFullYear();

  if (tomorrowMonth.length < 2) tomorrowMonth = '0' + tomorrowMonth;
  if (tomorrowDay.length < 2) tomorrowDay = '0' + tomorrowDay;

  nextDate  = [tomorrowDay, tomorrowMonth, tomorrowYear].join('-');
  //////////
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
  quota_data = JSON.parse(target_quota);
  removed_ids_data = JSON.parse(removed_ids);

  var interview_data_full  = JSON.parse(interview_data_raw);
  var flight_list_full  = JSON.parse(BUD_Flight_List_Raw);

  initCurrentTimeVars();						
  //get relevant interview data
  //empty the list
  interview_data = [];
  interview_data.length = 0;

  download_time = interview_data_full[0].download_time;
  for (i = 0; i < interview_data_full.length; i++) {
    var interview = interview_data_full[i];


    var interview_month = interview["InterviewEndDate"].substring(5,7);//"2023-04-03 06:18:18"
    var interview_quarter = getQuarterFromMonth(interview_month);
    
    if ((interview.InterviewState == "Complete") 
      //&& (currentMonth == interview_month)  
      && (currentQuarter == interview_quarter)  
      )
    {
      if (interview["Dest"]) {
        var airport_code = interview["Dest"];
        
        var airline_code = ""
        if (interview["AirlineCode"])  airline_code = interview["AirlineCode"];

        var Dest = '"Dest"' + ":" + '"' +  airport_code + '", ';
        var InterviewEndDate = '"InterviewEndDate"' + ":" + '"' +  interview["InterviewEndDate"] ;
        var str = '{' + Dest + InterviewEndDate + '"}';

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
      if ((quota.Dest == flight.Dest) && (quota.Quota>0))
      {
        flight.Quota = quota.Quota;
        daily_plan_data.push(flight);
       }
    }
  }
  console.log("today_flight_list: ", today_flight_list);
  console.log("quota_data: ", quota_data);
  console.log("daily_plan_data: ", daily_plan_data);
  console.log("interview_data: ", interview_data);
}
