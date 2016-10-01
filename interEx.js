var _ = require('lodash');
//Lets require/import the HTTP module
var http = require('http');

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
    //console.log("Server listening on: http://localhost:%s", PORT);
    // requestToTeam();
    requestToApi({
        'apiCall':'market_data',
        'symbol': '0001',
        'exchange': 'exchange2',
        //'orderTicket': {"side": "buy",
                        //"qty":1,
                        //"order_type":"market"}
    }
        );
});

callback = function(response){
    // Continuously update stream with data
    var body = '';
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
        // console.log(body);
        var parsed = JSON.parse(body);
        console.log(parsed);
    });
}

function requestToTeam() {
    return http.get({
        host: 'cis2016-teamtracker.herokuapp.com',
        path: '/api/teams/'+TEAM_UID
    }, callback);
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
       // console.log(apiFunctions );
        return http.request({
            host: 'cis2016-'+apiFunctions.exchange+'.herokuapp.com',
            path: '/api/'+apiFunctions.apiCall,
            body: apiFunctions.orderTicket,
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }, callback)
    }
    else{
        if (apiFunctions.symbol)
            apiFunctions.apiCall = apiFunctions.apiCall+'/'+apiFunctions.symbol;
       // console.log(apiFunctions);
        return http.get({
            host: 'cis2016-'+apiFunctions.exchange+'.herokuapp.com',
            path: '/api/'+apiFunctions.apiCall
        }, callback)
    }
}
//var stockJSONex1 = requestToAPI(1);
//var stockJSONex2 = requestToAPI(2);
//var stockJSONex3 = requestToAPI(3);

var stockJSONex1 = {"symbol": "0001",
  "buy": {
    "101.2": 210,
    "101.15": 140,
    "101.1": 93,
    "101.05": 47,
    "101.0": 23
  },
  "sell": {
    "101.25": 315,
    "101.3": 210,
    "101.35": 140,
    "101.4": 70,
    "101.45": 35
  }
};

var stockJSONex2 = {"symbol": "0001",
  "buy": {
    "101.1": 210,
    "101.05": 140,
    "101.0": 93,
    "100.95": 47,
    "100.9": 23
  },
  "sell": {
    "101.15": 315,
    "101.2": 210,
    "101.25": 140,
    "101.3": 70,
    "101.35": 35
  }
};

var stockJSONex3 =  {"symbol": "0001",
  "buy": {
    "100.1": 210,
    "100.05": 140,
    "100.25": 210,
    "100.2": 140,
    "100.15": 93
  },
  "sell": {
    "100.3": 70,
    "100.35": 35,
    "100.4": 140,
    "100.45": 70,
    "100.5": 35
  }
};

var stockData = [stockJSONex1, stockJSONex2, stockJSONex3];

//console.log("Session: %j", _.toPairs(stockJSONex1.buy));
//console.log(stockData);

var minPrice = 10000000;
var exchangeOfMin = 4;

var i = 1;
_.forEach(stockData, function(value) {
	//console.log("%j\n", value.sell);
	var min = 10000000;
	_.forEach(value.sell, function(key, val){
		if(val < min){
			min = val;
		}
	});
	
	if(min < minPrice){
		minPrice = min;
		exchangeOfMin = i;
	}
	i++;
});

// console.log(minPrice);
// console.log(stockData[exchangeOfMin-1].sell[minPrice]);
// console.log(exchangeOfMin);

var maxPrice = -10;
var exchangeOfMax = 4;
var i = 1;

_.forEach(stockData, function(value) {
	//console.log("%j\n", value.buy);
	var max = -10;
	_.forEach(value.buy, function(key, val){
		if(val > max){
			max = val;
		}
	});
	
	if(max > maxPrice){
		maxPrice = max;
		exchangeOfMax = i;
	}
	i++;
});

// console.log(maxPrice);
// console.log(stockData[exchangeOfMax-1].buy[maxPrice]);
// console.log(exchangeOfMax);

if( stockData[exchangeOfMax-1].buy[maxPrice] > stockData[exchangeOfMin-1].sell[minPrice]){
	var quantity = stockData[exchangeOfMin-1].sell[minPrice];
}else{
	var quantity = stockData[exchangeOfMax-1].buy[maxPrice];
}

// console.log("Buy "+quantity+ " from exchange "+ exchangeOfMin +" and sell to " + exchangeOfMax);

