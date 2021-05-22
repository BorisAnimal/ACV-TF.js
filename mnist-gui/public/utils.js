function once(fn, context) {
    var result;
    return function () {
        if (fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }
        return result;
    };
}


async function instanceSegmentation(canvas, debug = null) {
    let image = IJS.Image.fromCanvas(canvas);
    if (debug)
        console.log("All zeros in input:", image.data.every(_ => _ === 0))

    let grey = IJS.Image.createFrom(image, {
        components: 1,
        alpha: false,
        colorModel: 'GREY' //GREY,
    });
    let ptr = 0;
    let data = image.data;
    for (let j = 0; j < data.length; j += image.channels) {
        grey.data[ptr++] = data[j + 3];
    }
    grey = grey
        .dilate({iterations: 3})
        .resize({width: 600, height: 300})
        .dilate({iterations: 1})


    if (debug) {
        console.log("All zeros in grey:", grey.data.every(_ => _ === 0))
        let elem = document.getElementById("debug_grey");
        elem.setAttribute("src", grey
            .resize({width: 400, height: 200})
            .toDataURL("image/png"));
        elem.setAttribute("height", "200");
        elem.setAttribute("width", "400");
        elem.setAttribute("alt", "grey_img");
        // elem.setAttribute("hidden", "false");
        // elem.style.visibility = "visible";
    }

    let mask = grey.mask();
    let roiManager = grey.getRoiManager();
    roiManager.fromMask(mask);
    let rois = roiManager.getRois({positive: true, negative: false, minSurface: 6})//.filter(_=>_.id !== -1)


    if (debug) {
        console.log("rois:", rois)
        var container = document.getElementById("debug2_crops");
        container.innerHTML = '';
    }


    let crops = rois.map((r) => {
        let [minX, maxX, minY, maxY] = [r.minX, r.maxX, r.minY, r.maxY]
        let width = maxX - minX
        let height = maxY - minY
        let side = Math.max(width, height)


        let x = grey
            .crop({
                x: minX, y: minY,
                width: width, height: height
            })
            .pad({
                size: [
                    parseInt((side - width) / 2),
                    parseInt((side - height) / 2)
                ],
                color: [0],
                algorithm: 'set'
            })
            .resize({
                width: 24,
                height: 24,
            })
            .pad({
                size: [2, 2],
                color: [0],
                algorithm: 'set'
            })

        if (debug) {
            let elem = document.createElement("img");
            elem.setAttribute("src", x.toDataURL("image/png"));
            elem.setAttribute("height", "28");
            elem.setAttribute("width", "28");
            elem.setAttribute("alt", "img");
            container.appendChild(elem);
        }

        return Object.values(x.data)
    })

    let coords = rois.map((r) => {
        return [
            r.minX / mask.width, r.maxX / mask.width,
            r.minY / mask.height, r.maxY / mask.height,
        ]
    })


    return {images: crops, coords: coords}

}
