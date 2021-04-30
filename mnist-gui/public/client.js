document.addEventListener("DOMContentLoaded", () => {
    var mouse = {
        click: false,
        move: false,
        pos: {x: 0, y: 0},
        pos_prev: false
    };
    // get canvas element and create context
    var canvas = document.getElementById('drawing');
    var context = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    let leftPad = canvas.getBoundingClientRect().left;
    let topPad = canvas.getBoundingClientRect().top;
    var socket = io.connect();

    // set canvas to full browser width/height
    canvas.width = width;
    canvas.height = height;

    // register mouse event handlers
    canvas.onmousedown = function (e) {
        mouse.click = true;
    };
    canvas.onmouseup = function (e) {
        mouse.click = false;
    };

    canvas.onmousemove = function (e) {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = (e.clientX - leftPad) / width;
        mouse.pos.y = (e.clientY - topPad) / height;
        mouse.move = true;
    };

    // draw line received from server
    socket.on('draw_line', (data) => {
        let line = data.line;
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    });

    let c = 0;

    // main loop, running every 25ms
    function mainLoop() {
        // c += 1;
        // if (c % 40) {
        //     c = 0;
        //     let w = canvas.width;
        //     let h = canvas.height;
        //     socket.emit('ocr', {image: context.getImageData(0, 0, w, h)})
        // }
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to the server
            socket.emit('draw_line', {line: [mouse.pos, mouse.pos_prev]});
            mouse.move = false;
        }
        mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
        setTimeout(mainLoop, 25);
    }

    mainLoop();
});
