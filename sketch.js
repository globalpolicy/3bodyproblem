'use strict';

var animate = false;
var G = 6.67 * Math.pow(10, -11);
var bodies = [];
var diameter = 10;
var distScale = 1;
var defaultMass = 1e10;

function setup() {
    let canvas = createCanvas(displayWidth * .9, displayHeight * .7);
    canvas.parent("canvas");
    canvas.mouseReleased(mouseReleased_);
    background('pink');
    document.getElementById("canvas").addEventListener("contextmenu", (mouseevent) => {
        mouseevent.preventDefault();
    });
}

function draw() {
    if (!animate) return;

    if (!document.getElementById("chkBoxtrace").checked) background('pink');

    let dt = document.getElementById("rangeDt").value;

    for (let i = 0; i < bodies.length; i++) {
        let magnitude = 0;
        let force = createVector(0, 0);
        for (let j = 0; j < bodies.length; j++) {
            if (i != j) {
                let diff = p5.Vector.sub(bodies[j].position, bodies[i].position);
                let distance = diff.mag() * distScale;
                diff.normalize(); //diff itself is normalized
                magnitude = G * bodies[i].mass * bodies[j].mass / Math.pow(distance, 2);
                let tmp = diff.setMag(magnitude).copy(); //force on i due to j
                force.add(tmp); //accumulate forces on i
            }
        }
        bodies[i].force = force.copy();
    }

    for (let i = 0; i < bodies.length; i++) {
        let accn = p5.Vector.div(bodies[i].force, bodies[i].mass);
        let dv = p5.Vector.mult(accn, dt);
        let ds = p5.Vector.mult(bodies[i].velocity, dt).add(p5.Vector.mult(accn, dt * dt)).copy();
        bodies[i].velocity.add(dv);
        updateVelocityText(i, bodies[i].velocity);
        bodies[i].position.add(ds);
    }

    for (let i = 0; i < bodies.length; i++) {
        let body = bodies[i];
        noStroke();
        fill(body.color.R, body.color.G, body.color.B);
        circle(body.position.x, body.position.y, diameter);
    }

}

function onStartClick() {
    animate = true;
}

function mouseReleased_(evnt) {
    if (evnt.button == 0) {
        //left clicked
        let color = { 'R': random(256), 'G': random(256), 'B': random(256) };
        bodies.push({ 'position': createVector(mouseX, mouseY), 'mass': defaultMass, 'color': color, 'force': createVector(0, 0), 'velocity': createVector(0, 0) });
        noStroke();
        fill(color.R, color.G, color.B);
        circle(mouseX, mouseY, diameter);
        noFill();
        createTextbox(color, bodies.length - 1);
    }
}

function sliderMoved(value) {
    document.getElementById("spanDt").innerText = value;
}

function createTextbox(color, index) {
    let container = document.getElementById("massesDiv");
    let div = document.createElement("div");
    div.setAttribute("style", "background-color:" + "rgb(" + color.R + "," + color.G + "," + color.B + ");");
    let text = document.createTextNode("Mass");
    div.appendChild(text);
    let massTextbox = document.createElement("input");
    massTextbox.setAttribute("type", "number");
    massTextbox.setAttribute("index", index);
    massTextbox.setAttribute("value", defaultMass);
    massTextbox.setAttribute("onchange", "massChanged(this)");
    div.appendChild(massTextbox);

    text = document.createTextNode("vx");
    div.appendChild(text);
    let velocityTextbox = document.createElement("input");
    velocityTextbox.setAttribute("type", "number");
    velocityTextbox.setAttribute("index", index);
    velocityTextbox.setAttribute("component", "x");
    velocityTextbox.setAttribute("value", 0);
    velocityTextbox.setAttribute("onchange", "velChanged(this)");
    div.appendChild(velocityTextbox);

    text = document.createTextNode("vy");
    div.appendChild(text);
    velocityTextbox = document.createElement("input");
    velocityTextbox.setAttribute("type", "number");
    velocityTextbox.setAttribute("index", index);
    velocityTextbox.setAttribute("component", "y");
    velocityTextbox.setAttribute("value", 0);
    velocityTextbox.setAttribute("onchange", "velChanged(this)");
    div.appendChild(velocityTextbox);

    container.appendChild(div);
}

function massChanged(obj) {
    let index = Number(obj.attributes.index.value);
    let newmass = Number(obj.value);
    for (let i = 0; i < bodies.length; i++) {
        if (i == index) {
            let body = bodies[i];
            body.mass = newmass;
        }
    }
}

function velChanged(obj) {
    let index = Number(obj.attributes.index.value);
    let newvel = Number(obj.value);
    let comp = obj.attributes.component.value;
    for (let i = 0; i < bodies.length; i++) {
        if (i == index) {
            let body = bodies[i];
            switch (comp) {
                case "x":
                    body.velocity.x = newvel;
                    break;
                case "y":
                    body.velocity.y = newvel;
                    break;
            }
        }
    }
}

function updateVelocityText(index, velocity) {
    let inputs = document.querySelectorAll("input[type='number']");
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        let index_ = Number(input.getAttribute("index"));
        if (index == index_) {
            let component = input.getAttribute("component");
            if (component == "x") {
                input.value = velocity.x;
            } else if (component == "y") {
                input.value = velocity.y;
            }
        }
    }

}