function splashSketch(macc, mvel, pmvel, mousespeed, g) {
    if (macc.mag() > 40 && mvel.mag() > pmvel.mag()) {
        
        let p1 = new Pebble(random(100), mouseX + mvel.x * 3.3, mouseY + mvel.y * 3.3, mousespeed * 0.003 * random(0.8, 1.2));
        let p2 = new Pebble(random(100), mouseX + mvel.x * 2.7, mouseY + mvel.y * 2.7, mousespeed * 0.003 * random(0.8, 1.2));
        let p3 = new Pebble(random(100), mouseX + mvel.x * 2.1, mouseY + mvel.y * 2.1, mousespeed * 0.002 * random(0.8, 1.2));
        inkdots.push(p1);
        inkdots.push(p2);
        inkdots.push(p3);
        // g.noStroke();
        // g.fill(10);
        // g.ellipse(mouseX + mvel.x * 2.2, mouseY + mvel.y * 2.2, mousespeed/8);
        // g.ellipse(mouseX + mvel.x * 1.8, mouseY + mvel.y * 1.8, mousespeed/8);
        // g.ellipse(mouseX + mvel.x * 1.4, mouseY + mvel.y * 1.4, mousespeed/12);
        for (let i in range(3)) {
            let p = new Pebble(random(100), mouseX + mvel.x * random(2.1, 2.8), mouseY + mvel.y * random(1.6, 3.8), mousespeed * 0.0015 * random(0.8, 1.2));
            // console.log(`pebble: (${p.x}, ${p.y}), scale: ${p.scale}`);
            inkdots.push(p);

        }
    } else if (mvel.mag() > 60) {
        
        let p1 = new Pebble(random(100), mouseX + mvel.x * 3.3, mouseY + mvel.y * 3.3, mousespeed * 0.003 * random(0.8, 1.2));
        let p2 = new Pebble(random(100), mouseX + mvel.x * 2.7, mouseY + mvel.y * 2.7, mousespeed * 0.003 * random(0.8, 1.2));
        let p3 = new Pebble(random(100), mouseX + mvel.x * 2.1, mouseY + mvel.y * 2.1, mousespeed * 0.002 * random(0.8, 1.2));
        inkdots.push(p1);
        inkdots.push(p2);
        inkdots.push(p3);
    }
}

// Custom range implementation
function range(start, end, step = 1) {
  if (end === undefined) { [end, start] = [start, 0]; }
  let arr = [];
  for (let i = start; i < end; i += step) arr.push(i);
  return arr;
}