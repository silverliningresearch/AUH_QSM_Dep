var total_arrival_quota = 250;
var total_arrival_completed;
var total_arrival_completed_percent;

/************************************/
function CalculateArrival() {
  var interview_data_temp  = JSON.parse(interview_data_arr_raw);
  
  total_arrival_completed = 0;
  for (i = 0; i < interview_data_temp.length; i++) {
    var interview = interview_data_temp[i];
    var interview_month = interview["InterviewEndDate"].substring(5,7);//"2023-04-03 06:18:18"
    var interview_quarter = getQuarterFromMonth(interview_month);
    //only get complete interview & not test
    if ((interview.InterviewState == "Complete")
    && (currentQuarter == interview_quarter) 
      )
    {
      total_arrival_completed++;
    }
  }
  total_arrival_completed_percent = (100*(total_arrival_completed/total_arrival_quota)).toFixed(0);   

}


