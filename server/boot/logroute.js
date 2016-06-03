var logger= require('../log.js');
module.exports = function(app) {
console.log(JSON.stringify(logger, null, 2));
log=  logger.getLogger();
console.log(JSON.stringify(log, null, 2));
  // Install a "/ping" route that returns "pong"
  logger.setLevel('file','debug');
  app.get('/log/:appender/:level', function (req, res) {
      if (!(req.params.level )) {
        res.send(500, 'Missing level parameter. Use one of debug, info, warn or error. /<appender>/<level>.');
      } else if (!(req.params.appender )) {
        res.send(500, 'Missing level appender. Use one of console, file. /log/<appender>/<level>.');
      }else {
          logger.setLevel(req.params.appender, req.params.level);
          res.send(200, JSON.stringify(log, null, 2));
      }
  });

};
