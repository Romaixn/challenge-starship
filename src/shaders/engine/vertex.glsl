attribute vec3 velocity;
attribute float lifetime;

uniform float time;
uniform float particleSize;

varying float vLifetime;
varying float vAlpha;

void main() {
    vLifetime = lifetime;

    // Update position based on velocity and time
    vec3 pos = position + velocity * mod(time + lifetime * 1.0, 1.0);

    // Calculate distance-based size and alpha
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(mvPosition.xyz);

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = particleSize * 40.0 / dist;

    // Fade based on lifetime and distance
    vAlpha = smoothstep(1.0, 0.0, length(pos.y) / 8.0) *
    smoothstep(0.0, 0.3, mod(time + lifetime, 1.0));
}