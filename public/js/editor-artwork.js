const gallery = document.getElementById('gallery')

const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
const img = document.createElement('img')
const opacity = document.getElementById("opacitySlider")
const download = document.getElementById("downloadBtn")
let activeObject = null
let objectType = null

const clearCanvas = (c) => {
    c.getObjects().forEach((o) => {
        if (o !== c.backgroundImage) {
            c.remove(o)
        }
    })

    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas))
    artwork_img.value = artwork_img.defaultValue
}

const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: 1000,
        height: 450,
        crossOrigin: 'anonymous'
    })
}

let canvas = initCanvas('canvas')
let canvCenter = canvas.getCenter()

const setBg = (url, c) => {
    fabric.Image.fromURL(url, (_img) => {
        _img.scaleToWidth(1000)

        const sw = _img.getScaledWidth()
        const sh = _img.getScaledHeight()
    
        canvas.setDimensions({ width: sw, height: sh });
        canvCenter = canvas.getCenter()

        _img.set({ left: canvCenter.left, top: canvCenter.top, originX: 'center', originY: 'center' })
        c.backgroundImage = _img
        c.requestRenderAll()
    }, { crossOrigin: 'Anonymous' })
}

choose_artwork_img.onchange = (e) => {
    const file = e.target.files[0]
    const fr = new FileReader()
    const i = new Image()

    fr.readAsDataURL(file)
    fr.onload = (fr_e) => {
        if (fr_e.target.readyState === FileReader.DONE) {
            i.onload = function() {
                setBg(this.src, canvas)
            }

            i.src = fr_e.target.result
        }
    }
}

img.src = deleteIcon

// $('.wat').each((i,e) => {
//     e.onclick = geturl
// })

function geturl(e) {
    e = 'https://cors-anywhere.herokuapp.com/'+e
    fabric.Image.fromURL(e, function(_img) {
        console.log()
        _img.crossOrigin = 'anonymous'
        _img.scaleToWidth(100)
        _img.scaleToHeight(100)
        canvas.add(_img)
        canvas.centerObject(_img)
        const countObj = canvas.getObjects().length
        canvas.setActiveObject(canvas.item(countObj - 1))
        canvas.requestRenderAll();
    }, { crossOrigin: 'Anonymous' })
}

fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: 16,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteObject,
    render: renderIcon,
    cornerSize: 24
})

function deleteObject(eventData, transform) {
    const target = transform.target
    const c = target.canvas
    c.remove(target)
    c.requestRenderAll()
}

function renderIcon(ctx, left, top, styleOverride, fabricObject) {
    const size = this.cornerSize
    ctx.save()
    ctx.translate(left, top)
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
    ctx.drawImage(img, -size / 2, -size / 2, size, size)
    ctx.restore()
}

canvas.on('selection:created', function() {
    opacity.disabled = false
    activeObject = canvas.getActiveObject()
    opacity.value = activeObject.opacity * 100
    objectType = activeObject.get('type')
})

canvas.on('selection:updated', function(options) {
    opacity.disabled = false
    activeObject = canvas.getActiveObject()
    opacity.value = activeObject.opacity * 100
})

canvas.on('selection:cleared', function(options) {
    opacitySlider.disabled = true
})

opacity.addEventListener("input", function() {
    activeObject = canvas.getActiveObject()
    sliderValue = $("#opacitySlider").val()
    activeObject.opacity = sliderValue / 100
    canvas.requestRenderAll()
})

const downloadCanvas = (c) => {
    const dataURL = c.toDataURL('image/png')

    const link = document.createElement('a')
    link.download = 'image.png'
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

}