/**
 * The operator's legal identity, shared by the imprint (§ 5 DDG) and the
 * privacy policy (Art. 13 GDPR controller). Both pages must name the same
 * person, address and email, so they read it from here.
 */
export const LEGAL_CONTACT = {
  name: 'Velimir Müller',
  careOf: 'c/o RYSE Group GmbH',
  street: 'Wildenbruchstraße 69',
  city: '12045 Berlin',
  country: 'Deutschland',
  email: 'velimir.mueller@googlemail.com',
} as const;

/** Competent supervisory authority for a controller based in Berlin (Art. 77 GDPR). */
export const SUPERVISORY_AUTHORITY = {
  name: 'Berliner Beauftragte für Datenschutz und Informationsfreiheit',
  street: 'Alt-Moabit 59–61',
  city: '10555 Berlin',
  url: 'https://www.datenschutz-berlin.de',
} as const;
