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
    console.log("Server listening on: http://localhost:%s", PORT);
    // requestToTeam();
    requestToApi({
        'apiCall':'orders',
        'symbol': '0001',
        'exchange': 'exchange2',
        'orderTicket': {"side": "buy",
                        "qty":1,
                        "order_type":"market"}
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
        console.log(apiFunctions );
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
        console.log(apiFunctions);
        return http.get({
            host: 'cis2016-'+apiFunctions.exchange+'.herokuapp.com',
            path: '/api/'+apiFunctions.apiCall
        }, callback)
    }
}