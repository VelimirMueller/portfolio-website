import { describeClickTarget } from '../describeClickTarget';

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body;
}

describe('describeClickTarget', () => {
  it('prefers data-track on the element or an ancestor', () => {
    mount('<a href="/de/contact" data-track="hero:contact"><span id="inner">Kontakt</span></a>');
    expect(describeClickTarget(document.getElementById('inner'))).toBe('hero:contact');
  });

  it('labels internal links by path and external links by host', () => {
    mount('<a id="in" href="/de/about?x=1">About</a><a id="out" href="https://www.github.com/VelimirMueller">GH</a>');
    expect(describeClickTarget(document.getElementById('in'))).toBe('link:/de/about');
    expect(describeClickTarget(document.getElementById('out'))).toBe('link:github.com');
  });

  it('collapses mailto and tel links and ignores in-page anchors', () => {
    mount('<a id="m" href="mailto:a@b.c">m</a><a id="t" href="tel:+49">t</a><a id="h" href="#top">h</a><a id="n">n</a>');
    expect(describeClickTarget(document.getElementById('m'))).toBe('link:mailto');
    expect(describeClickTarget(document.getElementById('t'))).toBe('link:tel');
    expect(describeClickTarget(document.getElementById('h'))).toBeNull();
    expect(describeClickTarget(document.getElementById('n'))).toBeNull();
  });

  it('labels buttons by accessible name, aria-label first', () => {
    mount('<button id="a" aria-label="Open menu"><svg></svg></button><button id="b">  Send\n message </button><div role="button" id="c"></div>');
    expect(describeClickTarget(document.getElementById('a'))).toBe('button:Open menu');
    expect(describeClickTarget(document.getElementById('b'))).toBe('button:Send message');
    expect(describeClickTarget(document.getElementById('c'))).toBeNull();
  });

  it('never reads form fields or plain content', () => {
    mount('<form><input id="i" value="secret@mail.test"><textarea id="t">private</textarea></form><p id="p">text</p>');
    expect(describeClickTarget(document.getElementById('i'))).toBeNull();
    expect(describeClickTarget(document.getElementById('t'))).toBeNull();
    expect(describeClickTarget(document.getElementById('p'))).toBeNull();
    expect(describeClickTarget(null)).toBeNull();
  });

  it('caps long labels', () => {
    mount(`<button id="b">${'x'.repeat(200)}</button>`);
    expect(describeClickTarget(document.getElementById('b'))).toHaveLength('button:'.length + 80);
  });
});
