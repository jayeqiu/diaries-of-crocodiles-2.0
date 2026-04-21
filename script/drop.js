

class Drop {
    constructor(baseX, baseY, text, targetX, targetY) {
        this.baseX = baseX;
        this.baseY = baseY;
        this.text = text;
        this.targetX = targetX;
        this.targetY = targetY;
    }

    draw(idx) {
        const el = document.createElement("span");
            el.className = "char";
            el.textContent = this.text;

            // start position
            el.style.left = this.baseX + "px";
            el.style.top = this.baseY + "px";

            // delay
            el.style.transitionDelay = idx * 0.4 + "s";

            rd_container.appendChild(el);

            // animate
            requestAnimationFrame(() => {
                el.classList.add("drop");

                el.style.transform = `translate(${this.targetX - this.baseX}px, ${this.targetY - this.baseY}px)`;
                // console.log(`drop ${idx}: sX = ${floor(this.baseX)} sY = ${floor(this.baseY)} tX = ${floor(this.targetX)} tY = ${floor(this.targetY)} dist = ${floor(this.targetY - this.baseY)}`);
                // console.log(`drop ${idx}: transformX = ${floor(this.targetX - this.baseX)} transformY = ${floor(this.targetY - this.baseY)}`);
            });

            // after animate
            setTimeout(() => {
                el.style.opacity = 0;
            }, 16000);

            setTimeout(() => {
                el.remove();
            }, 30000);
    }
}

