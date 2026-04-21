class Rain {
    constructor(baseX, baseY, text) {
        console.log(text);
        let drops = [];

        var startX = baseX - 50;
        var startY = baseY - 40;

        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            // console.log(`char ${i}: ${char}`);

            const targetX = startX;
            const targetY = startY + 60 + random(-5, 5);
            let dist = targetY - startY;

            const drop = new Drop (startX, startY, char, targetX, targetY);
            drops.push(drop);

            // console.log(`drop ${i}: sX = ${floor(startX)} sY = ${floor(startY)} tX = ${floor(targetX)} tY = ${floor(targetY)}`);

            startX = targetX + random(-1, 1);
            startY = targetY - dist * 0.7;
        }

        console.log(drops);

        this.drops = drops;
    }

    play() {
        this.drops.forEach((drop, i) => {
            drop.draw(i);
            
        })
    }
}