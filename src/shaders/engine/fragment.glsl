uniform sampler2D particleTexture;
uniform vec3 engineColor;
uniform float engineIntensity;

varying float vLifetime;
varying float vAlpha;

void main() {
    vec4 texColor = texture2D(particleTexture, gl_PointCoord);

    // Create core and outer glow colors
    vec3 coreColor = engineColor * engineIntensity * 2.0;
    vec3 glowColor = mix(coreColor, vec3(0.5, 0.7, 1.0), 0.5) * engineIntensity;

    // Mix colors based on particle lifetime
    vec3 finalColor = mix(coreColor, glowColor, vLifetime);

    gl_FragColor = vec4(finalColor, vAlpha * texColor.a);
}