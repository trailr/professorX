var roster = {};
var mutantIDs = {};
mutantIDs["mutant1"] = "GAMBIT";
mutantIDs["GAMBIT"] = "1";
mutantIDs["mutant2"] = "BANSHEE";
mutantIDs["BANSHEE"] = "2";
mutantIDs["mutant3"] = "CYCLOPS";
mutantIDs["CYCLOPS"] = "3";
var buttonMap = [	"gLEDg","gLEDr","bLEDg","bLEDr","cLEDg","cLEDr",
					"allBlue","allBlue","allBlue","allBlue","allBlue","allBlue"
				];
var colWidth = 6;
var focusedIndex = 0;

function syncFocus() {
	$("*").removeClass("focused");
	$("#"+buttonMap[focusedIndex]).addClass("focused");
}

syncFocus();

var socket = io.connect("http://professor-x.frogdesign.com");

$(document).keydown(function(event) {
	event.preventDefault();
	switch (event.which) {
		case 13 :
			//SELECT
			$("#"+buttonMap[focusedIndex]).click();
			break;
		case 38 :
			//UP
			focusedIndex = focusedIndex - colWidth;
			break;
		case 40 :
			//DOWN
			focusedIndex = focusedIndex + colWidth;
			break;
		case 37 :
			//LEFT
			focusedIndex--;
			break;
		case 39 :
			//RIGHT
			focusedIndex++;
			break;
		case 27 :
			//MENU
			break;
		default :
			break;
	}
	if (focusedIndex < 0) {
		focusedIndex = 11;
	} else {
		if (focusedIndex > 11) focusedIndex = 0;
	}

	syncFocus();
	console.log(event.which);
});

socket.on('mutant_report', function (data) {
	if (data.mutantID != undefined) {
		renderData(data.mutantID,data.report);
		renderStatus(data.mutantID);
	}
});

function lightLED(mutantID,LED) {
	console.log(mutantID,LED);
	socket.send("cmd:"+mutantID+"|LED"+LED);
	switch (LED) {
		case "R" : 
			$("#"+mutantIDs["mutant"+mutantID].toLowerCase()+" .greenLED").attr("src","images/LEDGreenOFF.png");
			$("#"+mutantIDs["mutant"+mutantID].toLowerCase()+" .redLED").attr("src","images/LEDRedON.png");
			break;
		case "G" : 
			$("#"+mutantIDs["mutant"+mutantID].toLowerCase()+" .greenLED").attr("src","images/LEDGreenON.png");
			$("#"+mutantIDs["mutant"+mutantID].toLowerCase()+" .redLED").attr("src","images/LEDRedOFF.png");
			break;
		case "B" :
			$("#"+mutantIDs["mutant"+mutantID].toLowerCase()+" .greenLED").attr("src","images/LEDGreenOFF.png");
			$("#"+mutantIDs["mutant"+mutantID].toLowerCase()+" .redLED").attr("src","images/LEDRedOFF.png");
			break;
	}
}

function renderData(mutantID, report) {
	console.log("renderData:",mutantID,report);
	var search = "" + "mutant" + mutantID;
	mutantCallsign = mutantIDs[search];
	//report = report.substring(1);
	if (mutantCallsign) {
		output = "";
		for (var i = 2;i < report.length; i++) {
			r = report[i];
			type = r.substring(0,1);
			value = r.substring(1);
			if (type == "P" && parseInt(value) > 300) {
				output = output + "P: out of range ";
			} else {
				output = output + type + ": " + value + " ";
			}
		}
		$('#'+mutantCallsign.toLowerCase()+' .proximity').html(output);
	}
}

function renderStatus(mutantID) {
	console.log("renderStatus:",mutantID);
	mutantCallsign = mutantIDs["mutant" + mutantID];
	if (mutantCallsign) {
		roster[mutantCallsign] = new Date().getTime();
	}
	for (var mutant in roster) {
		var lastSeen = roster[mutant];
		var now = new Date().getTime();
		//console.log("Elapsed time since last report:",now - lastSeen,lastSeen,mutant);
		if (now - lastSeen > 10000) {
			$('#'+mutant.toLowerCase()).removeClass("present").addClass("awol");
			$('#'+mutant.toLowerCase()+' .proximity').html('---');
		} else {
			$("#" + mutant.toLowerCase()).addClass("present").removeClass("awol");
		}
	}
}

function ledBlue(mutant) {
	// lightLED(mutantIDs[mutant],"B");
	LED = "B";
	lightLED(mutantIDs[mutant],LED);
}

$('.LEDButtons img').click(function(){
	var mutantName = $(this).parent().parent().attr("id");
	var LED = ($(this).hasClass("greenLED")) ? "G" : "R";
	lightLED(mutantIDs[mutantName.toUpperCase()],LED);
});
$('#allBlue').click(function(){
	// lightLED("*","B");
	for (var mutant in roster) {
		(function (mutant) {
			setTimeout(function(){ledBlue(mutant)}, mutantIDs[mutant]*200);
		})(mutant);
	}
});

// setInterval(function(){
// 	renderStatus();
// },250);