const _pu = 80;

class Pebble {
    constructor(idx, x = Pebble.rand(idx), y = Pebble.rand(idx + 1), s = 1.2) {
        // this.type = random(["rock", "paper", "scissors"]);
        this.type = "rock";
        this.rndX = Pebble.rand(idx) * 4 - 2;
        this.rndY = Pebble.rand(idx + 1) * 4 - 2;
        this.stretchX = Pebble.rand(idx + 2) * 1.1 + 0.2;
        this.stretchY = Pebble.rand(idx + 3) * 1.1 + 0.2;
        this.x = x;
        this.y = y;
        this.scale = s;
        // this.x1 = this.x + _pu * 2;
        // this.y1 = this.y - _pu * 2;
        this.idx = idx;
    }

    draw(g, x = this.x, y = this.y, s = this.scale) {
        g.push();

        this.x = x;
        this.y = y;
        // let x = this.x;
        // let y = this.y;
        g.fill(255);
        g.stroke(1);
        g.strokeWeight(1);
        g.rectMode(CENTER);
        switch (this.type) {
            case "rock":
                // rect(x, y, _pu * 2, _pu * 2);
                g.push();
                // Move to the center point first
                g.translate(x, y);
                
                // Apply skew via raw canvas transform
                // The skew matrix: [1, tan(skewY), tan(skewX), 1, 0, 0]
                let rotation = map(mouseX, 0, g.width, -0.17, 0.17);
                let skewX = map(mouseX, 0, g.width, -0.5, 0.5);
                let skewY = map(mouseY, 0, g.height, -0.5, 0.5);

                g.rotate(rotation);

                g.drawingContext.transform(
                    this.stretchX,                         // scale X
                    this.stretchY * Math.tan(skewY) * this.rndX,       // skewY scaled
                    this.stretchX * Math.tan(skewX) * this.rndY,       // skewX scaled
                    this.stretchY,                         // scale Y
                    0, 
                    Math.cos(mouseX / 110)
                );
                // g.scale(this.stretchX, this.stretchY);
                // g.applyMatrix(
                //     this.stretchX,                              // scaleX
                //     this.stretchY * tan(skewY) * this.rndX,     // skewY
                //     0,                                          // (z row, leave 0 for 2D-like transforms)
                //     this.stretchX * tan(skewX) * this.rndY,     // skewX
                //     this.stretchY,                              // scaleY
                //     0,
                //     0, 0, 1, 0,
                //     0, cos(mouseX / 110), 0, 1               // tx=0, ty=cos(mouseX/110)
                // );
                g.fill(50);
                // Draw ellipse at origin (since we already translated)
                g.ellipse(0, 0, _pu * s,  _pu * s);
                g.pop();
                break;
            case "paper":
                // rect(x, y, _pu * 2, _pu * 2);
                g.rect(x, y, _pu * s, _pu * s);
                
                break;
            case "scissors":
                // rect(x, y, _pu * 2, _pu * 2);
                g.triangle(x-_pu * s / 2, y+_pu * s / 2, x+_pu * s / 2, y+_pu * s / 2, x, y-_pu * s / 2);
                
                break;
        }
        
        g.pop();
    }

    static drawSplash(g, idx) {
        for (let i = 0; i < 20; i++) {
            let p = new Pebble(i);
            let x = Pebble.rand(idx + i) * g.width;
            let y = Pebble.rand(idx + i + i) * g.height;
            p.draw(g, x, y, Pebble.rand(idx + i + 2) * 0.5);
        }

    }

    static rand(seed) {
        const x = Math.sin(seed) * 43758.5453;
        return x - Math.floor(x);
    }

    drawFocus(g) {

        let x = (width - 60) / 4 + 30;
        let y = (height - 60) / 2 - 10;
        let s = 3.6;
        
        this.draw(g, x, y, 1.5);

        Pebble.drawSplash(g, this.idx);

    }

    hovered(mx, my) {
        return dist(mx, my, this.x, this.y) < _pu;
    }

    isMouseInSkewedEllipse(mx, my, x, y, w, h, skewX, skewY, stretchX, stretchY, rotation) {
        // Step 1: translate mouse to ellipse-centered space
        let dx = mx - x;
        let dy = my - y;

        // Step 2: undo rotation
        let cos = Math.cos(-rotation);
        let sin = Math.sin(-rotation);
        let rx = dx * cos - dy * sin;
        let ry = dx * sin + dy * cos;

        // Step 3: undo skew
        // forward skew was: x' = x + tan(skewX)*y,  y' = y + tan(skewY)*x
        // inverse:
        let tx = Math.tan(skewX);
        let ty = Math.tan(skewY);
        let denom = 1 - tx * ty;
        let ux = (rx - tx * ry) / denom;
        let uy = (ry - ty * rx) / denom;

        // Step 4: undo scale
        let sx = ux / stretchX;
        let sy = uy / stretchY;

        // Step 5: standard ellipse hit test
        let a = w / 2;
        let b = h / 2;
        return (sx * sx) / (a * a) + (sy * sy) / (b * b) <= 1;
        }
}