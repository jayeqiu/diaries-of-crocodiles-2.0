let texts = ["你", "好", "世", "界", "!", "P", "5"];
let rains = [];
let rd_container = document.getElementById("raindrop-container");
console.log(rd_container);

function printWords(mx, my, reader_idx) {
  let baseX = mx;
  let baseY = my;

  let rain = new Rain(mx, my, texts);
  rain.play();
}