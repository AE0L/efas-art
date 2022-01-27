console.log("here")

const gallery = document.getElementById('gallery');

var deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
var img = document.createElement('img');

var activeObject = null;
var textColor = document.getElementById("textColor");
var objectType = null;
var fontFamily = document.getElementById("fontFamily");
var fontSize = document.getElementById("fontSize");
var lineWeight = document.getElementById("lineWeight");
var lineColor = document.getElementById("lineColor");
var textColor = document.getElementById("textColor");
var fontFamily = document.getElementById("fontFamily");
var fontSize = document.getElementById("fontSize");
var textBold = document.getElementById("textBold");
var textItalic = document.getElementById("textItalic");
var textUnderline = document.getElementById("textUnderline");
var download = document.getElementById("downloadBtn");
var weightCounter = document.getElementById("weightCounter");
var lineColor = document.getElementById("lineColor");
var fontSliderCounter = document.getElementById("fontSliderCounter");
var bgColor = document.getElementById("bgColor");
var hexValue = document.getElementById("hexValue");
var isTransparent = document.getElementById("isTransparent")

const clearCanvas = (canvas) => {
    canvas.getObjects().forEach((o) => {
        if (o !== canvas.backgroundImage) {
            canvas.remove(o);
        }
    });
}

const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: 800,
        height: 450,
        backgroundColor: bgColor.value
    });
}

const canvas = initCanvas('canvas');

img.src = deleteIcon;

const canvCenter = canvas.getCenter();

function geturl(img) {
    var name = img.src;
    console.log(name);
    fabric.Image.fromURL(name, function(img) {
        var oImg = img.set({ left: canvCenter.left, top: canvCenter.top, originX: 'center', originY: 'center' });
        oImg.scaleToWidth(100);
        oImg.scaleToHeight(100);
        canvas.add(oImg);
        var countObj = canvas.getObjects().length;
        canvas.setActiveObject(canvas.item(countObj - 1));

    });
}

fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderIcon,
    cornerSize: 24
});

function deleteObject(eventData, transform) {
    var target = transform.target;
    var canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
}

function renderIcon(ctx, left, top, styleOverride, fabricObject) {
    var size = this.cornerSize;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
}






canvas.on('selection:created', function() {
    activeObject = canvas.getActiveObject();
    objectType = activeObject.get('type');
    console.log(activeObject.pathWidth)

    if (activeObject.get('type') === "i-text") {
        console.log(activeObject.underline)
        textColor.disabled = false;
        fontFamily.disabled = false;
        fontSize.disabled = false;
        textBold.disabled = false;
        textItalic.disabled = false;
        textUnderline.disabled = false;
        fontFamily.value = activeObject.fontFamily;
        fontSize.value = activeObject.fontSize;
    } else {
        textColor.disabled = true;
        fontFamily.disabled = true;
        fontSize.disabled = true;
        textBold.disabled = true;
        textItalic.disabled = true;
        textUnderline.disabled = true;


    }
});

canvas.on('selection:updated', function(options) {
    activeObject = canvas.getActiveObject();

    objectType = activeObject.get('type');
    if (activeObject.get('type') === "i-text") {
        textColor.disabled = false;
        fontFamily.disabled = false;
        fontSize.disabled = false;
        textBold.disabled = false;
        textItalic.disabled = false;
        textUnderline.disabled = false;
        fontFamily.value = activeObject.fontFamily;
        fontSize.value = activeObject.fontSize;

    } else {
        textColor.disabled = true;
        fontFamily.disabled = true;
        fontSize.disabled = true;
        textBold.disabled = true;
        textItalic.disabled = true;
        textUnderline.disabled = true;

    }
});

canvas.on('selection:cleared', function(options) {
    textColor.disabled = true;
    fontFamily.disabled = true;
    fontSize.disabled = true;
    textBold.disabled = true;
    textItalic.disabled = true;
    textUnderline.disabled = true;

});


bgColor.addEventListener("input", function() {
    canvas.backgroundColor = bgColor.value;
    hexValue.innerText = bgColor.value
    canvas.requestRenderAll();
});

isTransparent.addEventListener("input", function() {
    if (canvas.backgroundColor !== null) {
        canvas.backgroundColor = null;
        bgColor.disabled = true;
        hexValue.innerText = "";
    } else {
        canvas.backgroundColor = bgColor.value;
        hexValue.innerText = bgColor.value
        bgColor.disabled = false;
    }

    canvas.requestRenderAll();
});

textUnderline.addEventListener("input", function() {
    activeObject = canvas.getActiveObject();
    if (activeObject.underline === false) {
        activeObject.underline = true
        activeObject.set({ dirty: true });
        canvas.requestRenderAll();
    } else {
        activeObject.underline = false
        activeObject.set({ dirty: true });
        canvas.requestRenderAll();
    }

});

lineWeight.addEventListener("input", function() {
    activeObject = canvas.getActiveObject();
    weightCounter.innerText = lineWeight.value;
    if (canvas.freeDrawingBrush) {
        brush = canvas.freeDrawingBrush;
        brush.width = parseInt(lineWeight.value, 10) || 1;
    }
});

lineColor.addEventListener("input", function() {
    activeObject = canvas.getActiveObject();
    if (canvas.freeDrawingBrush) {
        brush = canvas.freeDrawingBrush;
        brush.color = lineColor.value;
    }
});



$("#toggleDraw").click(function() {
    if (canvas.isDrawingMode === false) {
        $(this).addClass('btn-primary')
        $(this).removeClass('btn-secondary')
        $(this).text('Signature Mode: ON')

        canvas.isDrawingMode = true;
        lineWeight.disabled = false;
        lineColor.disabled = false;
    } else {
        $(this).addClass('btn-secondary')
        $(this).removeClass('btn-primary')
        $(this).text('Signature Mode: OFF')

        canvas.isDrawingMode = false;
        lineWeight.disabled = true;
        lineColor.disabled = true;
    }
});

$("#addText").click(function() {
    canvas.add(new fabric.IText('Tap and Type', {
        fontFamily: 'arial',
        left: 100,
        top: 100,
    }));

    canvas.setActiveObject(canvas.item(0));

    canvas.isDrawingMode = false;

    lineWeight.disabled = true;
    lineColor.disabled = true;

    textBold.checked = false
    textItalic.checked = false
    textUnderline.checked = false
});

textColor.addEventListener("input", function() {
    activeObject = canvas.getActiveObject();
    console.log(textColor.value)
    activeObject.set("fill", textColor.value);
    canvas.requestRenderAll();
});

$('#fontFamily').on('change', function() {
    activeObject = canvas.getActiveObject();
    activeObject.set("fontFamily", fontFamily.value);
    canvas.requestRenderAll();
});

fontSize.addEventListener("input", function() {
    activeObject = canvas.getActiveObject();
    sliderValue = $("#fontSize").val();
    fontSliderCounter.innerText = sliderValue
    activeObject.fontSize = sliderValue;
    canvas.requestRenderAll();
});

textBold.addEventListener("input", function() {
    if (this.checked) {
        dtEditText('bold');
    }
});

textItalic.addEventListener("input", function() {
    if (this.checked) {
        dtEditText('italic');
    }
});

textUnderline.addEventListener("input", function() {
    if (this.checked) {
        activeObject = canvas.getActiveObject();
        if (activeObject.underline === false) {
            activeObject.underline = true
            activeObject.set({ dirty: true });
            canvas.requestRenderAll();
        } else {
            activeObject.underline = false
            activeObject.set({ dirty: true });
            canvas.requestRenderAll();
        }

    }
});


function dtEditText(action) {
    var a = action;
    var o = canvas.getActiveObject();
    var t;

    // If object selected, what type?
    if (o) {
        t = o.get('type');
    }

    if (o && t === 'i-text') {
        switch (a) {
            case 'bold':
                var isBold = dtGetStyle(o, 'fontWeight') === 'bold';
                dtSetStyle(o, 'fontWeight', isBold ? '' : 'bold');
                break;

            case 'italic':
                var isItalic = dtGetStyle(o, 'fontStyle') === 'italic';
                dtSetStyle(o, 'fontStyle', isItalic ? '' : 'italic');
                break;
        }
    }
}

// Get the style
function dtGetStyle(object, styleName) {
    return object[styleName];
}

// Set the style
function dtSetStyle(object, styleName, value) {
    object[styleName] = value;
    object.set({ dirty: true });
    canvas.requestRenderAll();
}

// const dataURL = canvas.toDataURL({
//   width: canvas.width,
//   height: canvas.height,
//   left: 0,
//   top: 0,
//   format: 'png',
// });

// const link = document.createElement('a');
// link.download = 'image.png';
// link.href = dataURL;
// document.body.appendChild(link);
// link.click();
// document.body.removeChild(link);


// const downloadCanvas = (canvas) => {
//   const dataURL = canvas.toDataURL({
//     width: canvas.width,
//     height: canvas.height,
//     left: 0,
//     top: 0,
//     format: 'png',
//   });

//   const link = document.createElement('a');
//   link.download = 'image.png';
//   link.href = dataURL;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

// }