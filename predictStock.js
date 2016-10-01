//Lets require/import the HTTP module
var http = require('http');
var unirest =require('unirest')

// var MongoClient = require('mongodb').MongoClient;

//Lets define a port we want to listen to
const PORT=8080; 
const TEAM_UID="PkkYempGWJeQr3AFYzcOWA";

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);
}

//Create a server
var server = http.createServer(handleRequest);

// Connect to the db
// MongoClient.connect("mongodb://localhost:27017/stockPredict", function(err, db) {
// if(!err) {
//     console.log("We are connected");
// }
// });

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
    // requestToTeam();
 	requestToApi({
        'apiCall':'market_data',
        'symbol': '0001',
        'exchange': 'exchange1',
        'orderTicket': {"side": "buy",
                        "qty":1,
                        "order_type":"market"}
    });
});

callback = function(response){
    // Continuously update stream with data
    console.log("Test", response);
}

function requestToTeam() {
    var request = unirest.get('http://cis2016-teamtracker.herokuapp.com/api/teams/'+TEAM_UID);
    request.headers({'Content-Type': 'application/json'});
	request.end(function (response) {
		// return response;
	  callback(response.body);
	  // return response;
	});
}


/**
 * apiFunctions:
 * exchange: Exchange 1/2/3
 * apiCall: market_data,market_data/$symbol, orders
 * symbol
 * orderTicket: {"side": "buy",
                "qty":1,
                "order_type":"market"}
 * 
 */


function requestToApi(apiFunctions){
    if (apiFunctions.apiCall === 'orders'){
    	apiFunctions.orderTicket.team_uid = TEAM_UID;
        apiFunctions.orderTicket.symbol = apiFunctions.symbol;
    	var request = unirest.post('http://cis2016-'+apiFunctions.exchange+'.herokuapp.com/api/'+apiFunctions.apiCall);
    	request.headers({'Content-Type': 'application/json'});
    	request.send(apiFunctions.orderTicket);
    	request.end(function (response) {
    		callback(response.body);
		  // console.log(response.body);
		  // console.log(request);
		});

    }
    else{
        if (apiFunctions.symbol)
            apiFunctions.apiCall = apiFunctions.apiCall+'/'+apiFunctions.symbol;
        var request = unirest.get('http://cis2016-'+apiFunctions.exchange+'.herokuapp.com/api/'+apiFunctions.apiCall);
	    request.headers({'Content-Type': 'application/json'});
    	request.end(function (response) {
    		// return response;
		  callback(response.body);
		  // return response;
		});
    }
}
