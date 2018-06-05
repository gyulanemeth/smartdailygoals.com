var audioDing = new Audio("ding.mp3");

var config = JSON.parse(localStorage.getItem("pompom-config")) || {
    sound: true
};

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}
  
function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
  
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ];
  
    if (endAngle - startAngle > 359) {
        d.push("Z");
    }
  
    return d.join(" ");       
}


document.getElementById("arc").setAttribute("d", describeArc(150, 150, 100, 0, 0));

const pomodoroTimeboxes = {
    focus: () => {
        return {
            label: "focus",
            length: 25 * 60,
            timeSpent: 0,
            colors: {
                background: "#abcdef",
                bgArc: "#aabbcc",
                arc: "#ddeeff"
            }
        };
    },
    shortBreak: () => {
        return {
            label: "short break",
            length: 5 * 60,
            timeSpent: 0,
            colors: {
                background: "#abefcd",
                bgArc: "#aaccbb",
                arc: "#ddffee"
            }
        };
    },
    longBreak: () => {
        return {
            label: "long break",
            length: 15 * 60,
            timeSpent: 0,
            colors: {
                background: "#abefcd",
                bgArc: "#aaccbb",
                arc: "#ddffee"
            }
        }
    }
};

const timeboxes = [
    pomodoroTimeboxes.focus(),
    pomodoroTimeboxes.shortBreak(),
    pomodoroTimeboxes.focus(),
    pomodoroTimeboxes.shortBreak(),
    pomodoroTimeboxes.focus(),
    pomodoroTimeboxes.shortBreak(),
    pomodoroTimeboxes.focus(),
    pomodoroTimeboxes.longBreak()
];

let actTimeboxIdx = 0;
let actTimebox = timeboxes[actTimeboxIdx];
setActTimebox(actTimeboxIdx);


document.getElementById("")


document.getElementById("background-arc").setAttribute("d", describeArc(150, 150, 100, 0, 359.9));
document.getElementById("label").innerHTML = actTimebox.label;

function setColors(colors) {
    document.body.style.background = colors.background;
    document.getElementById("background-arc").setAttribute("stroke", colors.bgArc);
    document.getElementById("arc").setAttribute("stroke", colors.arc);
}

function setActTimebox(idx) {
    actTimebox = timeboxes[actTimeboxIdx];
    actTimebox.timeSpent = 0;

    displayTimebox(actTimebox);
}

function displayTimebox(actTimebox) {
    document.title = timeToString(actTimebox.length - actTimebox.timeSpent)  + " - " + actTimebox.label;
    document.getElementById("time-spent").innerHTML = timeToString(actTimebox.timeSpent) + " / " + timeToString(actTimebox.length);

    let deg = 360 / actTimebox.length * actTimebox.timeSpent;

    if (deg === 360) {
        deg = 359.9;
    }

    document.getElementById("arc").setAttribute("d", describeArc(150, 150, 100, 0, deg));
}

function timeToString(time) {
    var minutes = Math.floor(time / 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    var seconds = time % 60;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return minutes + ":" + seconds;
}

setColors(actTimebox.colors);

var timerId = null;
function play() {
    document.getElementById("play").style.display = "none";
    document.getElementById("pause").style.display = "block";
    timerId = setInterval(function() {
        actTimebox.timeSpent += 1;

        displayTimebox(actTimebox);
        showProgress(timeboxes);

        if (actTimebox.length - actTimebox.timeSpent < 0.1) {
            if (config.sound) {
                audioDing.play();
            }

            actTimeboxIdx += 1;
            actTimeboxIdx %= timeboxes.length;

            setActTimebox(actTimeboxIdx);
            setColors(actTimebox.colors);
            showProgress(timeboxes);

            document.getElementById("label").innerHTML = actTimebox.label;
        }
    }, 1000);
}

function stop() {
    document.getElementById("play").style.display = "block";
    document.getElementById("pause").style.display = "none";
    if (!timerId) {
        return;
    }

    clearInterval(timerId);
    timerId = null;
}

function prev() {
    if (actTimebox.timeSpent > 5) {
        actTimebox.timeSpent = 0;
        return;
    }

    actTimeboxIdx -= 1;

    if(actTimeboxIdx < 0) {
        actTimeboxIdx = 0;
    }

    setActTimebox(actTimeboxIdx);
    setColors(actTimebox.colors);
    showProgress(timeboxes);

    document.getElementById("label").innerHTML = actTimebox.label;
}

function next() {
    actTimebox.timeSpent = 0;

    actTimeboxIdx += 1;
    actTimeboxIdx %= timeboxes.length;

    setActTimebox(actTimeboxIdx);
    setColors(actTimebox.colors);
    showProgress(timeboxes);
    
    document.getElementById("label").innerHTML = actTimebox.label;
}

document.getElementById("play").onclick = play;
document.getElementById("pause").onclick = stop;
document.getElementById("prev").onclick = prev;
document.getElementById("next").onclick = next;


if (!config.sound) {
    document.getElementById("speaker-sound").style.display = "none";
}

document.getElementById("speaker").onclick = function() {
    config.sound = !config.sound;
    localStorage.setItem("pompom-config", JSON.stringify(config));

    document.getElementById("speaker-sound").style.display = config.sound ? "" : "none";
}

function showProgress(timeboxes) {
    const progressGroup = document.getElementById("progress");

    while (progressGroup.lastChild) {
        progressGroup.removeChild(progressGroup.lastChild);
    }

    const rectWidth = 7;
    const rectRounding = 2;

    const svgNamespace = document.createElementNS("http://www.w3.org/2000/svg", "svg").namespaceURI;

    timeboxes.map((timebox, idx) => {
        const rect = document.createElementNS(svgNamespace, "rect");

        const color = actTimebox === timebox ? timebox.colors.arc : timebox.colors.bgArc;

        rect.setAttribute("x", idx * rectWidth);
        rect.setAttribute("y", 0);
        rect.setAttribute("width", rectWidth);
        rect.setAttribute("height", rectWidth);
        rect.setAttribute("rx", rectRounding);
        rect.setAttribute("ry", rectRounding);
        rect.setAttribute("fill", color);

        return rect;
    }).forEach(rect => progressGroup.appendChild(rect));
}

showProgress(timeboxes);