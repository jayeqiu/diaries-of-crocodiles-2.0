precision mediump float;

varying vec2 pos;  // was v_uv

uniform sampler2D u_tex;
uniform float u_idle;
uniform vec2  u_mouse;
uniform vec2  u_res;
uniform float u_time;

uniform vec2  u_clickPos;
uniform float u_clickAge;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(){
  vec4 col = texture2D(u_tex, pos);
  
  
  vec2 pixelPos = pos * u_res;
  vec2 mousePos  = vec2(u_mouse.x, u_mouse.y);
  float dist    = length(pixelPos - mousePos);
  vec2  dir        = (pixelPos - mousePos) / max(dist, 1.0);
  float spreadRadius = u_idle * 30.0; // the main spread speed. Higher = radius grows faster per idle second. At u_idle = 5s, radius is 150px. Change this one first.
  float distFactor   = pow(exp(-dist * 3.0 / max(spreadRadius, 1.0)), 2.0);
  // dist * 3.0 First factor: the falloff steepness. Higher = sharper edge, slower apparent spread even if radius is large. Lower = softer, blooms faster visually.
  // pow(..., 2.0) contrast between near/far. Higher power = crisper boundary.
  
  
  
  /* ripple pattern when mouse pressed
  */
  if (u_clickAge > 0.0) {
    float d         = length(pixelPos - u_clickPos);

    // Wave Front 
    float waveFront = u_clickAge * 2.;
  float waveWidth = 6.5 + u_clickAge * 4.0; 
  float envelope  = exp(-pow(d - waveFront, 2.0) / (2.0 * waveWidth * waveWidth));
  float decay = exp(-u_clickAge * 0.12);   // very slow fade

  float strength  = envelope * decay;

  float rWave = sin(d * 0.1 - exp(u_clickAge * 0.4 + 0.7) * 11.1);
  float gWave = sin(d * 0.1 - exp(u_clickAge * 0.4 + 0.7) * 11.12);
  float bWave = sin(d * 0.1 - exp(u_clickAge * 0.4 + 0.7) * 11.13);
    
    vec3 blend = vec3(rWave, gWave, bWave);
    vec3 shifted = col.rgb * mix(vec3(1.0), blend, strength * 0.2);
  gl_FragColor = vec4(clamp(shifted, 0.0, 1.0), col.a);
    return;
  }
  

  if(u_idle <= 30.0){
    gl_FragColor = col;
    return;
  }
  
  
  
  /* 
   * displacement line glitch
   *
   * Quantize the y coordinate into bands of N pixels
   * Scanline displacement
   * Every Nth row of pixels shifts horizontally by a sine wave. Classic CRT glitch feel.
   */
//   float rowIndex    = floor(pos.y * u_res.y);        // which absolute pixel row
// float cyclePos    = mod(rowIndex, 40.0);            // position within the 40-row cycle [0..39]
// float inActiveRow = step(0.0, cyclePos) - step(3.0, cyclePos) + mod(floor(sin(rowIndex) * 19.), 5.) * 0.1;  // 1.0 for rows 0–9, 0.0 for rows 10–39

// float band  = floor(rowIndex / 40.0);              // which cycle we're in (for varied shift per band)
//   float displaceIdleStrength = smoothstep(0.0, 5.0, u_idle * .012);
//   float displaceShift     = sin(band * 2.3) * displaceIdleStrength * 0.1;
  
//   vec2 displaced = vec2(pos.x + displaceShift * inActiveRow, pos.y);
//   col       = texture2D(u_tex, displaced);
  
  
  
  
  
  /* displacement ripple glitch
   * A travelling sine wave in UV space creates expanding rings of displacement — pixels along wave crests shift outward, troughs shift inward. 
   */
//   float ring       = sin(dist * 0.08 - u_idle * 3.0);   // travelling ring wave

//   float displaceIdleStrength = smoothstep(0.0, 5.0, u_idle * .2);
// float pushAmount = ring * distFactor * displaceIdleStrength * 0.01;
// vec2  displaced  = pos + dir * pushAmount;
// col        = texture2D(u_tex, displaced);
  
  
  
  
  /* push displacement
  * a pseudo-random discontinuous displacement that grows over time and pushes pixels along the direction from click to pixel:
  */
  
  float gridSize = 4.; // size of discontinuous blocks
  vec2 cell = floor(pixelPos/gridSize); // which block this pixel is in
  float seed = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453); // random per block
  
  // A second hash for a second independent random value per block
float seed2    = fract(sin(dot(cell, vec2(269.5, 183.3))) * 12345.6789);

// Displacement magnitude grows with age, modulated by per-block random
  float growth = 1.0 - exp(-u_idle * 0.05);   // starts at 0, approaches 1.0 over time
  // Only displace blocks whose seed clears a threshold — sparse, not every block moves
  float t          = clamp(u_idle / 30.0, 0.0, 1.0);   // normalize age to [0,1] over 30s
float curved     = pow(t, 3.0);                            // accelerates — slow start, fast end
float threshold  = mix(0.96, 0.60, curved);                // 0.96 → 0.80 (inverted: step filters above)

float active     = step(threshold, seed2);        // ~60% of blocks are active
  float reach    = u_idle * 4.0;
  float envelope = exp(-dist / max(reach, 1.0));  // full strength at click, falls off with distance

float magnitude = growth * (0.5 + seed) * 0.05 * active * envelope * (sin(u_idle * 0.4) * 0.1 + 0.1);

vec2 perp      = vec2(-dir.y, dir.x);                    // perpendicular to radial direction
float sway     = (seed - 0.5) * 0.4;                     // random lateral bias per block
vec2  displaced = pos + (-dir + perp * sway) * magnitude;

  
  col        = texture2D(u_tex, displaced);
  
  

  /* 
   * patterns after user idle for a period of time
   *
   */
  float idleStrength = smoothstep(0.0, 90.0, u_idle);

  // float radialPos = (dist * 7.6) * pow(u_idle * 0.2, 0.1);            // spatial frequency of the rings
  // float radialPos = (dist * 2.6) * smoothstep(0.0, 5.0, u_idle);
  float radialPos = dist * 2.6;
  // radioposkonkong j空间pipin l频率，越小波纹越大
  float waveFront = u_idle * 0.4;           // how fast the wave front travels outward
  
  float noise = rand(pos + floor(u_time * 0.5)) * 0.4;
  
// Slow breathing on top to give it the "pooling" feel
  float breathe = sin(u_time * 0.4);
  

  // Each channel is a travelling wave radiating from the mouse,
  // with slightly different frequencies so they separate like LCD pressure
  float rWave = sin(pow(radialPos * 1.1, 2.) * 0.40 + noise - waveFront * 0.98) * (0.5 + sin(u_time * 0.6 + 0.4) * 0.5);
  float gWave = sin(pow(radialPos * 0.9, 1.09) + noise - waveFront * 1.) * (0.7 + 0.3 * sin(u_time * 0.8 + 0.2));
  float bWave = sin(pow(radialPos * 1.1, 1.) + noise - waveFront * 1.) * (1.2 + 0.4 * sin(u_time * 0.8 + 0.2));


  

    // float strength = distFactor * 1. * idleStrength * u_idle * 0.02 * breathe;
float strength = distFactor * idleStrength * u_idle * 0.1;
  
  
// apply as multiply
  // vec3 shifted = col.rgb + vec3(rWave, gWave, bWave) * strength;
  // gl_FragColor = vec4(clamp(shifted, 0.0, 1.0), col.a); 
  
  // apply as difference
  // vec3 blendColor = vec3(rWave, gWave, bWave);
// vec3 shifted    = abs(col.rgb - blendColor * strength);
// gl_FragColor    = vec4(shifted, col.a);

// apply as screen
// vec3 blendColor = vec3(rWave, gWave, bWave);
// vec3 screened = 1.0 - (1.0 - col.rgb) * (1.0 - blendColor * strength);
// gl_FragColor = vec4(screened, col.a);

// apply with mixed effect
vec3 blendColor = vec3(rWave, gWave, bWave);
  vec3 shifted = (1.0 - (1.0 - col.rgb) * (1.0 - blendColor * strength)) * 0.8 + col.rgb + vec3(rWave, gWave, bWave) * strength * 0.2;
  gl_FragColor = vec4(shifted, col.a);
  
  // gl_FragColor = vec4(255.,255.,255.,col.a);
}