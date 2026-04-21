const minWidth = 800;
const minHeight = 600;

var data;
var reader_data;
var current_reader_idx;
var readerPrinting = false;
var last_char_pos;

var about_content;
var pebbles = [];
var lang = "en";

const main = document.querySelector("#p5");
const title = document.querySelector("#title");
const reader_container = document.querySelector("#reader-container");
const reader = document.querySelector("#reader");
const reader_content = document.querySelector("#reader-content");
reader.style.display = "none";
const banner = document.querySelector("#banner");
const menu_title_text = document.querySelector("#menu-title-text");
const about_btn = document.querySelector("#about-btn");
const back_btn = document.querySelector("#back-btn");
const rd_container = document.getElementById("raindrop-container");

const menu_title_text_en = "Diaries of Crocodiles: Lesbian Novels in Chinese";
const back_btn_en = "&lt;&lt;&nbsp;&nbsp;Back";
const about_btn_en = "About";

const menu_title_text_cn = "鳄鱼的手记：中文女同小说";
const back_btn_cn = "&lt;&lt;&nbsp;&nbsp;返回";
const about_btn_cn = "关于";

let p_reader_exc;

let hovering = false;
let focusMode = false;
let focusIdx = -1;
let msg = [];

const years = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025, 2030];
const regions = ["ML", "TW", "HK"];

let idleShader;
let p5Layer;

const IDLE_THRESHOLD_S = 5; // seconds of idle time before the shader effect starts
let lastActivityTime;
let lastMouseX, lastMouseY;
let clickMouseX = 0, clickMouseY = 0;
let clickTime = -999; 

let pmvel;

let inkdots = [];

function preload() {
    
    data = loadJSON('./public/contents/data.json');    
    reader_data = loadJSON('./public/contents/reader.json');   
    
    idleShader = loadShader('./script/idle.vert', './script/idle.frag');

}

function setup() {
    // frameRate(30);
    focusMode = false;

    let w = windowWidth > minWidth ? windowWidth : minWidth;
    let h = main.getBoundingClientRect().height > minHeight ? main.getBoundingClientRect().height : minHeight;
    createCanvas(w, h, WEBGL);

    // Off-screen graphics layer where your actual scene is drawn (no WEBGL - just 2D)
    p5Layer = createGraphics(w, h);

    works = data.works;
    about_content = data.about;
    // about = data.about;

    let banner_height = banner.getBoundingClientRect().height;
    reader_container.style.height = `calc(100% - ${banner_height}px)`;
    reader_container.style.top = `${banner_height}px`;

    reader_container.style.pointerEvents = "none";

    menu_title_text.innerHTML = lang === "en" ? menu_title_text_en : menu_title_text_cn;
    about_btn.innerHTML = lang === "en" ? about_btn_en : about_btn_cn;
    back_btn.innerHTML = lang === "en" ? back_btn_en : back_btn_cn;

    if(works && works.length > 0) {
        for (let i = 0; i < works.length; i++) {
            const p = new Pebble (i);
            pebbles.push(p);
        }
    }

    lastActivityTime = millis();
    lastMouseX = p5Layer.width/2;
    lastMouseY = p5Layer.height/2;

    pmvel = createVector(0,0);

    

    document.addEventListener('scroll', e => recordActivity(e));
    document.addEventListener('keydown', e => recordActivity(e));
    document.addEventListener('click', e => {
        recordActivity(e);
        let obj = pointedObject(mouseX, mouseY);
        if (obj !== null) {
            console.log(`Clicked on object with index ${obj.idx}`);
            loadContent(obj.idx);
        }
    });
    document.addEventListener('mousedown', e => {
        recordActivity(e);
        let banner_height = banner.getBoundingClientRect().height;
        clickMouseX = e.clientX;
        clickMouseY = e.clientY - banner_height;
        clickTime = millis() / 1000;
    });
    document.addEventListener('mouseup', e => {
        clickTime = -999;
        recordActivity(e);
    });
    document.addEventListener('mousemove', e => {
        recordActivity(e);

        // calculate mouse velocity 
        if (focusMode) {
            let mousespeed = dist(mouseX, mouseY, pmouseX, pmouseY);
            let cpos = createVector(mouseX, mouseY);
            let ppos = createVector(pmouseX, pmouseY);
            let mvel = cpos.sub(ppos);
            
            let macc = mvel.sub(pmvel);
            
            if (macc.mag() > 40 && mvel.mag() > pmvel.mag() || mvel.mag() > 60) {
                console.log("splash");
                splashSketch(macc, mvel, pmvel, mousespeed, p5Layer);
            }
            
        } else {
            let obj = pointedObject(mouseX, mouseY);
            showLabel(obj);
        }
    });

}

function draw() {
    
    // 1. Draw your scene into the off-screen 2D layer
    drawScene(p5Layer);

    // 2. Compute idle time
    const rawIdleS = (millis() - lastActivityTime) / 1000;
    const idlePastS = max(0, rawIdleS - IDLE_THRESHOLD_S);
    let timeSinceClick = -999;
    if (clickTime >= 0) {
        timeSinceClick = millis() / 1000 - clickTime;
    }
    
    // 3. Pass the layer as a texture + all uniforms to the shader
    shader(idleShader);
    idleShader.setUniform('u_tex', p5Layer);
    idleShader.setUniform('u_idle',  idlePastS);
    idleShader.setUniform('u_mouse', [lastMouseX, lastMouseY]);
    idleShader.setUniform('u_res',   [width, height]);
    idleShader.setUniform('u_time',  millis() / 1000);
    idleShader.setUniform('u_clickPos', [clickMouseX, clickMouseY]);
    idleShader.setUniform('u_clickAge', timeSinceClick);
    
    // 4. Draw the full-screen rect that the shader runs on
    // let banner_height = banner.getBoundingClientRect().height;
    // rect(0, 0, width, height);
    noStroke();
    // plane(width, height);
    rect(0, 0, width, height);
   
}

function drawScene(g) {
    g.push();

    clear();
    g.background(248);

    // generate pebbles
    if (focusMode) {
        if(focusIdx >= 0) {
            pebbles[focusIdx].drawFocus(g);
            reader_container.style.pointerEvents = "auto";
            // loadContent(focusIdx);
        } else {
            // loadContent(focusIdx);
        } 
        drawInkDots(g);
    } else {
        drawPebbles(g);
        drawCoordinates(g);
        reader_container.style.pointerEvents = "none";
        
    }

    g.pop();
}

function recordActivity(e) {
    let banner_height = banner.getBoundingClientRect().height;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY - banner_height;
    lastActivityTime = millis();

}

function drawCoordinates(g) {
    g.push();

    // set space
    let padding = 30;
    let tickLength = 5;
    let labelOffset = 5;

    let w = g.width;
    let h = g.height;

    // reset drop shadow
    // g.drawingContext.shadowOffsetX = 0;
    // g.drawingContext.shadowOffsetY = 0;
    // g.drawingContext.shadowBlur = 0;

    // draw axes and labels
    g.stroke(0);
    g.strokeWeight(1);
    g.line(padding, h - padding, w - padding, h - padding); // x-axis
    g.line(padding, padding, padding, h - padding); // y-axis
    g.textSize(10);
    g.fill(0);

    var year_u = (w - padding * 2) / ((years.length + 1) * 5); // segment unit of 1 year
    var region_u = (h - padding * 2) / regions.length; // segment unit of 1 region
    
    for (let i = 0; i < years.length; i += 1) {
        // draw tick marks
        g.stroke(0);
        g.strokeWeight(1);
        g.line(padding + (i + 1) * 5 * year_u, h - padding, padding + (i + 1) * 5 * year_u, h - padding - tickLength);
        // draw labels
        g.noStroke();
        g.text(years[i],padding + (i + 1) * 5 * year_u - 10, h - 17);
    }
    
    for (let j = 0; j < regions.length; j += 1) {
        // draw tick marks
        g.stroke(0);
        g.strokeWeight(1);
        g.line(padding, padding + (j + 0.5) * region_u, padding + tickLength, padding + (j + 0.5) * region_u);
        // draw labels
        g.noStroke();
        g.text(regions[j], 10, padding + (j + 0.5) * region_u + 4);
    }

    // draw crosshair
    g.stroke(150);
    g.strokeWeight(1);
    dashedLine(g, mouseX, padding, mouseX, h - padding);
    dashedLine(g, padding, mouseY, w - padding, mouseY);
    // g.line(mouseX, padding, mouseX, height - padding);
    // g.line(padding, mouseY, width - padding, mouseY);

    // display mouse coordinates
    // calculate values
    let xVal = floor(((mouseX + year_u / 2 - padding) / year_u) + 1985);
    let yIdx = floor((mouseY - padding) / region_u);
    if (yIdx < 0) yIdx = 0;
    if (yIdx >= regions.length) yIdx = regions.length - 1;
    let yVal = regions[yIdx];
    g.fill(150);
    g.noStroke();
    let p = pointedObject(mouseX, mouseY);
    if (p === null) {
        g.text(`(${xVal}, ${yVal})`, mouseX + 10, mouseY - 10);
    } else {
        let tt = (lang === "en" ? works[p.idx].title.en : works[p.idx].title.cn) + ', ';
        g.text(`(${tt}${works[p.idx].pubyear}, ${works[p.idx].region})`, mouseX + 10, mouseY - 10);
    }
    
    
    
    g.pop();
}

function drawPebbles(g) {
    let w = g.width;
    let h = g.height;

    let padding = 30;
    var year_u = (w - padding * 2) / ((years.length + 1) * 5); // segment unit of 1 year
    var region_u = (h - padding * 2) / regions.length; // segment unit of 1 region

    // reset drop shadow
    // g.drawingContext.shadowOffsetX = 0;
    // g.drawingContext.shadowOffsetY = 0;
    // g.drawingContext.shadowBlur = 0;
    // g.drawingContext.shadowColor = 'rgba(0, 0, 0, 0)';

        for (let i = 0; i < pebbles.length; i++) {
            let p = pebbles[i];
            let x = (works[i].pubyear - 1985) * year_u + padding;
            x = min(x, w - _pu - 60);
            x = max(x, _pu + 60);
            let y = (regions.indexOf(works[i].region) + 0.5) * region_u + padding + (i - 6) * 10;
            y = min(y, h - _pu - 60);
            y = max(y, _pu + 60);

            let banner_height = banner.getBoundingClientRect().height;

            p.draw(g, x, y);

            // g.fill(255);
            // g.stroke(1);
            // g.strokeWeight(1);
            // g.rectMode(CENTER);
            // g.ellipse(x, y, 80 * 1.2,  80 * 1.2);
        }
    
}

function drawInkDots(g) {
    for (let d of inkdots) {
        d.draw(g);
    }
}

function windowResized() {
    let w = windowWidth > minWidth ? windowWidth : minWidth;
    let h = main.getBoundingClientRect().height > minHeight ? main.getBoundingClientRect().height : minHeight;
    resizeCanvas(w, h);

    p5Layer.resizeCanvas(w, h);
    
    let banner_height = banner.getBoundingClientRect().height;
    reader_container.style.height = `calc(100% - ${banner_height}px)`;
    reader_container.style.top = `${banner_height}px`;
}

function pointedObject(mx, my) {
    let object = null;
    if (!focusMode) {
        for (let i = pebbles.length - 1; i >= 0; i--) {
            let p = pebbles[i];
            if (p.hovered(p5Layer)) {
                hovering = true;
                object = p;
                break;
            } 
        }
        if (object === null) {
            hovering = false;
        }
    } 
    return object;
}

function showLabel(p) {
    if (p !== null) {
        
        document.body.style.cursor = "pointer";

        let font = lang === "en" ? "lector" : "zhuzi-mincho";
        let titleText = lang === "en" ? works[p.idx].title.en : works[p.idx].title.cn;
        title.innerHTML = `<p class="${font}">${titleText}</p>`;

    } 
    else {
        document.body.style.cursor = "none";
        title.innerHTML = `<p></p>`;
        document.body.style.cursor = "default";
    }
}

function loadContent(i) {
    console.log(works[i]);
    document.body.style.cursor = "auto";

    if (i >= 0) {
        focusMode = true;
        focusIdx = i;
        
        // r_idx.innerHTML = `<p>${j}</p>`;
        
        let html = parseContent(works[i].content);
        reader_content.innerHTML = `${html}`;

        const rawIdleS = (millis() - lastActivityTime) / 1000;
        const idlePastS = max(0, rawIdleS - IDLE_THRESHOLD_S);

        let font = lang === "en" ? "lector" : "zhuzi-mincho";
        let titleText = lang === "en" ? works[i].title.en : works[i].title.cn;
        let authorText = lang === "en" ? works[i].author.en : works[i].author.cn;
        let regionText = lang === "en" ? works[i].publoc.en : works[i].publoc.cn;
        title.innerHTML = `
            <p class="${font}">${titleText}</p>
            <p class="font-size-2 ${font}">${authorText}</p>
            <p class="font-size-2 ${font}">${regionText}, ${works[i].pubyear}</p>`;
            
        about_btn.style.display = "inline-block";
        back_btn.style.display = "inline-block";

        reader_content.classList.add(`${font}`);

        reader_container.style.pointerEvents = "auto";
    } 
    else if (i === -2) {
        let html = parseContent(about_content);
        reader_content.innerHTML = `${html}`;

        let font = lang === "en" ? "lector" : "zhuzi-mincho";
        let titleText = lang === "en" ? "About" : "关于";
        title.innerHTML = `<p class="${font}">${titleText}</p>`;

        reader_content.classList.add(`${font}`);
        // reader_content.classList.add("content-text-1");
        
        about_btn.style.display = "none";
        back_btn.style.display = "inline-block";

        reader.style.display = "block";
        

        reader_container.style.pointerEvents = "auto";
    }
        
    reader.style.display = "block";

    let ccds = document.querySelectorAll(".ccd");
    ccds.forEach(ccd => {
        ccd.addEventListener("mouseover", e => {
            console.log("ccd");
            ccd.innerHTML = "🐊";
        });
    });

}

function parseContent(content) {
    let html = "";
    let font = lang === "en" ? "lector" : "zhuzi-mincho";

    for (let j = 0; j < content.length; j++) {
            let passage = lang === "en" ? content[j].en : content[j].cn;
            if (content[j].type === 1) {
                // just text
                html += `<p class="content-text-1 ${font}">${passage}</p>`;
            } else if (content[j].type === 2) {
                // quote
                html += `<p class="content-text-2 ${font}">"${passage}"</p>`;
            } else {
                // cite info
                html += `<p class="content-text-3 ${font}">${passage}</p>`;
            }
    }
    return html;
}

function loadHome() {
    focusMode = false;
    focusIdx = -1;

    reader.style.display = "none";
    reader_content.innerHTML = "";
    console.log("home");

    about_btn.style.display = "inline-block";
    back_btn.style.display = "none";

    reader_container.style.pointerEvents = "none";

    inkdots = [];
}

function loadAbout() {
    console.log("load about");
    focusMode = true;
    focusIdx = -2;

    loadContent(-2);

    reader_container.style.pointerEvents = "auto";

    inkdots = [];
        
}

function toggleLang(l) {
    if (l === "en") {
        lang = "en";
        
        loadContent(focusIdx);

        document.getElementById("toggle-cn").classList.remove("selected");
        document.getElementById("toggle-en").classList.add("selected");

        menu_title_text.innerHTML = menu_title_text_en;
        menu_title_text.classList.add("lector");
        menu_title_text.classList.remove("zhuzi-mincho");

        about_btn.innerHTML = about_btn_en;
        about_btn.classList.add("lector");
        about_btn.classList.remove("zhuzi-mincho");

        back_btn.innerHTML = back_btn_en;
        back_btn.classList.add("lector");
        back_btn.classList.remove("zhuzi-mincho")
    } else {
        lang = "cn";

        loadContent(focusIdx);

        document.getElementById("toggle-en").classList.remove("selected");
        document.getElementById("toggle-cn").classList.add("selected");

        menu_title_text.innerHTML = menu_title_text_cn;
        menu_title_text.classList.add("zhuzi-mincho");
        menu_title_text.classList.remove("lector");

        about_btn.innerHTML = about_btn_cn;
        about_btn.classList.add("zhuzi-mincho");
        about_btn.classList.remove("lector");

        back_btn.innerHTML = back_btn_cn;
        back_btn.classList.add("zhuzi-mincho");
        back_btn.classList.remove("lector")
    }
}

function dashedLine(g, x1, y1, x2, y2, dash = 3, gap = 4) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let dist = sqrt(dx*dx + dy*dy);

  let steps = dist / (dash + gap);
  let vx = dx / dist;
  let vy = dy / dist;

  for (let i = 0; i < steps; i++) {
    let start = i * (dash + gap);
    let end = start + dash;

    g.line(
      x1 + vx * start,
      y1 + vy * start,
      x1 + vx * end,
      y1 + vy * end,
    );
  }
}
