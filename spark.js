var canvas = document.getElementById("foo")
var ctx = canvas.getContext("2d")

// variable Variabeln
var vMax = 10
var sparkSize = 3
var sparkNum = 1
var bgOpac = 6.6667
var scale = 100000
var zoomX = 0
var zoomY = 0

// Modes
var moveMode = new Object()
moveMode["wiggle"] = false
moveMode["curves"] = false
moveMode["physics"] = true

var showMode = new Object()
showMode["oscillate"] = false
showMode["normal"] = true

// Blubber
oldT = new Date().getTime()

// It is slider time !
sliders = {
  "sparkNum" : {name:"particle number", min:1, max:1000, step:1},
  "sparkSize" : {name:"particle size", min:1, max:100, step:1},
  "vMax" : {name:"particle velocity", min:1, max:100, step:1},
  "bgOpac" : {name:"tail-length", min:1, max:1000, step:1},
  "bLimit" : {name:"bLimit", min:0.001, max:2, step:0.01},
  "dLimit" : {name:"dLimit", min:0.001, max:2, step:0.01},
  "scale" : {name:"scale", min:1, max:1000000, step:1}
}

var sparks = []
function genSparks(num, x, y, vx, vy, m) {
  for (var i=0 ; i < num ; i++) {
    sparks.push({
      "x" : x,
      "y" : y,
      "v" : 1,
      "vx" : vx,
      "vy" : vy,
      "a" : Math.random() * Math.PI * 2 - Math.PI,
      "b" : 0,
      "accel" : 0,
      "d" : Math.random()/5,
      "swarm" : "-1",
      "m" : m || 5.974 * Math.pow(10, 24),
      "color" : genCol2()
    })
  }
}

function newValue() {
  var x = 0
  if (Math.random() < 0.5) {
    // Add Char    
    switch (Math.round(5 * Math.random())) {
      case 0:
        return "A"
      case 1:
        return "B"
      case 2:
        return "C"
      case 3:
        return "D"
      case 4:
        return "E"
      case 5:
        return "F"
      default:
        return "X"
    }
  }
  else {
    // Add Number
    return Math.round(10 * Math.random())
  }
}

function genCol() {
  res = "#"
  for (var i = 0 ; i < 6; i++) {
    res += newValue()
  }
  return res
}

function genCol2() {
  colo = []
  for (var t = 0 ; t < 3 ; t++) {
    colo.push(Math.floor(Math.random() * 256)) 
  }
  return colo
}

function drawBG(col) {
  ctx.fillStyle = col
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function showSparks() {
  for (var s in sparks) {
    ctx.fillStyle = "rgb("+sparks[s].color[0]+","+sparks[s].color[1]+","+sparks[s].color[2]+")"
    drawCircle(sparks[s].x/scale+zoomX, sparks[s].y/scale+zoomY, sparkSize)
  }
}

function drawCircle(x, y, rad) {
  ctx.beginPath()
  ctx.arc(x, y, rad, 0, 7, false)
  ctx.fill()
  ctx.closePath()
}

function makeLine(sX, sY, zX, zY) {
  ctx.beginPath()
  ctx.moveTo(sX,sY)
  ctx.lineTo(zX,zY)
  ctx.stroke()
  ctx.closePath()
}

function moveSparksWiggle() {
  var t = new Date().getTime()
  var dT = (t - oldT)/100

  for (var s in sparks) {
    sparks[s].x += sparks[s].v * Math.sin(sparks[s].a) *dT
    sparks[s].y += sparks[s].v * Math.cos(sparks[s].a) *dT
    sparks[s].a += Math.random() - 0.5 
  }
  oldT = new Date().getTime()
}

var dLimit = 0.03
var bLimit = 0.003
var dChange = 10
function moveSparksCurves() {
  var t = new Date().getTime()
  var dT = (t - oldT)/100
  
  for (var s in sparks) {
    sparks[s].b =  Math.random() / dChange - 1 / (dChange * 2)
    if (sparks[s].b > bLimit) sparks[s].b = bLimit
    if (sparks[s].b < -bLimit) sparks[s].b = -bLimit

    sparks[s].d += sparks[s].b
    if (sparks[s].d > dLimit) sparks[s].d = dLimit
    if (sparks[s].d < -dLimit) sparks[s].d = -dLimit
    
    sparks[s].a += sparks[s].d
    
    sparks[s].x += sparks[s].v * Math.sin(sparks[s].a) *dT
    sparks[s].y += sparks[s].v * Math.cos(sparks[s].a) *dT
  }
  oldT = new Date().getTime()
}

var debug = 1
var gravK = 6.6742 * Math.pow(10, -11)
var dist = 0
var f = 0
var distX = 0
var distY = 0
var accelX = 0
var accelY = 0
var noAccelSpace = 3
var stars = []
var sparksAffect = true
var time = 0
function makePhysics() {
  var t = new Date().getTime()
  var dT = (t - oldT)/1000 *vMax
  time += dT
  document.getElementById("time").innerHTML = (time / 3600 / 24 / 365.25).toFixed(1)+" y "+((time / 3600 / 24)%365).toFixed(2)+" d"
  drawStars()
  
  for(var s in sparks) {
    for(var p in stars) {
      var accel = getAccel(sparks[s], stars[p])

      if (accel == "FAIL") continue
      sparks[s].vx += accel[0] *dT
      sparks[s].vy += accel[1] *dT
      
      ctx.fillStyle = "white"
      if(debug == 2) {textToTile(["Ages: "+accel, "f: "+f, "m: "+sparks[s].m ,"Ax: "+accelX, "Ay: "+accelY, "Vx: "+sparks[s].vx, "Vy: "+sparks[s].vy], sparks[s].x, sparks[s].y) ; textToTile(["M: "+stars[p].m], stars[p].x/scale+zoomX, stars[p].y/scale+zoomX)}
      ctx.strokeStyle = "white"
      if(debug == 1) makeLine(sparks[s].x/scale+zoomX, sparks[s].y/scale+zoomY, sparks[s].x/scale + accel[0]/scale+zoomX, sparks[s].y/scale + accel[1]/scale+zoomY)
      if(debug == 2) textToTile(["Dist: "+dist, "F: "+f, "v.x: "+sparsk[s].vx, "v.y: "+sparks[s].vy], sparks[s].x*scale-zoomX*scale, sparks[s].y*scale-zoomY*scale)
    }
    
    sparksAffect && sparksToo(sparks[s], dT)

    ctx.strokeStyle = "red"
    if(debug == 1) makeLine(sparks[s].x/scale+zoomX, sparks[s].y/scale+zoomY, sparks[s].x/scale + sparks[s].vx/scale*2+zoomX, sparks[s].y/scale + sparks[s].vy/scale*2+zoomY)

    sparks[s].x += sparks[s].vx *dT
    sparks[s].y += sparks[s].vy *dT
  }

  oldT = new Date().getTime()
}

function sparksToo(spark, dT) {
  for (var s in sparks) {
    if(spark.x == sparks[s].x) continue
    var accel = getAccel(sparks[s], spark)
    if (accel == "FAIL") continue
    ctx.strokeStyle = "green"
    if(debug == 1) makeLine(sparks[s].x/scale+zoomX, sparks[s].y/scale+zoomY, sparks[s].x/scale + accel[0]/scale*10000+zoomX, sparks[s].y/scale + accel[1]/scale*10000+zoomY)
    sparks[s].vx += accel[0] *dT
    sparks[s].vy += accel[1] *dT
  }
}

function getAccel(obj1, obj2) {
  distX = obj2.x - obj1.x
  distY = obj2.y - obj1.y
  dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2))
  f = gravK * (obj2.m * obj1.m) / Math.pow(dist, 2)
  accel = f / obj1.m

  if(Math.abs(dist) < 5) return "FAIL"
  accelX = (distX < 0 ? -1 : 1) * Math.abs(distX / dist) * accel
  accelY = (distY < 0 ? -1 : 1) * Math.abs(distY / dist) * accel
  
  return [accelX, accelY]
}

function genUniverse() {
  var planets =  [
    [0, 0, 0, 0, 1.989e30], // Sun
    [0, 57.9e9, 47.86e3, 0, 3.3e23], // Merkur
    [0, 108.2e9, 35e3, 0, 4.869e24], // Venus
    [0, 149.6e9, 29.78568e3, 0, 5.97e24],  // Erde
    [384e6, 149.6e9, 29.785e3, 1022, 7.35e22], // Erden Mond
    [0, 227.9e9, 24.124e3, 0,6.419e23], // Mars
  ]
  scale = 2000000000
  sparkNum = planets.length
  vMax = 1e6
  zoomX = 3e2
  zoomY = 3e2

  for(var p in planets) {
    genSparks(1, planets[p][0], planets[p][1], planets[p][2], planets[p][3], planets[p][4])
  }
}

function addPlanet(x, y) {
  stars.push({
    x : x,
    y : y,
    color : "yellow",
    r : 20,
    m : 1.98892 * Math.pow(10,30)
  })
}

function textToTile(text, x, y) {
  var di = 0
  for(var t in text) {
    ctx.fillText(text[t], x + 5, y + di)
    di += 10
  }
}

function drawStars() {
  for(var p in stars) {
    ctx.fillStyle = stars[p].color
    drawCircle(stars[p].x/scale+zoomX, stars[p].y/scale+zoomY, stars[p].r)
  }
}

function checkSpace() {
  for (var s in sparks) {
    if (sparks[s].x > canvas.width) {
      sparks[s].x = 0
    }
    if (sparks[s].x < 0) {
      sparks[s].x = canvas.width
    }
    if (sparks[s].y > canvas.height) {
      sparks[s].y = 0
    }
    if (sparks[s].y < 0) {
      sparks[s].y = canvas.height
    }
  } 
}

var adderColHigh = 30
var adderColLow = 4
var adderCol = 1
var oldTOsci = new Date().getTime()
function colorOsci() {
  var t = new Date().getTime()

  sparkSize += adderCol
  if (sparkSize > adderColHigh || sparkSize < adderColLow) adderCol = -adderCol

  oldTOsci = new Date().getTime()
}

function adjustSparks() {
  // Num
  while (sparks.length < sparkNum) genSparks(1, canvas.width/2*scale-zoomX*scale, canvas.height/2*scale-zoomY*scale, (Math.random() - 0.5) *scale+zoomX, (Math.random() - 0.5) *scale+zoomY)
  if (sparks.length > sparkNum) sparks.splice(0, sparks.length - sparkNum)
  // Velo
  for (var s in sparks) {
    sparks[s].v = vMax
  }
}

function setMoveMode(modeTrue) {
  for(var f in moveMode) {
    moveMode[f] = false
  }
  moveMode[modeTrue] = true
  if(!moveMode["physics"]) {scale = 1; document.getElementById("scale").value = 1}
  drawBG(genCol())
}

function setShowMode(modeTrue) {
  for(var f in showMode) {
    showMode[f] = false
  }
  showMode[modeTrue] = true
  drawBG(genCol())
}

function write(text, br) {
  if(br) document.getElementById("con").innerHTML+="<br>"+text
  else document.getElementById("con").innerHTML=text
}

function setFPS(fps, what) {
  if(what == "now") document.getElementById("showFPSnow").innerHTML = fps
  if(what == "aver") document.getElementById("showFPSaver").innerHTML = fps
}

function calcFPS(start, end) {
  var difMiSec = end - start
  var difSec = difMiSec / 1000
  var fps = 1 / difSec
  setFPS(fps.toFixed(4), "now")
}

var fpsAverMax = 100
fpss = []
function calcFPSaver(start, end) {
  var difMiSec = end - start
  var difSec = difMiSec / 1000
  var fps = 1 / difSec

  fpss.unshift(fps)
  
  while(fpss.length > fpsAverMax) fpss.pop()

  setFPS(getAverage(fpss).toFixed(4), "aver")
}

function getAverage(times) {
var nummer = 0
for(t in times) {
  nummer += times[t]
}
if(nummer != 0) return nummer/times.length
else return 0
}

function getClass(cName) {
  var output = []
  var allElems = document.getElementsByTagName('*');
  for (var i = 0; i < allElems.length; i++) {
    var thisElem = allElems[i]
    if (thisElem.className && thisElem.className == cName) {
      output.push(thisElem)
    }
  }
  return output
}

function genSliders() {
  for (var slid in sliders) {
    $('#slider').append(
      $('<div>')
        .addClass("slid")
        .text("Set "+sliders[slid].name+": ")
        .append(
          $('<input>')
            .attr("type", "range")
            .attr("min", sliders[slid].min)
            .attr("max", sliders[slid].max)
            .attr("step", sliders[slid].step)
            .attr("value", window[slid])
            .attr("data-xyz", slid)
            .attr("id", sliders[slid].name)
            .change(function() {window[$(this).attr("data-xyz")] = this.value;$(this).next().text("(" + this.valueAsNumber + ")")})
        )
        .append(
          $('<span>')
            .attr("class", "desc")
            .text("(" + window[slid] + ")")
        )
    )
  }
}

var lastOFx = 0
var lastOFy = 0
$('#foo').mousemove(function (e) {
  var topleft = $(this).offset()
  var offsetX = e.pageX - topleft.left
  var offsetY = e.pageY - topleft.top 
  downing && (moveMode["wiggle"] || moveMode["curves"]) && genSparks(10, offsetX*scale, offsetY*scale, (Math.random() - 0.5) *scale, (Math.random() - 0.5) *scale)
  
  if(moveMode["physics"]) {
    if(lastOFx - offsetX < 0 && downing) zoomX += 5
    if(lastOFx - offsetX > 0 && downing) zoomX -= 5
    if(lastOFy - offsetY < 0 && downing) zoomY += 5
    if(lastOFy - offsetY > 0 && downing) zoomY -= 5
    lastOFx = offsetX
    lastOFy = offsetY
  }
})

var downing = false
$('#foo').mousedown(function () {
  downing = true
})

$(document).mouseup(function () {
  downing = false
})

$('#foo').dblclick(function (e) {
  var topleft = $(this).offset()
  var offsetX = e.pageX - topleft.left
  var offsetY = e.pageY - topleft.top
  if(moveMode["curves"] || moveMode["wiggle"]) {
    var sparkNumTemp = sparkNum
    sparkNum = 10
    sparkNum = sparkNumTemp
    for (var sp in sparks) {
      genSparks(10, sparks[sp].x*scale, sparks[sp].y*scale, (Math.random() - 0.5) *scale, (Math.random() - 0.5) *scale)
    }
  }
  else if(moveMode["physics"]) {
    addPlanet(offsetX*scale-zoomX*scale, offsetY*scale-zoomY*scale)
  }
})

function makeFullscreen() {
  var body = document.getElementsByTagName('body')[0];
  body.style.overflow = "hidden"
  canvas.height = window.innerHeight + 50
  canvas.width = window.innerWidth
  drawBG(genCol())
}

drawBG(genCol())
genSliders()
function tick() {
  var start  = new Date().getTime()

  drawBG("rgba(0, 0, 0, "+1/bgOpac+")")
  showSparks()
  showMode["oscillate"] && colorOsci()
  moveMode["wiggle"] && moveSparksWiggle()
  moveMode["curves"] && moveSparksCurves()
  moveMode["physics"] && makePhysics()
  !moveMode["physics"] && checkSpace()
  adjustSparks()

  var end = new Date().getTime()
  calcFPS(start, end)
  calcFPSaver(start, end)
}

var inter = setInterval(tick, 0)
