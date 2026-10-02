import { useEffect, useRef, useState } from 'react';
import Hyperspeed from './Hyperspeed';
import Lightfall from './Lightfall';

// Kept at module scope so the object identity is stable; Hyperspeed rebuilds
// its WebGL scene whenever effectOptions changes.
const HYPERSPEED_OPTIONS = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3
  }
};

// Same reason as above: Lightfall recreates its renderer when `colors` changes identity.
const LIGHTFALL_COLORS = ['#2F7BFF', '#7A2BFF', '#FF2FE6', '#00E0FF'];
const LIGHTFALL_DPR = Math.min(window.devicePixelRatio || 1, 2);

// Hyperspeed is laid out with the hero and scrolls off with it. Lightfall stays fixed
// behind the page and only fades in once the road has all but left the screen, which leaves a
// dark beat between the two. The fade runs between these fractions of the viewport height.
const FADE_START = 0.7;
const FADE_END = 1.45;

function scrollProgress() {
  const vh = window.innerHeight || 1;
  const t = (window.scrollY / vh - FADE_START) / (FADE_END - FADE_START);
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

export default function Backdrop() {
  const rootRef = useRef(null);
  const hyperspeedRef = useRef(null);
    // Each effect is only mounted while it can be seen, so a single WebGL scene
  // runs outside the transition.
  const [visible, setVisible] = useState(() => {
    return { hyperspeed: window.scrollY < window.innerHeight, lightfall: scrollProgress() > 0 };
  });

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const p = scrollProgress();
      rootRef.current.style.setProperty('--p', p.toFixed(4));
      setVisible(prev => {
        const hyperspeed = window.scrollY < hyperspeedRef.current.offsetHeight;
        const lightfall = p > 0;
        return prev.hyperspeed === hyperspeed && prev.lightfall === lightfall ? prev : { hyperspeed, lightfall };
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <>
      <div className="backdrop" ref={rootRef} aria-hidden="true">
        <div className="backdrop-lightfall">
          {visible.lightfall && (
            <Lightfall
              dpr={LIGHTFALL_DPR}
              colors={LIGHTFALL_COLORS}
              backgroundColor="#000000"
              speed={1}
              streakCount={2}
              streakWidth={1.3}
              streakLength={1}
              glow={1.25}
              density={0.4}
              twinkle={1}
              zoom={2}
              backgroundGlow={1}
              opacity={1}
              mouseInteraction={false}
            />
          )}
        </div>
      </div>
      <div className="backdrop-hyperspeed" ref={hyperspeedRef} aria-hidden="true">
        {visible.hyperspeed && <Hyperspeed effectOptions={HYPERSPEED_OPTIONS} />}
      </div>
    </>
  );
}
