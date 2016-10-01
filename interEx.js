var _ = require('lodash');
var http = require('http');
var syncRequest = require('sync-request');

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
 	var output = requestToApi({
        'apiCall':'market_data',
        'symbol': '0001',
        'exchange': 'exchange1'/*,
        'orderTicket': {"side": "buy",
                        "qty":1,
                        "order_type":"market"}*/
    });

    console.log(output);
});


callback = function(response){
    // Continuously update stream with data
    console.log("Test", response);
}

const TEAM_UID="PkkYempGWJeQr3AFYzcOWA";

function requestToApi(apiFunctions){
    if (apiFunctions.apiCall === 'orders'){

    	apiFunctions.orderTicket.team_uid = TEAM_UID;
        apiFunctions.orderTicket.symbol = apiFunctions.symbol;

        var request = syncRequest(
        	'POST',
        	'http://cis2016-'+apiFunctions.exchange+'.herokuapp.com/api/'+apiFunctions.apiCall,
        	{
        		'headers': {
        			'Content-Type': 'application/json'
        		},
        		'json': apiFunctions.orderTicket
        	}
        );

    	return JSON.parse(request.getBody());

    } else {
        if (apiFunctions.symbol) {
            apiFunctions.apiCall = apiFunctions.apiCall+'/'+apiFunctions.symbol;
        }

        var request = syncRequest(
        	'GET',
        	'http://cis2016-'+apiFunctions.exchange+'.herokuapp.com/api/'+apiFunctions.apiCall
        );

        return JSON.parse(request.getBody());

    }
}

while(true){
var stockJSONex1 = requestToApi({
	'apiCall':'market_data',
	'symbol': '0386',
	'exchange': 'exchange1'
});

var stockJSONex2 = requestToApi({
	'apiCall':'market_data',
	'symbol': '0386',
	'exchange': 'exchange2'
});

var stockJSONex3 = requestToApi({
	'apiCall':'market_data',
	'symbol': '0386',
	'exchange': 'exchange3'
});


var stockData = [stockJSONex1, stockJSONex2, stockJSONex3];

//console.log("Session: %j", _.toPairs(stockJSONex1.buy));
//console.log(stockData);

var minPrice = 10000000;
var exchangeOfMin = 4;

var i = 1;
_.forEach(stockData, function(value) {
	//console.log("Sell: %j\n", value.sell);
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
	//console.log("Buy: %j\n", value.buy);
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

console.log("Buy "+quantity+ " from exchange "+ exchangeOfMin +" and sell to " + exchangeOfMax);
console.log("Buy "+minPrice+ " from exchange "+ exchangeOfMin +" and sell at " + maxPrice);

// var output = requestToApi({
//         'apiCall':'orders',
//         'symbol': '0005',
//         'exchange': 'exchange'+exchangeOfMin,
//         'orderTicket': {"side": "buy",
//                         "qty":quantity,
//                         "order_type":"market"}
//     });

//     console.log(output);
	
// 	var output2 = requestToApi({
//         'apiCall':'orders',
//         'symbol': '0005',
//         'exchange': 'exchange'+exchangeOfMax,
//         'orderTicket': {"side": "sell",
//                         "qty":quantity,
//                         "order_type":"market"}
//     });

    // console.log(output2);
}

