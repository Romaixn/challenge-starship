varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vec3 transformedNormal = normalMatrix * mat3(instanceMatrix) * normal;

    vNormal = normalize(transformedNormal);
    vViewPosition = -mvPosition.xyz;
    vUv = uv;

    gl_Position = projectionMatrix * mvPosition;
}