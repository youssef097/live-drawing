function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function colorsMatch(a,b){
    return a[0] == b[0] && a[1] == b[1] && a[2] == b[2]
}

function rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function getPixelColor(x, y,ctx) {
    // imageData = ctx.getImageData(0,0,c.width,c.height)
    let pdata = ctx.getImageData(x,y,1,1)
    var hex = "#" + ("000000" + rgbToHex(pdata[0],pdata[1],pdata[2])).slice(-6);
    console.log(hex);
    return hex;
}

function getPixelData(x,y, imageData){    
    let offset = (imageData.width * y + x) * 4
    let p = imageData.data     
    // console.log(rgbToHex(p[offset],p[offset+1],p[offset+2]));
    // document.body.style.backgroundColor = "#"+rgbToHex(p[offset],p[offset+1],p[offset+2])
    return [p[offset],p[offset+1],p[offset+2]]
}

function validCoord(x, y) {
    return true
    // if (y > c.width || y <= 0 || x > c.height || x <= 0){
    //     // console.log(x,y,"notValid");
    //     return false;
    // }else{
    // }
}

function showAlert(msg, color) {
    let alert = document.createElement("div")
    alert.className = "alert"
    alert.innerHTML = msg
    if (color == "red") {
        alert.style.backgroundColor = "#f35a5abb"
    }
    alertBox.appendChild(alert)
    setTimeout(() => {
        alertBox.removeChild(alert)
    }, 4000);

}