const gallery = document.getElementById('gallery');

var deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
var img = document.createElement('img');
var opacity = document.getElementById("opacitySlider");
var activeObject = null;
var objectType = null;
var download = document.getElementById("downloadBtn");


const clearCanvas = (canvas) => {
  canvas.getObjects().forEach((o) => {
    if(o !== canvas.backgroundImage) {
      canvas.remove(o);
    }
  });
}

const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        width: 800,
        height: 450,
      
    });
}

const setBg = (url,canvas) => {
    fabric.Image.fromURL(url, (img) => {
        img.scaleToHeight(450);
        img.scaleToWidth(800);
        img.set({ left: canvCenter.left, top:canvCenter.top, originX: 'center', originY: 'center'});
        canvas.backgroundImage = img;
        canvas.requestRenderAll();
    });
}

const canvas = initCanvas('canvas');
setBg("/img/test1.jpg",canvas);


img.src = deleteIcon;

const canvCenter = canvas.getCenter();

function geturl(img)
{
    var name = img.src;
    console.log(name);
    fabric.Image.fromURL(name, function(img) {
        var oImg = img.set({ left: canvCenter.left, top:canvCenter.top, originX: 'center', originY: 'center'});
        oImg.scaleToWidth(100);
        oImg.scaleToHeight(100);
        canvas.add(oImg);
        var countObj = canvas.getObjects().length;
        canvas.setActiveObject(canvas.item(countObj-1));
        
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
    ctx.drawImage(img, -size/2, -size/2, size, size);
    ctx.restore();
  }

canvas.on('selection:created', function() {
  opacity.disabled = false;
  activeObject = canvas.getActiveObject();
  opacity.value = activeObject.opacity*100;
  objectType = activeObject.get('type');
  console.log(activeObject.pathWidth)
});

canvas.on('selection:updated', function(options) {
  opacity.disabled = false;
  activeObject = canvas.getActiveObject();
  opacity.value = activeObject.opacity*100;
});

canvas.on('selection:cleared', function(options) {
  opacitySlider.disabled = true;
});

opacity.addEventListener("input", function() {
    activeObject = canvas.getActiveObject();
    sliderValue = $("#opacitySlider").val();
    activeObject.opacity = sliderValue/100;
    console.log(activeObject.opacity);
    canvas.requestRenderAll();
});

const downloadCanvas = (canvas) => {
  const dataURL = canvas.toDataURL({
    width: canvas.width,
    height: canvas.height,
    left: 0,
    top: 0,
    format: 'png',
  });
  
  const link = document.createElement('a');
  link.download = 'image.png';
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

}










