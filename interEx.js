var _ = require('lodash');
var http = require('http');
var syncRequest = require('sync-request');

callback = function(response){
    // Continuously update stream with data
    console.log("Test", response);
}
const PORT = process.env.PORT; 
const TEAM_UID="TtH8CwcTEcwcpP7BOoZBzg";

function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
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
	var symbol = "0386";
	
	while(true){
		var minPrice = 10000000;
		var exchangeOfMin = 4;

		var i = 1;
		var maxPrice = -10;
		var exchangeOfMax = 4;
		var max;
		var quantity;
		var output;
		var output2;
		var stockJSONex1 = requestToApi({
		'apiCall':'market_data',
		'symbol': symbol,
		'exchange': 'exchange1'
		});

		var stockJSONex2 = requestToApi({
		'apiCall':'market_data',
		'symbol': symbol,
		'exchange': 'exchange2'
		});

		var stockJSONex3 = requestToApi({
		'apiCall':'market_data',
		'symbol': symbol,
		'exchange': 'exchange3'
		});


		var stockData = [stockJSONex1, stockJSONex2, stockJSONex3];
		
		_.forEach(stockData, function(value) {
			//console.log("Sell: %j\n", value.sell);
			var min = 10000000;
			_.forEach(value.sell, function(key, val){
				if(parseFloat(val) < min){
					min = parseFloat(val);
				}
			});
			if(min < parseFloat(minPrice)){
				minPrice = min;
				exchangeOfMin = i;
			}
			i++;
		});
		
		i=1;
		
		_.forEach(stockData, function(value) {
			//console.log("Buy: %j\n", value.buy);
			max = -10;
			_.forEach(value.buy, function(key, val){
				if(parseFloat(val) > max){
					max = parseFloat(val);
				}
			});

			if(max > parseFloat(maxPrice)){
				maxPrice = max;
				exchangeOfMax = i;
			}
			i++;
		});
		if( stockData[exchangeOfMax-1].buy[maxPrice] > stockData[exchangeOfMin-1].sell[minPrice]){
			quantity = stockData[exchangeOfMin-1].sell[minPrice];
		}else{
			quantity = stockData[exchangeOfMax-1].buy[maxPrice];
		}

		if(parseFloat(maxPrice) > parseFloat(minPrice) && quantity != null && quantity>0) {
			console.log("Buy "+quantity+ " at $"+minPrice+" from exchange "+ exchangeOfMin +" and sell to " + exchangeOfMax+" sell at $" + maxPrice );
				
			 output = requestToApi({
				'apiCall':'orders',
				'symbol': symbol,
				'exchange': 'exchange'+exchangeOfMin,
				'orderTicket': {"side": "buy",
								"qty":1,
								"order_type":"market"}
				});
			console.log(output.fills);
			if(output.fills[0].price < maxPrice){
				out = requestToApi({
					'apiCall':'orders',
					'symbol': symbol,
					'exchange': 'exchange'+exchangeOfMin,
					'orderTicket': {"side": "buy",
									"qty":quantity-1,
									"order_type":"market"}
					
					});
				
				console.log("Bought at " + out.fills);

				if(output.filled_qty > 0){
					 output2 = requestToApi({
						'apiCall':'orders',
						'symbol': symbol,
						'exchange': 'exchange'+exchangeOfMax,
						'orderTicket': {"side": "sell",
										"qty":output.filled_qty,
										"order_type":"market"}
					});
					console.log("sold at " + output2.price);
				}
			
			}
		}
	}
});

