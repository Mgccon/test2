
module.exports = function(SmartMeteringApi) {

var gatewayGroup = 'SmartParking';
var user = 'SmartParking_User1';
var gatewayGroupSpec = 'City-Specification'
var gatewaySpec = 'ParkingSpot-Specification';
var sensorSpec = 'ParkingSensor-Specification'
var mess = '';
var jsonDataArray = '';
var jsonDataTemplate = '';

// Default error response (Internal Server Error)
var errorResponseTemplate = {};
var error = {};
error.code = 500;
error.message = "Internal Server Error";
errorResponseTemplate.error = error;

// Logger
var logger= require('../log.js');
var log = logger.getLogger();

var xml2js = require('xml2js'); // XML2JS Module

/**
 * The parking spaces endpoint returns information about the latest status of a parking space.

 * @param {string} sensorId The ID of the sensor.
 * @param {string} startTime start time of the requested period.
 * @param {string} stopTime stop time of the requested period.
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {Error} result Result object
 */
SmartMeteringApi.getParkingspaces = function(sensorId, from, to, EricssonSSO, topic, callback) {
  // Replace the code below with your implementation.
  // Please make sure the callback is invoked.
  process.nextTick(function() {

    var fs = require('fs');
    var builder = new xml2js.Builder();

    var collectionId = encodeURIComponent(topic);

    // Read settings
    var jsonResponse =
    JSON.parse(
        fs.readFileSync(
            require('path').resolve(
                __dirname,
                'output-settings.json'),
            'utf8'));
    var datahub = SmartMeteringApi.app.dataSources.datahubapp;
        datahub.getMessagesViaToken(collectionId, EricssonSSO, null, from, to, null, function(err, response, context) {
        if (response.error) {
            log.info('Datahub response.error '+response.error);
            if (response.error.statusCode == 401)
            {
                errorResponseTemplate["error"]["code"] = response.error.statusCode;
                errorResponseTemplate["error"]["message"] = "Authentication not successful";
            } else if (response.error.statusCode == 403) {
                errorResponseTemplate["error"]["code"] = response.error.statusCode;
                errorResponseTemplate["error"]["message"] = "Authorization not successful";
            } else {
              errorResponseTemplate["error"]["code"] = 500;
              errorResponseTemplate["error"]["message"] = "Internal Server Error";
            }
            // convert the JSON error response to XML format
            var xmlResponse = builder.buildObject(errorResponseTemplate);
            callback(null,{
                toXML: function() {
                  return xmlResponse;
                }
            },errorResponseTemplate["error"]["code"]);
            return;
        }
        if (err) {
            log.info('Error towards datahub '+err);
            if (err.statusCode == 401)
            {
                errorResponseTemplate["error"]["code"] = err.statusCode;
                errorResponseTemplate["error"]["message"] = "Authentication not successful";
            } else if (err.statusCode == 403) {
                errorResponseTemplate["error"]["code"] = err.statusCode;
                errorResponseTemplate["error"]["message"] = "Authorization not successful";
            } else {
              errorResponseTemplate["error"]["code"] = 500;
              errorResponseTemplate["error"]["message"] = "Internal Server Error";
            }
            // convert the JSON error response to XML format
            var xmlResponse = builder.buildObject(errorResponseTemplate);
            callback(null,{
                toXML: function() {
                  return xmlResponse;
                }
            },errorResponseTemplate["error"]["code"]);
            return;
        }
            log.info('Succesful call towards datahub');
            // Nr of sensor data values returned
            messLength = (JSON.parse(response).messages).length;
            messageResponse=JSON.parse(response).messages;
            log.info('messageResponse: '+JSON.stringify(messageResponse));

            jsonDataArray = JSON.parse('[]');

            for(var i = 0; i < messLength; i++) {
              // Retrieve data from Datahub response
              mess = messageResponse[i]['m2m:input']['m2m:data'][0];
              // Verify if correct data is stored in Datahub
              if (mess['m2m:value'][0]['_'] !== undefined)
              {
                log.info('Correct value: '+i);
                var operator = mess['m2m:sourceIdentifiers'][0]['m2m:operator'][0];
            		var domainApplication = mess['m2m:sourceIdentifiers'][0]['m2m:domainApplication'];
            		var enterpriseCustomer = mess['m2m:sourceIdentifiers'][0]['m2m:enterpriseCustomer'][0];
            		var gateway = mess['m2m:sourceIdentifiers'][0]['m2m:gateway'][0];
            		var resourceSpec = mess['m2m:sourceIdentifiers'][0]['m2m:resourceSpec'][0];
                //var valueType = mess['m2m:value'][0]['type'][0];
                //var value = mess['m2m:value'][0]['text'];
                var valueType = mess['m2m:value'][0]['$']['type'];
                var value = mess['m2m:value'][0]['_'];
                var metaData = mess['m2m:metadata'][0]['m2m:messageId'][0];

                // Create template for m2m:data tag
                jsonDataTemplate = jsonResponse['m2m:output']['m2m:data'][0];

                // fill template with the correct values form datahub
                // operator
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:operator']['m2m:urn'] = operator;

                // domainApplication
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:domainApplication']['m2m:urn']
                  = domainApplication;
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:domainApplication']['m2m:extIds']['m2m:id']
                  = operator + '$' + domainApplication;

                // gatewayGroup
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:gatewayGroup']['m2m:urn'] = gatewayGroup;

                // gateway
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:gateway']['m2m:urn'] = gatewayGroup
                  + '.#' + gatewaySpec + '1';
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:gateway']['m2m:extIds']['m2m:id'] = gateway;

                // sensor
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:sensor']['m2m:urn']
                  = gatewayGroup + '.#' + gatewaySpec + '1.#' + sensorSpec + '1';

                // resource
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:resource']['m2m:urn']
                  = gatewayGroup + '.#' + gatewaySpec + '1.#' + sensorSpec + '1.#' + resourceSpec;

                // enterpriseCustomer
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:enterpriseCustomer']['m2m:urn']
                  = enterpriseCustomer;
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:enterpriseCustomer']['m2m:extIds']['m2m:id']
                  = operator + '$' + enterpriseCustomer;

                // user
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:user']['m2m:urn'] = user;

                // gatewayGroupSpec, gatewaySpec & sensorSpec
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:gatewayGroupSpec']['m2m:urn'] = gatewayGroupSpec;
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:gatewaySpec']['m2m:urn'] = gatewaySpec;
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:sensorSpec']['m2m:urn'] = sensorSpec;

                // resourceSpec
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:resourceSpec']['m2m:extIds']['m2m:id']
                  = operator + '$' + resourceSpec;
                jsonDataTemplate['m2m:sourceIdentifiers']['m2m:resourceSpec']['m2m:urn'] = resourceSpec;

                // value
                jsonDataTemplate['m2m:value']['$']['type'] = valueType;
                jsonDataTemplate['m2m:value']['_'] = value;

                // timestamp
                jsonDataTemplate['m2m:timestamp'] = mess['m2m:timestamp'];

                // metadata
                jsonDataTemplate['m2m:metadata']['m2m:messageId'] = metaData;
                log.debug('jsonDataTemplate: ' +JSON.stringify(jsonDataTemplate));

                jsonDataArray.push(jsonDataTemplate);

              }
            }

            jsonResponse['m2m:output']['m2m:data'] = jsonDataArray;
            log.debug('jsonResponse: ' +JSON.stringify(jsonResponse['m2m:output']['m2m:data']));

            // convert the JSON response to XML format
            var xmlResponse = builder.buildObject(jsonResponse);
            log.debug("xmlResponse: "+xmlResponse);

            // return as xml
            callback(null, {
                toXML: function() {
                  return xmlResponse;
                }
              });
        });

  });
}

/**
 * The devicedata endpoint sends the latest reading to Iotaas and returns confirmation.

 * @param {object} input body.
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {Error} result Result object
 */
SmartMeteringApi.devicedata = function(topic, user, password, data, callback) {

  // Creating XML builder object
  var builder = new xml2js.Builder();
  // Creating XML to JSON parser object
  var parser = new xml2js.Parser();

  process.nextTick(function() {
    // Receive XML input from JSON String
    if (data['text']== undefined) {
      // If input message has wrong format, throw error
      log.debug('Error parsing message input'+data['text']);
      var xmlResponse = builder.buildObject(errorResponseTemplate);
      // Set error to Bad Request
      errorResponseTemplate["error"]["code"] = 400;
      errorResponseTemplate["error"]["message"] = "Bad Request";
      // Return error
      callback(null,{
          toXML: function() {
            return xmlResponse;
          }
      },errorResponseTemplate["error"]["code"]);
      return;
    } else {
      var inputData = data['text'];
    }

    var inputData = data['text'];
    var message = '';
    var dateInMs;
    var collectionId = encodeURIComponent(topic);

    // Reading and Parsing the file
    parser.parseString(inputData, function (err, result) {
        appmessage = JSON.stringify(result);
        appmessageJSON = JSON.parse(appmessage);
        // Verify if request is correct
        if (appmessageJSON['m2m:input'] == undefined || appmessageJSON['m2m:input']['m2m:data'] == undefined
          || appmessageJSON['m2m:input']['m2m:data'][0]['m2m:sourceIdentifiers'] == undefined
            || appmessageJSON['m2m:input']['m2m:data'][0]['m2m:value']['0']['_'] == undefined
              || appmessageJSON['m2m:input']['m2m:data'][0]['m2m:timestamp'] == undefined
                || appmessageJSON['m2m:input']['m2m:data'][0]['m2m:sourceIdentifiers'][0]['m2m:operator'][0] == undefined
                  || appmessageJSON['m2m:input']['m2m:data'][0]['m2m:sourceIdentifiers'][0]['m2m:domainApplication'] == undefined
                    || appmessageJSON['m2m:input']['m2m:data'][0]['m2m:sourceIdentifiers'][0]['m2m:enterpriseCustomer'] == undefined
                      || appmessageJSON['m2m:input']['m2m:data'][0]['m2m:sourceIdentifiers'][0]['m2m:gateway'] == undefined
                        || appmessageJSON['m2m:input']['m2m:data'][0]['m2m:sourceIdentifiers'][0]['m2m:resourceSpec'] == undefined)
                          {
                            // Set error to Bad Request
                            errorResponseTemplate["error"]["code"] = 400;
                            errorResponseTemplate["error"]["message"] = "Bad Request";
                            err = true;
                          }
        if (err) {
                log.debug('Error parsing message '+JSON.stringify(err));
                var xmlResponse = builder.buildObject(errorResponseTemplate);
                // Return error
                callback(null,{
                    toXML: function() {
                      return xmlResponse;
                    }
                },errorResponseTemplate["error"]["code"]);
                return;
        } else {
          // use date received in the request as date to Datahub
          dateInMs = (new Date(appmessageJSON['m2m:input']['m2m:data'][0]['m2m:timestamp'][0])).getTime();
          // Store JSON data in Datahub
          var datahub = SmartMeteringApi.app.dataSources.datahubapp;
              datahub.createMessage(appmessage,collectionId,user,password,null,dateInMs, null, null, function(err, response, context) {
                if (err) {
                    log.info('Error towards datahub '+JSON.stringify(err));
                    if (err.statusCode == 401)
                    {
                        errorResponseTemplate["error"]["code"] = err.statusCode;
                        errorResponseTemplate["error"]["message"] = "Authentication not successful";
                    } else if (err.statusCode == 403) {
                        errorResponseTemplate["error"]["code"] = err.statusCode;
                        errorResponseTemplate["error"]["message"] = "Authorization not successful";
                    } else {
                      errorResponseTemplate["error"]["code"] = 500;
                      errorResponseTemplate["error"]["message"] = "Internal Server Error";
                    }
                    // convert the JSON error response to XML format
                    var xmlResponse = builder.buildObject(errorResponseTemplate);
                    callback(null,{
                        toXML: function() {
                          return xmlResponse;
                        }
                    },errorResponseTemplate["error"]["code"]);
                    return;
                }
                if (response.error) {
                    log.info('Datahub response.error '+response.error);
                    if (response.error.statusCode == 401)
                    {
                        errorResponseTemplate["error"]["code"] = response.error.statusCode;
                        errorResponseTemplate["error"]["message"] = "Authentication not successful";
                    } else if (response.error.statusCode == 403) {
                        errorResponseTemplate["error"]["code"] = response.error.statusCode;
                        errorResponseTemplate["error"]["message"] = "Authorization not successful";
                    } else {
                      errorResponseTemplate["error"]["code"] = 500;
                      errorResponseTemplate["error"]["message"] = "Internal Server Error";
                    }
                    // convert the JSON error response to XML format
                    var xmlResponse = builder.buildObject(errorResponseTemplate);
                    callback(null,{
                        toXML: function() {
                          return xmlResponse;
                        }
                    },errorResponseTemplate["error"]["code"]);
                    return;
                }
                // convert the JSON response to XML format
                var xmlResponse = builder.buildObject(response);
                log.info("xmlResponse: "+xmlResponse);

                // return as xml
                callback(null, {
                    toXML: function() {
                      return xmlResponse;
                    }
                  });
              });

        }
        log.debug("appmessage: "+appmessage);
    });
  });
}


SmartMeteringApi.remoteMethod('getParkingspaces',
  { isStatic: true,
  accepts:
   [ { arg: 'sensorId',
       type: 'string',
       description: 'The ID of the sensor.',
       required: true,
       http: { source: 'query' } },
     { arg: 'from',
       type: 'string',
       description: 'start time of the requested period.',
       required: false,
       http: { source: 'query' } },
     { arg: 'to',
       type: 'string',
       description: 'stop time of the requested period.',
       required: false,
       http: { source: 'query' } },
      { arg: 'EricssonSSO',
         type: 'string',
         description: 'SSO token.',
         required: true,
         http: { source: 'header' } },
      { arg: 'topic',
           type: 'string',
           description: 'Topic.',
           required: true,
           http: { source: 'query' } }
    ],
  returns:
  [
      { description: 'Response',
          type: 'object',
          arg: 'data',
          root: true
        },
     {
       arg: 'statuscode',
       type: 'int',
       http: {
         target: 'status'
       }
     }
    ],
  http: { verb: 'get', path: '/parkingspaces'},
  description: 'The parking spaces endpoint returns information about the latest status of a parking space. \n' }
);

SmartMeteringApi.remoteMethod('devicedata',
  { isStatic: true,
  accepts:
   [ { arg: 'topic',
      type: 'string',
      description: 'Topic.',
      required: true,
      http: { source: 'query' } },
     { arg: 'user',
        type: 'string',
        description: 'User.',
        required: true,
        http: { source: 'query' } },
     { arg: 'password',
        type: 'string',
        description: 'Password.',
        required: true,
        http: { source: 'query' } },
     { arg: 'data',
       type: 'object',
       description: 'The latest data of the sensor.',
       root: true,
       required: true,
       http: { source: 'body' } }
     ],
  returns:
   [
       { description: 'Response',
           type: 'object',
           arg: 'data',
           root: true
         },
      {
        arg: 'statuscode',
        type: 'int',
        http: {
          target: 'status'
        }
      }
     ],
  http: { verb: 'post', path: '/devicedata'},
  description: 'The devicedata endpoint sends the latest reading to Iotaas and returns confirmation. \n' }
);

}
