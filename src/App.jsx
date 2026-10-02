import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Backdrop from './Backdrop';
import ScrollReveal from './ScrollReveal';
import { CATEGORIES, LANGUAGES, LOCALES } from './facts';

// Shared by every fact's title and body. The reveal starts as soon as the text enters and is
// done by the time it clears the bottom third of the viewport; clamp() lets the last facts finish at the end of the
// page. A numeric scrub makes the animation trail the scroll position instead of tracking it rigidly.
const REVEAL = {
  baseOpacity: 0,
  enableBlur: true,
  baseRotation: 5,
  blurStrength: 10,
  rotationEnd: 'clamp(bottom 68%)',
  wordAnimationStart: 'top 96%',
  wordAnimationEnd: 'clamp(bottom 68%)',
  scrub: 0.8
};

const LANGUAGE_KEY = 'fl350-language';

function storedLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved in LOCALES) return saved;
  } catch {}
  return 'en';
}

export default function App() {
  const [language, setLanguage] = useState(storedLanguage);
  const [category, setCategory] = useState('all');
  const { ui, categories, stats, facts: allFacts } = LOCALES[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = ui.docTitle;
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {}
  }, [language, ui.docTitle]);

  // Web fonts change line wrapping, so scroll positions are re-measured once they are in
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && ScrollTrigger.refresh());
    return () => {
      cancelled = true;
    };
  }, []);

  // Eases wheel scrolling toward its target instead of jumping there. Lenis is driven from
  // GSAP's ticker so the scroll-linked reveals stay in step with it.
  useEffect(() => {
    // Lenis switches its smoothing off when the OS asks for reduced motion (Windows:
    // "Animation effects" off). This site is built around scroll motion, so it opts out of that.
    const lenis = new Lenis({ lerp: 0.07, anchors: true, respectReducedMotion: false });
    const raf = time => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  const facts = category === 'all' ? allFacts : allFacts.filter(fact => fact.category === category);

  return (
    <>
      <Backdrop />

      <div className="page">
        <header className="header">
          <a className="wordmark" href="#top">
            FL350
          </a>
          <div className="header-end">
            <nav className="nav" aria-label={ui.navLabel}>
              <a href="#numbers">{ui.navNumbers}</a>
              <a href="#facts">{ui.navFacts}</a>
            </nav>
            <div className="languages" role="group" aria-label={ui.languageLabel}>
              {LANGUAGES.map(({ code, label, name }) => (
                <button
                  key={code}
                  type="button"
                  className="language"
                  lang={code}
                  title={name}
                  aria-label={name}
                  aria-pressed={language === code}
                  onClick={() => setLanguage(code)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main id="top">
          <section className="hero">
            <p className="eyebrow">
              {ui.eyebrow} · 01–{allFacts.at(-1).id}
            </p>
            <h1>
              {ui.title.map(line => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="lede">{ui.lede}</p>
            <p className="hint">{ui.hint}</p>
          </section>

          <div className="sheet">
            <section id="numbers" className="section" aria-labelledby="numbers-title">
              <h2 id="numbers-title" className="eyebrow">
                {ui.navNumbers}
              </h2>
              <dl className="stats">
                {stats.map(stat => (
                  <div className="stat" key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>
                      {stat.value}
                      <span>{stat.unit}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="facts" className="section" aria-labelledby="facts-title">
              <div className="section-head">
                <h2 id="facts-title" className="eyebrow">
                  {ui.navFacts}
                </h2>
                <div className="filters" role="group" aria-label={ui.filterLabel}>
                  {CATEGORIES.map(key => (
                    <button
                      key={key}
                      type="button"
                      className="filter"
                      aria-pressed={category === key}
                      onClick={() => setCategory(key)}
                    >
                      {categories[key]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyed so every reveal is rebuilt and re-measured after filtering or switching language */}
              <ol className="facts" key={language + category}>
                {facts.map(fact => (
                  <li className="fact" key={fact.id}>
                    <span className="fact-id">{fact.id}</span>
                    <div>
                      <ScrollReveal as="h3" {...REVEAL}>
                        {fact.title}
                      </ScrollReveal>
                      <ScrollReveal as="p" {...REVEAL}>
                        {fact.body}
                      </ScrollReveal>
                    </div>
                    <span className="fact-tag">{categories[fact.category]}</span>
                  </li>
                ))}
              </ol>
            </section>

            <footer className="footer">
              <span>FL350</span>
              <span>{ui.footer}</span>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
}
