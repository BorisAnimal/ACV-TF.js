document.addEventListener("DOMContentLoaded", () => {
    let state = {
        click: false,
        move: false,
        pos: {x: 0, y: 0},
        pos_prev: false,
        updated: false,
    };
    // get canvas element and create context
    const canvas = document.getElementById('drawing');
    const output = document.getElementById('prediction');
    const context = canvas.getContext('2d');
    const clearButton = document.getElementById('clear-button');
    const bboxCondition = document.getElementById("debug-bboxes");
    let width = canvas.width;
    let height = canvas.height;
    let leftPad = canvas.getBoundingClientRect().left;
    let topPad = canvas.getBoundingClientRect().top;
    let debug = true;
    const socket = io.connect();

    // Button onclick events
    clearButton.onclick = () => socket.emit('clear', {})

    // register mouse event handlers
    canvas.ontouchstart = (e) => state.click = true;
    canvas.ontouchend= (e) => state.click = false;
    // canvas.onpointerdown= (e) => state.click = true;
    // canvas.onpointerup = (e) => state.click = false;
    canvas.onmousedown = (e) => state.click = true;
    canvas.onmouseup = (e) => state.click = false;
    canvas.onmouseleave = (e) => state.click = false;


    // canvas.onpointermove = (e) => {
    //     // normalize mouse position to range 0.0 - 1.0
    //     state.pos.x = (e.clientX - leftPad) / width;
    //     state.pos.y = (e.clientY - topPad) / height;
    //     state.move = true;
    // };

    canvas.onmousemove = (e) => {
        // normalize mouse position to range 0.0 - 1.0
        state.pos.x = (e.clientX - leftPad) / width;
        state.pos.y = (e.clientY - topPad) / height;
        state.move = true;
    };
    canvas.ontouchmove = (e) => {
        // if (e.target === canvas) {
        //     e.preventDefault();
        // }
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
        let elements = document.getElementsByClassName('bbox');
        for (let elem of elements) {
            elem.outerHTML = "";
            elem.innerHTML = "";
        }
        output.textContent = "";
    })

    socket.on('show_predict', (data) => {
        console.log(data)
        const labels = Object.values(data.labels);
        const coords = data.coords;
        console.log("pred:" + labels)


        let canvasOffset = getOffset(canvas);
        console.log("canvas offset:", canvasOffset)

        for (let elem of document.getElementsByClassName("bbox")) {
            elem.outerHTML = "";
            elem.innerHTML = "";
        }

        for (let i = 0; i < coords.length; i++) {
            let c = coords[i];
            let [minX, maxX, minY, maxY] = c;
            [minX, maxX, minY, maxY] = [minX, maxX, minY, maxY];
            let myLayer = document.createElement('div');
            myLayer.id = 'pred_box' + i;
            myLayer.className = 'bbox';
            myLayer.style.position = 'absolute';
            myLayer.style.visibility = bboxCondition.checked ? "visible" : "hidden";
            myLayer.style.left = canvasOffset.left + minX * width + "px";
            myLayer.style.top = canvasOffset.top + minY * height + "px";
            myLayer.style.width = (maxX - minX) * width + "px";
            myLayer.style.height = (maxY - minY) * height + "px";
            // myLayer.style.padding = ;
            myLayer.style.border = '1px solid green';
            myLayer.tagName = 'bbox'
            myLayer.innerHTML = "<p style='margin-left: -14px'>" + labels[i] + "</p>";
            document.body.appendChild(myLayer);

        }

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
            state.updated = false;
            instanceSegmentation(canvas, debug).then((segmented) => {
                socket.emit('ocr', segmented);
            })
        }

        state.pos_prev = {x: state.pos.x, y: state.pos.y};
        setTimeout(mainLoop, 25);
    }

    mainLoop();
});

function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {top: _y, left: _x};
}

