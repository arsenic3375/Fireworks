let canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");

function background(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    sum(b) {
        return new Point(this.x+b.x, this.y+b.y);
    }
}

class Vector extends Point{
    constructor(x, y) {
        super(x, y);
    }

    magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y)); 
    }

    scalar(s) {
        return new Vector(this.x*s, this.y*s);
    }

    sum(v) {
        return new Vector(this.x+v.x, this.y+v.y);
    }
}

class Smoke {
    constructor(position, radius, color, lifespan) {
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.lifespan = lifespan;
        this.age = 0;
    }

    update() {
        this.age += 1;

        this.draw();
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * (1 - this.age/this.lifespan), 0, Math.PI * 2, true);
        ctx.fillStyle = this.color;
        ctx.fill(); 
        ctx.closePath();
    }
}

class Particle {
    constructor(id, position, radius, color, lifespan, length) {
        this.id = id;
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.lifespan = lifespan;
        this.age = 0;

        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);

        this.length = length
        this.trail = []
    }

    update(acceleration) {
        this.age += 1;

        this.trail.push(new Smoke(this.position, this.radius * (1 - this.age/this.lifespan), this.color, this.length));

        if(this.trail.length >= this.length) {
            this.trail.shift();
        }

        this.acceleration = acceleration;
        this.velocity = this.velocity.sum(this.acceleration);
        this.position = this.position.sum(this.velocity);

        this.draw();
        this.trail.forEach((smoke) => {smoke.update()})
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * (1 - this.age/this.lifespan), 0, Math.PI * 2, true);
        ctx.fillStyle = this.color;
        ctx.fill(); 
        ctx.closePath();
    }
}

class Firework {
    constructor(position, speed, amount, color) {
        this.position = position
        this.speed = speed
        this.amount = amount;
        this.color = color;

        this.particles = [];
        for(let i = 0; i < this.amount; i++) {
            let angle = i*(2*Math.PI)/amount;
            let velocity = new Vector(Math.cos(angle), Math.sin(angle)).scalar(this.speed);
            let particle = new Particle(i, this.position, 5, this.color, 100, 10)
            particle.velocity = velocity;
            this.particles.push(particle);
        }
    }

    update() {
        this.particles.forEach(particle => {
            particle.update(new Vector(0, 0.1));
        });

        this.particles = this.particles.filter(particle => (particle.age < particle.lifespan));
    }
}

let fireworks = [];

let mouse = new Point(0, 0);

document.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

document.addEventListener("click", (event) => {
    fireworks.push(new Firework(mouse, 5, 20, "red"));

});

function update() {
    background("rgb(0, 0, 0)");
    fireworks.forEach(firework => {
        firework.update();
    });

    fireworks = fireworks.filter(firework => (firework.particles.length > 0))
    requestAnimationFrame(update);
}

update();