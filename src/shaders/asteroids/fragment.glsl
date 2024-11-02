varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

uniform vec3 sunDirection;

void main() {
    vec3 baseColor = vec3(0.077, 0.081, 0.089);

    float ambientStrength = 0.5;
    float diffuseStrength = 0.5;

    vec3 ambient = ambientStrength * baseColor;

    vec3 normal = normalize(vNormal);
    float diff = max(dot(normal, normalize(sunDirection)), 0.0);
    vec3 diffuse = diffuseStrength * diff * baseColor;

    float shadow = mix(0.5, 1.0, diff);

    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0) * 0.15;

    vec3 finalColor = ((ambient + diffuse) * shadow + fresnel * baseColor) * 0.8;

    gl_FragColor = vec4(finalColor, 1.0);
}