// types of graphics
//     "rain",
    // "curve",
    // "line",
    // "swirl",
    // "pause",
    // "sprinkle",
    // "snow",
    // "hash"
    // "zigzag"

function drawGraphics(idx) {
    switch (idx) {
        case 0: // journal of a crocodile
            sprinkle("rain");
            sprinkle("curve");
            sprinkle("line");
            break;
        case 1:  // last words from montmartre
            sprinkle("swirl");
            sprinkle("zigzag");
            break;
        case 2: // white snake
            sprinkle("pause");
            sprinkle("snow");
            break;
        case 3: // book of evil women
            sprinkle("hash");
            break;
        case 4: // kids on the bridge
            sprinkle("line");
            sprinkle("swirl");
            break;
        case 5: // she is a woman, and so am I
            sprinkle("zigzag");
            sprinkle("curve");
            break;
        case 6: // sorekara
            sprinkle("pause");
            sprinkle("snow");
            break;
        case 7: // zou shi nv
            sprinkle("hash");
            break;
        case 8: // sinking snow
            sprinkle("line");
            sprinkle("swirl");
            break;
        case 9: // chair in the corridor
            sprinkle("zigzag");
            sprinkle("curve");
            break;
        default:
            break;
    }
}