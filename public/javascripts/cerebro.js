var roster = {};
var mutantIDs = {};
mutantIDs["mutant1"] = "GAMBIT";
mutantIDs["GAMBIT"] = "1";
mutantIDs["mutant2"] = "BANSHEE";
mutantIDs["BANSHEE"] = "2";
// mutantIDs["mutant4"] = "CYCLOPS";
// mutantIDs["CYCLOPS"] = 4;

var socket = io.connect("http://professor-x.frogdesign.com");

socket.on('mutant_report', function (data) {
	if (data.mutantID != undefined) {
		renderData(data.mutantID,data.distance);
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
	report = report.substring(1);
	if (mutantCallsign) {
		if (parseInt(report) > 300) {
			report = "out of range";
		}
		$('#'+mutantCallsign.toLowerCase()+' .proximity').html(report);
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