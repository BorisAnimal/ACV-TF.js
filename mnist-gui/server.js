const express = require('express'),
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');
const tf = require('@tensorflow/tfjs-node');


const modelDir = './models/';
tf.loadLayersModel(`file://${modelDir}/model.json`).then((model) => {
    var line_history = []; // array of all lines drawn

    var server = http.createServer(app); // start webserver on port 8080
    var io = socketIo.listen(server);
    server.listen(8080);
    app.use(express.static(__dirname + '/public'));// add directory with our static files
    console.log("Server running on 127.0.0.1:8080");


    // event-handler for new incoming connections
    io.on('connection', (socket) => {
        // first send the history to the new client
        for (let i in line_history) {
            socket.emit('draw_line', {line: line_history[i]});
        }
        // register callbacks
        // socket.onerror(console.error)
        socket.on('draw_line', onNewLine(io, line_history));
        socket.on('ocr', ocr(io, model))
        socket.on('clear', (_) => {
            line_history.splice(0, line_history.length);
            io.emit('clear', {});
        })
    });
});


const onNewLine = (io, line_history) => (data) => {
    line_history.push(data.line);
    io.emit('draw_line', {line: data.line}); // send line to all clients
}

const ocr = (io, model) => (data) => {
    const images = data.images;
    const coords = data.coords;
    if (images.length === 0) return
    let input = tf.tensor(images, [images.length, 28, 28, 1]);
    const labels = model.predict(input).argMax(1).dataSync();
    console.log({labels: labels, coords: coords});
    io.emit('show_predict', {labels: labels, coords: coords});
}
