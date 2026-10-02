/**
 * The visitor's objection to analytics (Art. 21 GDPR), remembered in
 * localStorage so the site can honour it on later visits. Storing it is
 * strictly necessary for that (§ 25 Abs. 2 Nr. 2 TDDDG); it holds no
 * personal data and never leaves the browser.
 *
 * Every read is wrapped: storage can be blocked (private mode, browser
 * settings), and then the visitor simply counts as not opted out for this
 * page — the switch shows the real state it could read.
 */
export const OPT_OUT_KEY = 'analytics-opt-out';
export const OPT_OUT_EVENT = 'analytics-opt-out-change';

export function isOptedOut(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

/** Saves the choice and tells every listener on the page (tracker, other switches). Returns false if storage is blocked. */
export function setOptedOut(optedOut: boolean): boolean {
  let saved = true;
  try {
    if (optedOut) window.localStorage.setItem(OPT_OUT_KEY, '1');
    else window.localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    saved = false;
  }
  window.dispatchEvent(new CustomEvent(OPT_OUT_EVENT, { detail: optedOut }));
  return saved;
}

/** Do Not Track or Global Privacy Control: the browser already objects for the visitor. */
export function browserSignalsOptOut(nav: Navigator = navigator): boolean {
  const n = nav as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack === '1' || n.globalPrivacyControl === true;
}
