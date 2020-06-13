///////////////////////////////////////////////////////////////////////
/// Config
// Импортируем модуль для работы с tcp server
const net = require("net");
// Импортируем модуль для работы с консолью
const { exec } = require("child_process");
// Создаем ТСР сервер
const tcpServer = net.createServer();
// Указываем порт для него
const port = 2222;
// Сокращение для console.log
const log = console.log;
// Последний текущий путь, заданный пользователем
let currentPath;
///////////////////////////////////////////////////////////////////////
/// Event handlers
// Когда сервер отключается, пишем об этом
tcpServer.on("close", () => {
  log("Сервер отключился");
});

//Когда к серверу подконнектился клиент, делаем что-то...
tcpServer.on("connection", function (client) {
  // Русские символы
  client.setEncoding("utf8");
  // Пишем в консоль
  log("TCP Клиент подключился к данному серверу");
  // Пишем на клиент
  client.write("Клиент начинает исполнять команды на данном сервере...");
  // Когда от клиента пришла какая-то команда
  client.on("data", function (data) {
    // Обрабатываем её
    data = prepareDataForExecution(data);
    // Если в отправленной пользователем команде содержится CD
    if (data.includes("cd ")) {
      // То мы сохраняем новый путь, и при открытии консоли сначала переходим по нужному пути, а потом уже исполняем саму команду
      if (currentPath) {
        data = insertCurrentPathToData(currentPath, data);
      }
      else {
        // Иначе не вставляем, а просто исполняем команду, а потом выводим текущую директорию
        data = `${data} && cd`;
      }
      log(`Клиент исполнил команду ${data}`);
      // Исполнить полученную команду
      exec(data.toString(), function(err, stdout, stderr) {
        //Если возникла ошибка, написать об этом клиенту
        if (err || stderr.length > 0) {
          log("Команду выполнить невозможно! Ожидание следующей команды");
          client.write("Команду выполнить невозможно! Ожидание следующей команды");
        } 
        // Если всё хорошо
        else {
          // Пишем что всё хорошо
          log(stdout);
          // Пишем текущий путь
          currentPath = stdout.replace(/\r?\n|\r/g, "").trim();
          log(`Текущая директория: ${currentPath}`);
          client.write(stdout || "Команда выполнена.");
        }
      });
    } 
    // Если в отправленной пользователем команде НЕ содержится CD
    else {
      if (currentPath) {
        // Вставляем перед ней текущий путь
        data = `cd "${currentPath}" && ${data.toString()}`;
      }
      log(`Клиент исполнил команду ${data}`);
      // Исполняем её
      exec(data, (err, stdout, stderr) => {
        if (err || stderr.length > 0) {
          log("Команду выполнить невозможно! Ожидание следующей команды");
          client.write("Команду выполнить невозможно! Ожидание следующей команды");
        } 
        else {
          log(stdout);
          client.write(stdout || "Команда выполнена");
        }
      });
    }
  });

  // Подготавливаем команду с клиента для выполнения
  function prepareDataForExecution(data) {
    // Удаляем все пробелы
    data = data.trim();
    // Удаляем лишние символы
    data = data.replace(/\r?\n|\r/g, "");
    return data;
  }

  function insertCurrentPathToData(currentPath, data) {
    data = `cd "${currentPath}" && ${data} && cd`;
    return data;
  }
 
  ///////////////////////////////////////////////////////////////////////
  client.on("error", function (error) {
    log("Ошибка: " + error);
  });

  client.on("timeout", function () {
    log("Нет ответа от клиентп");
    client.end("Нет ответа");
  });

  client.on("end", function (data) {
    log("Клиент прервал сеанс");
    log("Данные: " + data);
  });

  client.on("close", function (error) {
    log("Соединение с клиентом закрылось");
  });
  ///////////////////////////////////////////////////////////////////////
});
/////////////////////////////////////////////////////////////////////////
tcpServer.on("error", (error) => {
  log(`Возникла ошибка: ${error}`);
});

tcpServer.on("listening", () => {
  log(`TCP Сервер запущен на порту ${port}`);
});
///////////////////////////////////////////////////////////////////////
/// Starting
tcpServer.listen(port);
///////////////////////////////////////////////////////////////////////
