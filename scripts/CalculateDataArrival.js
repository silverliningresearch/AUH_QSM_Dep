var total_arrival_quota = 250;
var total_arrival_completed;
var total_arrival_completed_percent;

var T1_quota_arr = 83;
var T1_completed_arr;
var T3_quota_arr = 167;
var T3_completed_arr;

var TA_quota_arr = 250;
var TA_completed_arr;

/************************************/
function CalculateArrival() {
  var interview_data_temp  = JSON.parse(interview_data_arr_raw);
  
  total_arrival_completed = 0;
  T1_completed_arr = 0;
  T3_completed_arr = 0;

  for (i = 0; i < interview_data_temp.length; i++) {
    var interview = interview_data_temp[i];
    var interview_month = interview["InterviewEndDate"].substring(5,7);//"2023-04-03 06:18:18"
    //only get complete interview & not test
    if ((interview.InterviewState == "Complete") 
        && (isCurrentMonth(interview.InterviewEndDate))
      )
    {
      total_arrival_completed++;
      if (interview.Terminal == "T1") {
        T1_completed_arr++;
      }
      else if (interview.Terminal == "T3")
      {
        T3_completed_arr++;
      }
      else if (interview.Terminal == "TA")
      {
        TA_completed_arr++;
      }

    }
  }
  total_arrival_completed_percent = (100*(total_arrival_completed/total_arrival_quota)).toFixed(0);   

}


