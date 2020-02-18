///////////////////////////////////////////////////////////////////////
/// Config
const net = require("net");
const port = 2222;
const msgLog = msg => console.log(msg.toString());
const readline = require("readline");
///////////////////////////////////////////////////////////////////////
/// Event handlers
const clients = net.connect({ port }, () => {
    clients.setEncoding('utf8');
    console.log("connected to server!");
});

clients.on("data", data => {
    msgLog(data);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question("Enter next command: ", cmd => {
        clients.write(cmd);
        rl.close();
    });
});

clients.on("end", () => {
    console.log("disconnected from server");
});
///////////////////////////////////////////////////////////////////////