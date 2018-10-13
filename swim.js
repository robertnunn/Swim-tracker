function tapUpdate(times){
    //get relevant objects from page
    var cnt = document.getElementById("counter"); //grabs lap counter cell from results table
    var current_lap = cnt.innerHTML //get the text in the lap counter cell
    var routine = document.getElementById("routine").value; //get the currently selected routine
    var txt = ""; //txt is the new lap counter display string
    var color; //color the background will be changed to
    var timer_table = document.getElementById("timer");
    
    times = add_new_time(timer_table, times);
    switch(routine){ //switch statement updates the lap counter based on selected routine
        case "none": //pick a routine, ya git!
            txt = "Select a routine!";
            break;
        case "old1k":
            if(current_lap == "Done!"){ //check if we're finished and always display "Done!" if we are
                txt = "Done!";
                color = STROKE_COLOR_DONE;
                break; //exit the switch if we're done and don't do any math; we don't need it!
            }
            //slice up the text from the lap counter and extract the set number and lap number
            var set = Number(current_lap.slice(0,1));
            var lap = Number(current_lap.slice(2,3));
            var stroke = "Free"; //default stroke
            
            
            if(lap>5){ //6 laps per set in this routine
                set++;
                lap = 1;
            }else{
                lap++;
            }
            
            if(lap < 3){ //2 free, 2 breast, 2 back per set, in that order
                stroke = "Free";
            }else if(lap < 5){
                stroke = "Breast";
            }else{
                stroke = "Back";
            }
            
            color = lap_color(lap, stroke); //pick background color
            
            if(set==4 && lap>2){ //if we're done (20 laps), say so
                txt = "Done! " + format_time(times[times.length-1] - times[0])
                color = STROKE_COLOR_DONE;
                document.getElementById("timer").setAttribute("onclick", "");
            }else{ //if we're still swimming, update lap counter
                txt = set + "-" + lap + " " + stroke;
            }
            
            break;
        case "1600_yards":
            txt = "Not implemented yet";
            break;
    }
    //window.alert(txt);
    cnt.innerHTML = txt;
    document.body.style.background = color;
}

function lap_color(lap, stroke){
    var color;
    if(lap % 2){ //alternate light and dark shades of the stroke colors for additional ways of checking that the lap counter updated
        switch(stroke){
            case "Free":
                color = STROKE_COLOR_FREE_LIGHT;
                break;
            case "Breast":
                color = STROKE_COLOR_BREAST_LIGHT;
                break;
            case "Back":
                color = STROKE_COLOR_BACK_LIGHT;
                break;
        }
    }else{
        switch(stroke){
            case "Free":
                color = STROKE_COLOR_FREE_DARK;
                break;
            case "Breast":
                color = STROKE_COLOR_BREAST_DARK;
                break;
            case "Back":
                color = STROKE_COLOR_BACK_DARK;
                break;
        }
    }
    return color;
}

function add_new_time(timer_table, times){
    
    var row = timer_table.insertRow(1);
    var lap_label = row.insertCell();
    var formatted_time = row.insertCell();

    times.push(Number(Date.now()));
    //console.log("times: " + times);
    
    if(times.length < 2){
        formatted_time.innerHTML = 0;
        //window.alert("begin timer");
    }else{
        var curr = times[times.length-1];
        var prev = times[times.length-2];
        //window.alert(prev);
        var diff = curr - prev;
        lap_label.innerHTML = document.getElementById("counter").innerHTML;
        formatted_time.innerHTML = format_time(diff);
    }
    formatted_time.style = "text-align:center";
    return times;
}

function format_time(diff){
    //diff is time difference in milliseconds
    var msec = diff % 1000; //get milliseconds
    var sec = ((diff - msec)/1000) % 60; //get seconds
    diff = (diff - sec*1000) - msec; //intermediate math to remove seconds and milliseconds
    var min = Math.floor(diff / 60000); //get minutes (converting MILLIseconds to minutes; num/60/1000)
    //time string creation
    time = String(Math.floor(min/10)) + String(min%10) 
        + ":" + String(Math.floor(sec/10)) + String(sec%10) 
        + "." + String(Math.floor(msec/100)) + String(Math.floor((msec%100)/10)) + String(Math.floor(msec%10));
    
    return time;
}

function routine_change(workout, times){
    var routine = document.getElementById("routine").value;
    var cnt = document.getElementById("counter");
    var start_val;
    
    switch(routine){
        case "none":
            start_val = "Please select a routine";
            break;
        case "1600yards":
            start_val = "WU: 1";
            break;
        case "old1k":
            start_val = "1-0 Free";
            break;
    }
    times = [];
    cnt.innerHTML = start_val;
    workout.file = routine + ".json";
    loadJSON(function(response){
		var jresponse = JSON.parse(response);
		//console.log(jresponse);
		//console.log(jresponse["workout"]);
		workout.cooldown = jresponse["cooldown"];
		workout.warmup = jresponse["warmup"];
		workout.workout = jresponse["workout"];
		//workout.push(JSON.parse(response))
		//return JSON.parse(response);
		//workout = jresponse;
	}, workout.file);
    //console.log("routine change");
    //var timer_table = document.getElementById("timer");
    //timer_table.outerHTML = "<table width=100% border=1 id='timer' onclick='tapUpdate(times)'><tr><td id='counter' style='font-size:200px; text-align:center' colspan=2>Please select a routine</td></tr><tr><td id='padding' height='300px' colspan=2>&nbsp;</td></tr></table>";
}

function loadJSON(callback, file_name) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    //var a = {};
    xobj.open('GET', file_name, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
            //workout = xobj.responseText;
        }
    };
    xobj.send(null);  
    //return a;
}

function setup(){
    var routine = document.getElementById("routine");
    routine.value = "none";
}

function stroke_lookup(stroke_id){
    var STROKE_LIST = ["Rest", "Free", "Breast", "Back", "Fly", "Side"];
    return STROKE_LIST[stroke_id];
}