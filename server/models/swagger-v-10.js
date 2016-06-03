
module.exports = function(SwaggerApi) {

/**
 * The parking spaces endpoint returns information about the latest status of a parking space.

 * @param {string} sensorId The ID of the sensor.
 * @param {string} startTime start time of the requested period.
 * @param {string} stopTime stop time of the requested period.
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {Error} result Result object
 */
SwaggerApi.getParkingspaces = function(sensorId, startTime, stopTime, callback) {
  // Replace the code below with your implementation.
  // Please make sure the callback is invoked.
  process.nextTick(function() {

    var js2xmlparser = require("js2xmlparser");
    var fs = require('fs');

    // Read settings
    var jsonResponse =
    JSON.parse(
        fs.readFileSync(
            require('path').resolve(
                __dirname,
                'settings.json'),
            'utf8'));
    console.log("jsonResponse", jsonResponse);
    // Add your data in here
    jsonResponse['m2m:output']['m2m:data']['m2m:timestamp'] = '2017-02-28T19:31:00Z';
    jsonResponse['m2m:output']['m2m:data']['m2m:sourceIdentifiers']['m2m:gatewayGroup']['m2m:urn'] = '.#CityBelgrade21.new';
    jsonResponse['m2m:output']['m2m:data']['m2m:sourceIdentifiers']['m2m:gateway']['m2m:extIds'] = '.iotaas_operator$SP_Belgrade_2.new';
    jsonResponse['m2m:output']['m2m:data']['m2m:sourceIdentifiers']['m2m:gateway']['m2m:urn'] = '.#CityBelgrade21.#ParkingSpot-Specification1.new';
    jsonResponse['m2m:output']['m2m:data']['m2m:sourceIdentifiers']['m2m:sensor']['m2m:urn'] = '.#CityBelgrade21.#ParkingSpot-Specification1.#ParkingSensor-Specification1.new';
    jsonResponse['m2m:output']['m2m:data']['m2m:sourceIdentifiers']['m2m:resource']['m2m:urn'] = '.#CityBelgrade21.#ParkingSpot-Specification1.#ParkingSensor-Specification1.#ParkingSpotStatus-Specification1.new';
    jsonResponse['m2m:output']['m2m:data']['m2m:sourceIdentifiers']['m2m:user']['m2m:urn'] = 'SP_Belgrade_User1.new';

    var xmlResponse = js2xmlparser("m2m:output", jsonResponse['m2m:output']);
    console.log(xmlResponse);
    callback(null,xmlResponse,'application/xml');
  });
}

SwaggerApi.remoteMethod('getParkingspaces',
  { isStatic: true,
  accepts:
   [ { arg: 'sensorId',
       type: 'string',
       description: 'The ID of the sensor.',
       required: false,
       http: { source: 'query' } },
     { arg: 'startTime',
       type: 'string',
       description: 'start time of the requested period.',
       required: false,
       http: { source: 'query' } },
     { arg: 'stopTime',
       type: 'string',
       description: 'stop time of the requested period.',
       required: false,
       http: { source: 'query' } } ],
  returns:
   [ { description: 'Unexpected error',
       type: 'Error',
       arg: 'data',
       root: true },
       {  description: 'Response',
          arg: 'response',
          type: 'string',
          root: true} ,
       {  description: 'Content-Type',
          arg: 'contentType',
          type: 'string',
          http: {target: 'header', header: 'Content-Type'}}
     ],
  http: { verb: 'get', path: '/parkingspaces' },
  description: 'The parking spaces endpoint returns information about the latest status of a parking space. \n' }
);

/*SwaggerApi.afterRemote('getParkingspaces', function(context, remoteMethodOutput, next) {
  context.res.setHeader('Content-Type', 'application/xml');
  context.res.end(context.result);
});*/

}
