///////////////////////////////////////////////////////////////////////
/// Config
const net = require("net");
const { exec } = require("child_process");
const server = net.createServer();
const port = process.env.PORT || 2222;
const msgLog = msg => console.log(`Client says: ${msg}`);
const log = console.log;
///////////////////////////////////////////////////////////////////////
/// Event handlers
server.on("close", () => {
  log("Server closed!");
});

server.on("connection", function (socket) {
  socket.setEncoding('utf8'); 
  socket.write("Plase execute commans on server.");
  socket.on("data", data => {
    msgLog(data);
    log(`Executing command "${data}"...`)
    exec(data.toString(), (err, stdout, stderr) => {
      if (err || stderr.length > 0) {
        console.error(err)
        socket.write(stderr || err || "Error happened!");
      } else {
        log(stdout);
        socket.write(stdout || "Command executed");
      }
    });
  });

  socket.on("error", function (error) {
    log("Error: " + error);
  });

  socket.on("timeout", function () {
    log("Socket timed out!");
    socket.end("Timed out!");
  });

  socket.on("end", function (data) {
    log("Socket ended from other end!");
    log("End data : " + data);
  });

  socket.on("close", function (error) {
    log("Socket closed!");
  });
});

server.on("error", error => {
  log(`Error: ${error}`);
});

server.on("listening", () => {
  log(`Server is listening on port ${port}`);
});
///////////////////////////////////////////////////////////////////////
/// Starting  
server.listen(port);
///////////////////////////////////////////////////////////////////////
