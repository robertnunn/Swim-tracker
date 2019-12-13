function tapUpdate(times){
    //get relevant objects from page
    var cnt = document.getElementById("counter"); //grabs lap counter cell from results table
    // var current_lap = cnt.innerHTML //get the text in the lap counter cell
    // var routine = document.getElementById("routine").value; //get the currently selected routine
    var next_lap;
    var timer_table = document.getElementById("timer");

    if(!STOP_TIMER){ //yes, it's a double-negative; no IDGAF
        times = add_new_lap(timer_table, times);
        next_lap = routine_labels.next();
        txt = next_lap.value[0];
        color = next_lap.value[1];
        cnt.innerHTML = txt;
        document.body.style.background = color;
        STOP_TIMER = next_lap.done; //generators return a .done property that is true when the last value has been returned
    }
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

function add_new_lap(timer_table, times){
    var row = timer_table.insertRow(1); //insert a new row after the main lap counter row
    var lap_label = row.insertCell(); //left cell tells you what the set/lap was
    var formatted_time = row.insertCell(); //right cell lists the time taken for that lap

    times.push(Number(Date.now()));
    //console.log("times: " + times);
    
    if(times.length < 2){
        formatted_time.innerHTML = 0;
    }else{
        var curr = times[times.length-1];
        var prev = times[times.length-2];
        var diff = curr - prev;
        lap_label.innerHTML = document.getElementById("counter").innerHTML;
        formatted_time.innerHTML = format_time(diff);
    }
    row.style.backgroundColor = document.body.style.backgroundColor;
    lap_label.style = "text-align:right";
    formatted_time.style = "text-align:left";
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

function routine_change(workout){
    var routine = document.getElementById("routine").value;

    document.body.style.backgroundColor = STROKE_COLOR_DONE;
    times = [];
    STOP_TIMER = false;
    //copy+paste of table defined in swim.html
    var reset_table = '<table width=100% border=1 id="timer" onmousedown="tapUpdate(times)"><tr><td id="counter" style="font-size:150px; text-align:center" colspan=2>Please select a routine</td></tr><tr><td id="padding" height="300px" colspan=2>&nbsp;</td></tr></table>';
    var timer_table = document.getElementById("timer");
    //resets the lap table 
    timer_table.outerHTML = reset_table;
    var cnt = document.getElementById("counter");
    if (routine != "none"){
        routine_labels = make_routine_generator(routines[routine]);
        cnt.innerHTML = routine_labels.next().value[0];
    }
}

function* make_routine_generator(workout){
    //creates a generator that iterates through a routine (the * makes it a generator)
    let label = "Tap to start " + workout.title;
    let stroke = "";
    let set_count = 0;
    // let lap = 1;
    yield [label, STROKE_COLOR_DONE];
    // loop through the warmup
    if(workout["warmup"] != null){
        for(i = 0; i < workout["warmup"].length; i++){ //loop through the top-level elements of the routine
            set = workout["warmup"][i]; //grab current set
            for(rep = 0; rep < set[0]; rep++){ //do the set for {rep} repetitions
                set_count++;
                for(lap = 0; lap < set[1].length; lap++){ //loop through the specific laps in the set
                    stroke = stroke_lookup(set[1][lap])
                    label = "WU: " + set_count + "-" + (lap+1) + " " + stroke;
                    yield [label, lap_color(lap+1, stroke)];
                }
            }
        }
        yield ["Rest!", STROKE_COLOR_DONE];
    }
    console.log("end warmup");
    
    //loop through the routine per se
    set_count = 0;
    if(workout["workout"] != null){
        for(i = 0; i < workout["workout"].length; i++){ //loop through the top-level elements of the routine
            set = workout["workout"][i]; //grab current set
            for(rep = 0; rep < set[0]; rep++){ //do the set for set[0] repetitions
                set_count++;
                for(lap = 0; lap < set[1].length; lap++){ //loop through the specific laps in the set
                    stroke = stroke_lookup(set[1][lap])
                    label = set_count + "-" + (lap+1) + " " + stroke;
                    yield [label, lap_color(lap+1, stroke)];
                }
            }
        }
    }
    console.log("end workout");
    //loop through the cool-down
    set_count = 0;
    if(workout["cooldown"] != null){
        yield ["Rest!", STROKE_COLOR_DONE];
        for(i = 0; i < workout["cooldown"].length; i++){ //loop through the top-level elements of the routine
            set = workout["cooldown"][i]; //grab current set
            for(rep = 0; rep < set[0]; rep++){ //do the set for {rep} repetitions
                set_count++;
                for(lap = 0; lap < set[1].length; lap++){ //loop through the specific laps in the set
                    stroke = stroke_lookup(set[1][lap])
                    label = "CD: " + set_count + "-" + (lap+1) + " " + stroke;
                    yield [label, lap_color(lap+1, stroke)];
                }
            }
        }
    }
    console.log("Done!");
    return ["Done! " + format_time(times[times.length-1] - times[0]), STROKE_COLOR_DONE];
}

function setup(){
    var routine = document.getElementById("routine");
    routine.value = "none";
    
}

function stroke_lookup(stroke_id){
    var STROKE_LIST = ["Rest", "Free", "Breast", "Back", "Fly", "Side"];
    if (stroke_id == -1){
        do {
            stroke = rand_choice(STROKE_LIST);
        }while (!stroke)
        return STROKE_LIST[stroke];
    }else{
        return STROKE_LIST[stroke_id];
    }
}

function rand_choice(arr){
    let choice = Math.floor(Math.random() * arr.length);
    return arr[choice];
}