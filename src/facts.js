import en from './locales/en';
import sv from './locales/sv';
import fi from './locales/fi';

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'sv', label: 'SV', name: 'Svenska' },
  { code: 'fi', label: 'FI', name: 'Suomi' }
];

export const CATEGORIES = ['all', 'history', 'engineering', 'inFlight', 'records'];

// Category of each fact, in the order the facts appear in every locale file
const FACT_CATEGORIES = [
  'history',
  'history',
  'history',
  'engineering',
  'engineering',
  'engineering',
  'engineering',
  'inFlight',
  'inFlight',
  'inFlight',
  'inFlight',
  'inFlight',
  'inFlight',
  'records',
  'records',
  'records',
  'records',
  'records'
];

// Swedish and Finnish group thousands with a space; keep those numbers on one line
const keepNumbers = text => text.replace(/(\d) (?=\d{3})/g, '$1 ');

function build(locale) {
  return {
    ...locale,
    ui: { ...locale.ui, title: locale.ui.title.map(keepNumbers) },
    facts: locale.facts.map((fact, i) => ({
      id: String(i + 1).padStart(2, '0'),
      category: FACT_CATEGORIES[i],
      title: keepNumbers(fact.title),
      body: keepNumbers(fact.body)
    }))
  };
}

export const LOCALES = { en: build(en), sv: build(sv), fi: build(fi) };
