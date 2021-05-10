document.addEventListener("DOMContentLoaded", () => {
    let state = {
        click: false,
        move: false,
        pos: {x: 0, y: 0},
        pos_prev: false,
        updated: false,
        response_received: true,
    };
    // get canvas element and create context
    const canvas = document.getElementById('drawing');
    const output = document.getElementById('prediction');
    const context = canvas.getContext('2d');
    const clearButton = document.getElementById('clear-button');
    let width = canvas.width;
    let height = canvas.height;
    let leftPad = canvas.getBoundingClientRect().left;
    let topPad = canvas.getBoundingClientRect().top;
    let debug = true;
    const socket = io.connect();

    // Button onclick events
    clearButton.onclick = () => socket.emit('clear', {})

    // register mouse event handlers
    canvas.onmousedown = (e) => state.click = true;
    canvas.onmouseup = (e) => state.click = false;
    canvas.onmouseleave = (e) => state.click = false;

    canvas.onmousemove = (e) => {
        // normalize mouse position to range 0.0 - 1.0
        state.pos.x = (e.clientX - leftPad) / width;
        state.pos.y = (e.clientY - topPad) / height;
        state.move = true;
    };

    // draw line received from server
    socket.on('draw_line', (data) => {
        let line = data.line;
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    });

    socket.on('clear', (_) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
    })

    socket.on('show_predict', (data) => {
        console.log(data)
        const labels = Object.values(data.labels);
        const coords = data.coords;

        console.log("pred:" + labels)

        output.textContent = "" + labels;
    });

    let c = 0;

    // main loop, running every 25ms
    function mainLoop() {
        c += 1;
        // console.log('loop')

        // check if the user is drawing
        if (state.click && state.move && state.pos_prev) {
            console.log('draw_line')
            // send line to the server
            socket.emit('draw_line', {line: [state.pos, state.pos_prev]});
            state.move = false;
            state.updated = true;
        }

        // Call backend for OCR
        if (c % 40 === 0 && state.updated && !state.click) {
            // TODO: 1. make resize before act 2. Make async
            state.updated = false;
            // TODO: add position data to message
            instanceSegmentation(canvas, debug).then((image_data) => {
                socket.emit('ocr', {images: image_data, coords: 123});
            })
        }

        state.pos_prev = {x: state.pos.x, y: state.pos.y};
        setTimeout(mainLoop, 25);
    }

    mainLoop();
});
