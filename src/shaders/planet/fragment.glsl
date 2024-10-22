varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D uPlanetTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;
uniform float uTimeAfterExplode;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    // Sun orientation
    float sunOrientation = dot(uSunDirection, normal);

    // Day/Night color
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 planetColor = texture(uPlanetTexture, vUv).rgb;
    float darknessFactor = 0.02;
    vec3 nightColor = planetColor * darknessFactor;
    color = mix(nightColor, planetColor, dayMix);

    // Fresnel
    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel, 2.0);

    // Atmosphere
    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
    color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

    // Specular
    vec3 reflection = reflect(- uSunDirection, normal);
    float specular = - dot(reflection, viewDirection);
    specular = max(specular, 0.0);
    specular = pow(specular, 32.0 - uTimeAfterExplode);
    specular *= planetColor.b;
    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    color += specular * specularColor;

    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
