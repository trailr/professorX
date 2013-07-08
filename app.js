/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , io = require('socket.io')
  , path = require('path')
  // , sudo = require('sudo')
  // , spawn = require('child_process').spawn
  // , arduino = require('./modules/serial_node')
  // , commands = []
  // , command = ""  
  , iosocket
  // , lastResponseCode = "";
  , app = express()
  , server
  , options = {
      cachePassword: true,
      prompt: 'Password, yo? '};
  // , lastCommand = {};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io = io.listen(server);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
  iosocket = socket;
  socket.on('message',function(data){
    var bits = data.split(":");
    switch (bits[0]) {
      case "mReport" :
        io.sockets.emit('mutant_report', {
          'mutantID': bits[1],
          'distance': bits[2]
        });
        console.log(bits[1],bits[2]);
        break;
      case "cmd" :
        console.log("GOT COMMAND",data);
        io.sockets.emit(bits[1]);
        break;
      default :
        console.log(data);
        break;
    }
  });
  // socket.on('command', function (data) {
  //   //commands.push(data.id+" "+data.detail);
  //   var command = "" + data.id + ":" + data.detail + "\n";
  //   console.log("SENDING CMD:" + command);
  //   arduino.sendData(command);
  //   if (data.id == "*") {
  //     for (var mutantID in lastCommand) {
  //       lastCommand[mutantID] = data.detail;
  //     }
  //   } else {
  //     lastCommand[data.id] = data.detail;
  //   }
  // });
});
