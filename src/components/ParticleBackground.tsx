import React from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const ParticleBackground = () => {
  const particlesInit = async (main: any) => {
    await loadFull(main);
  };
  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          color: { value: '#6C63FF' },
          links: { enable: false },
          move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, outModes: 'out' },
          number: { value: 40 },
          opacity: { value: 0.5 },
          shape: { type: 'circle' },
          size: { value: { min: 2, max: 6 } },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticleBackground;
