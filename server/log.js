var config=require('config.json')('server/log.json');
var winston=require('winston');

var transports=[];
if(config.file){
  transports.push(new (winston.transports.File)(config.file));
}
if(config.console){
  transports.push(new (winston.transports.Console)(config.console));
}

var logger = new (winston.Logger)({
   transports: transports
});

exports.setLevel = function (appender, level){
  if(appender=='console' && logger.transports.console){
    logger.transports.console.level=level;
  };
  if(appender=='file' && logger.transports.file){
    logger.transports.file.level=level;
  };
}
exports.getLogger = function (){
  return logger;
}
