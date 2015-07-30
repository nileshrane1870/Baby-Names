//Xiangyi Zheng, CSE 154 AH, 2014 AUTUMN, ,
//this file feches data of text, html xml, and json from server 
//process all these different kinds of data and display them on the web
(function() {

	"use strict";

	// sets up the event handlers on the page
	window.onload = function() {
		requestAjax("type=list", processList);
		document.getElementById("search").onclick = search;
	};

	//function take a string and a handler function as parameter
	//send ajax request accoding to the parameters
	function requestAjax(param, handler) {
		var request = new XMLHttpRequest();
		request.onload = handler;
		request.open("GET", "https://webster.cs.washington.edu/cse154/babynames.php?" + param, true);
		request.send();
	}

	//error handler, take the ajax object and the stage string as parameter
	//display error message accordingly
	function errorHandler(ajax, stage) {
		var error = document.createElement("p");
		error.innerHTML = "Error " + ajax.status + " " + ajax.statusText + " in " + stage;
		document.getElementById("errors").appendChild(error);
	}

	//process texts feched from the server, and display them as a option list
	function processList() {
		if (this.status != 200) {
			errorHandler(this, "fetching names");
		} else {
			var names = this.responseText;
			var nameList = names.split("\n");
			var allnames = document.getElementById("allnames");
			for (var i = 0; i < nameList.length; i++) {
				var option = document.createElement("option");
				option.innerHTML = nameList[i];
				option.value = nameList[i].toLowerCase();
				allnames.appendChild(option);
			}
			allnames.disabled = false;
		}
		document.getElementById("loadingnames").style.display = "none";
	}

	//call ajaxrequest method and all the process methods once the users
	//click on the search bottom
	function search() {
		var cleanList = ["meaning", "graph", "celebs", "errors"];
		for (var i = 0; i < cleanList.length; i++) {
			document.getElementById(cleanList[i]).innerHTML = "";
		}
		document.getElementById("norankdata").style.display = "none";
		var showList = ["loadingcelebs", "loadingmeaning", "loadinggraph"];
		for (var i = 0; i < showList.length; i++) {
			document.getElementById(showList[i]).style.display = "block";
		}

		var allnames = document.getElementById("allnames");
		var name = allnames.options[allnames.selectedIndex].value;
		if (name) {
			var paramMeaning = "type=meaning&name=" + name;
			document.getElementById("resultsarea").style.display = "block";
			requestAjax(paramMeaning, processMeaning);
			var gender = "";
			if (document.getElementById('genderm').checked) {
				gender = "m";
			} else {
				gender = "f";
			}
			var combination = "&name=" + name + "&gender=" + gender;
			var paramRanking = "type=rank" + combination;
			requestAjax(paramRanking, processRank);
			var paramCelebs = "type=celebs" + combination;
			requestAjax(paramCelebs,processCelebs);
		}
	}

	//process the json files fetched from the server
	//display them as a list on the web
	function processCelebs() {
		if (this.status != 200) {
			errorHandler(this, "fetching celebrities");
		} else {
			var data = JSON.parse(this.responseText);
			for (var i = 0; i < data.actors.length; i++) {
				var li = document.createElement("li");
				li.innerHTML = data.actors[i].firstName + " " +
				 data.actors[i].lastName + " (" + data.actors[i].filmCount + " films)";
				document.getElementById("celebs").appendChild(li);
			}
		}
		document.getElementById("loadingcelebs").style.display = "none";
	}

	//process the html fetched from the server
	//insert it to the page
	function processMeaning() {
		if (this.status != 200) {
			errorHandler(this, "fetching meaning");
		} else {
			document.getElementById("meaning").innerHTML = this.responseText;
		}
		document.getElementById("loadingmeaning").style.display = "none";
	}

	//process the xml file fetched from the server
	//display using graph
	//if no data feched, give a message
	function processRank() {
		if (this.status == 410) {
			document.getElementById("norankdata").style.display = "block";
		} else if (this.status != 200) {
			errorHandler(this, "fetching popularity");
		} else {
		 
			var ranks = this.responseXML.getElementsByTagName("rank");	
			var headerRow = document.createElement("tr");
			var standardRow = document.createElement("tr");
			for (var i = 0; i < ranks.length; i++) {
				var headerCell = document.createElement("th");
				headerCell.innerHTML = ranks[i].getAttribute("year");
				headerRow.appendChild(headerCell);
				var standardCell = document.createElement("td");
				var rankDiv = document.createElement("div");
				var rank = parseInt(ranks[i].textContent);
				rankDiv.innerHTML = rank;
				if (rank) {
					if (rank <= 10) {
						rankDiv.className = "popular";
					}
					rankDiv.style.height = parseInt((1000 - rank) / 4) + "px";
				} else {
					rankDiv.style.height = "0px";
				}
				
				standardCell.appendChild(rankDiv);
				standardRow.appendChild(standardCell);
			}
			var table = document.getElementById("graph");
			table.appendChild(headerRow);
			table.appendChild(standardRow);
		}
		document.getElementById("loadinggraph").style.display = "none";
	}

})();







