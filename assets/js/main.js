/* ==========================================================================
   main.js — Md. Sadbin Hossain portfolio
   Plain JavaScript, no dependencies, no build step. Everything here is
   progressive enhancement: the page is complete and readable without it.

   1. Helpers        5. Window focus (gradient border)   9. ResQRoute demo
   2. Toast & copy   6. Reveal on scroll                10. GitHub stars
   3. Theme          7. Keyboard shortcuts
   4. Clock & bar    8. Terminal
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- 1. Helpers ---------- */
  const root = document.documentElement;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* ---------- 6. Reveal on scroll ----------
     Runs first: if anything later fails, content must still become visible. */
  if (root.classList.contains('reveal') && hasIO && motionOK()) {
    const revealer = new IntersectionObserver((entries) => {
      entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left))
        .forEach((en, i) => {
          en.target.style.setProperty('--d', `${Math.min(i, 6) * 70}ms`);
          en.target.classList.add('in');
          revealer.unobserve(en.target);
        });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    $$('.reveal').forEach((el) => revealer.observe(el));
  } else {
    root.classList.remove('reveal');
  }
  window.__s4d = true; // tells the inline failsafe in <head> that reveal is handled

  const safely = (name, fn) => {
    try { fn(); } catch (err) { console.error(`[s4d] ${name} failed:`, err); }
  };

  const EMAIL = '23-55187-3@student.aiub.edu';
  const LINKS = {
    github: 'https://github.com/Sadbin47',
    linkedin: 'https://www.linkedin.com/in/sadbin-hossain-471692353/',
    email: `mailto:${EMAIL}`,
    cv: 'CV.pdf',
  };
  const SECTIONS = $$('main > section[id]').map((s) => s.id);

  const store = {
    get(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); } catch { /* storage unavailable */ } },
  };

  function goTo(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'start' });
    target.focus({ preventScroll: true });
    const url = id === 'home' ? location.pathname + location.search : `#${id}`;
    history.replaceState(null, '', url);
  }

  /* ---------- 2. Toast & copy ---------- */
  const toastEl = $('#toast');
  let toastTimer = 0;

  function toast(title, body = '') {
    if (!toastEl) return;
    const t = document.createElement('strong');
    t.textContent = title;
    toastEl.replaceChildren(t);
    if (body) {
      const b = document.createElement('span');
      b.textContent = body;
      toastEl.append(b);
    }
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const ok = await copyText(btn.dataset.copy);
    if (ok) toast('Copied to clipboard', btn.dataset.copyLabel || btn.dataset.copy);
    else toast('Could not copy', 'Select the text and copy it manually.');
  });

  /* ---------- 3. Theme (Catppuccin Mocha ⇄ Latte) ---------- */
  const themeBtn = $('#theme-toggle');
  const THEME_KEY = 's4d-theme';
  const themeName = (t) => (t === 'latte' ? 'Latte' : 'Mocha');

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) store.set(THEME_KEY, theme);
    const next = theme === 'latte' ? 'Mocha (dark)' : 'Latte (light)';
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', `Switch to ${next} theme`);
      themeBtn.title = `Switch to ${next}`;
    }
    $$('[data-theme-label]').forEach((el) => { el.textContent = `Catppuccin ${themeName(theme)}`; });
    $$('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', theme === 'latte' ? '#dce0e8' : '#11111b'));
  }

  function setTheme(theme, origin) {
    const swap = () => applyTheme(theme, true);
    if (!document.startViewTransition || !motionOK()) { swap(); return; }
    const x = origin ? origin.x : window.innerWidth - 32;
    const y = origin ? origin.y : 32;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const vt = document.startViewTransition(swap);
    vt.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    }).catch(() => { /* transition skipped */ });
  }

  function centreOf(el) {
    if (!el) return undefined;
    const r = el.getBoundingClientRect();
    if (!r.width) return undefined;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function toggleTheme(fromEl) {
    const next = root.getAttribute('data-theme') === 'latte' ? 'mocha' : 'latte';
    setTheme(next, centreOf(fromEl) || centreOf(themeBtn));
    return next;
  }

  applyTheme(root.getAttribute('data-theme') === 'latte' ? 'latte' : 'mocha', false);
  themeBtn?.addEventListener('click', () => {
    const t = toggleTheme(themeBtn);
    toast(`Theme: Catppuccin ${themeName(t)}`);
  });
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action="toggle-theme"]');
    if (trigger) toggleTheme(trigger);
  });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change', (e) => {
    if (!store.get(THEME_KEY)) applyTheme(e.matches ? 'latte' : 'mocha', false);
  });

  /* ---------- 4. Clock, workspaces and window title ---------- */
  const clockEl = $('#clock');
  const localTimeEl = $('#local-time');
  const fmtBar = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const fmtTime = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

  function tick() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = fmtBar.format(now).replace(',', '');
      clockEl.dateTime = now.toISOString();
    }
    if (localTimeEl) localTimeEl.textContent = `UTC+6 · ${fmtTime.format(now)} local time`;
  }
  tick();
  setTimeout(() => { tick(); setInterval(tick, 60_000); }, 60_000 - (Date.now() % 60_000));

  const wsLinks = $$('.ws a');
  const barTitle = $('#bar-title');
  let activeId = 'home';

  wsLinks.forEach((a, i) => {
    const label = $('.ws__label', a)?.textContent || a.hash.slice(1);
    a.title = `${label} — press ${i + 1}`;
  });

  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    wsLinks.forEach((a) => {
      if (a.hash === `#${id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    const section = document.getElementById(id);
    if (barTitle && section) {
      barTitle.textContent = section.dataset.title || `~/${id}`;
      const wrap = barTitle.parentElement;
      wrap.classList.remove('is-swapping');
      void wrap.offsetWidth; // restart the CSS animation
      wrap.classList.add('is-swapping');
    }
  }

  if (hasIO) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    SECTIONS.forEach((id) => spy.observe(document.getElementById(id)));
  }

  /* ---------- 5. Window focus: one focused tile at a time, like Hyprland ---------- */
  let focusedWin = null;

  function focusWin(win) {
    if (!win || win === focusedWin) return;
    focusedWin?.classList.remove('is-focused');
    focusedWin = win;
    win.classList.add('is-focused');
  }

  // focus follows mouse…
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    focusWin(e.target.closest?.('[data-window]'));
  });
  document.addEventListener('focusin', (e) => focusWin(e.target.closest?.('[data-window]')));

  // …and on touch screens, the tile crossing the middle of the viewport gets focus.
  if (hasIO && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const centre = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) focusWin(en.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    $$('[data-window]').forEach((w) => centre.observe(w));
  }
  focusWin($('.term-win'));

  /* ---------- 7. Keyboard shortcuts: 1–6 workspaces · / terminal · T theme ---------- */
  const termInput = $('#term-input');

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;

    if (/^[1-6]$/.test(e.key)) {
      const id = SECTIONS[Number(e.key) - 1];
      if (id) { e.preventDefault(); goTo(id); }
    } else if (e.key === '/') {
      e.preventDefault();
      $('.term-win')?.scrollIntoView({ behavior: motionOK() ? 'smooth' : 'auto', block: 'center' });
      termInput?.focus({ preventScroll: true });
    } else if (e.key === 't' || e.key === 'T') {
      const t = toggleTheme(themeBtn);
      toast(`Theme: Catppuccin ${themeName(t)}`);
    }
  });

  /* ---------- 8. Terminal ---------- */
  const term = $('#term');
  const out = $('#term-out');
  const form = $('#term-form');
  if (term && out && form && termInput) safely('terminal', initTerminal);

  function initTerminal() {
    const ff = $('#ff');
    const firstLine = $('.term__line', term);
    const past = [];
    let pastIndex = 0;

    const node = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };
    const row = (parts = [], kind = '') => {
      const r = node('div', kind ? `term__row term__row--${kind}` : 'term__row');
      (Array.isArray(parts) ? parts : [parts]).forEach((p) => r.append(p instanceof Node ? p : document.createTextNode(String(p))));
      out.append(r);
      return r;
    };
    const gap = () => out.append(node('div', 'term__gap'));
    const k = (text) => node('span', 'term__k', text);
    const dir = (text) => node('span', 'term__dir', text);
    const link = (href, text) => {
      const a = node('a', 'term__link', text);
      a.href = href;
      if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
      return a;
    };
    const echo = (cmd) => row([node('span', 'ps1', 'sadbin@s4d'), ' ', node('span', 'ps1__path', '~'), ' ', node('span', 'ps1__sym', '❯'), ` ${cmd}`]);

    function openTarget(name) {
      const key = (name || '').toLowerCase();
      if (key === 'email' || key === 'mail') {
        row(['Opening your mail client → ', link(LINKS.email, EMAIL)], 'ok');
        window.location.href = LINKS.email;
      } else if (key === 'cv') {
        commands.cv.run();
      } else if (LINKS[key]) {
        row(['Opening ', link(LINKS[key], LINKS[key]), ' …'], 'ok');
        window.open(LINKS[key], '_blank', 'noopener');
      } else {
        row(`open: unknown target '${name || ''}' — try github, linkedin, email or cv`, 'err');
      }
    }

    function clearScreen() {
      out.replaceChildren();
      if (ff) ff.hidden = true;
      if (firstLine) firstLine.hidden = true;
    }

    const commands = {
      help: {
        run() {
          [
            ['whoami', 'who I am, in one line'],
            ['ls', 'list sections'],
            ['cd <section>', 'jump to a section'],
            ['research', 'manuscripts and their status'],
            ['projects', 'things I have built'],
            ['contact', 'ways to reach me'],
            ['cv', 'download my CV (PDF)'],
            ['open <site>', 'github · linkedin · email'],
            ['theme <name>', 'mocha or latte'],
            ['fastfetch', 'system info'],
            ['clear', 'clear the screen'],
          ].forEach(([c, d]) => row([k(c.padEnd(14)), d]));
          row('↑/↓ history · Tab completes · Ctrl+L clears. There are a few easter eggs too.', 'muted');
        },
      },
      whoami: {
        run() {
          row('Md. Sadbin Hossain — CSE undergraduate and student researcher at AIUB, Dhaka.');
          row('Efficient, explainable deep learning for medical imaging; privacy-aware healthcare systems.', 'muted');
        },
      },
      ls: {
        run() {
          const items = ['about/', 'research/', 'projects/', 'stack/', 'contact/'];
          const parts = [];
          items.forEach((d) => parts.push(dir(d), '  '));
          parts.push('CV.pdf');
          row(parts);
        },
      },
      cd: {
        run([arg = '~']) {
          const clean = arg.replace(/^~\/?/, '').replace(/\/+$/, '').toLowerCase();
          if (clean === '' || clean === '/' || clean === 'home') { row('→ ~', 'muted'); goTo('home'); return; }
          if (clean === '..') { row('cd: already at the top of ~', 'muted'); return; }
          if (SECTIONS.includes(clean)) { row(`→ ~/${clean}`, 'muted'); goTo(clean); return; }
          row(`bash: cd: ${arg}: No such file or directory`, 'err');
        },
      },
      research: {
        run() {
          [
            ['[review]  ', 'Chest X-ray classification under cross-dataset shift — ICCIT 2026'],
            ['[internal]', 'Explainable diabetic foot ulcer classification via knowledge distillation'],
            ['[internal]', 'Post-quantum hybrid EHR sharing: ML-KEM + ECC + blockchain'],
            ['[draft]   ', 'Federated learning for healthcare/AI (working title)'],
          ].forEach(([s, t]) => row([k(s), ' ', t]));
          row(['Details: ', k('cd research')], 'muted');
        },
      },
      projects: {
        run() {
          [
            ['ResQRoute   ', 'offline flood-evacuation routing for Android'],
            ['s4darc      ', 'interactive Arch Linux installer'],
            ['s4dbox      ', 'seedbox manager with a Bash TUI'],
            ['s4d_hyprland', 'minimal Hyprland setup for Arch'],
            ['s4dutil     ', 'one menu for the whole toolkit'],
            ['+ coursework', 'pharmacy & travel systems, JerseyTrack, OpenGL animation'],
          ].forEach(([n, d]) => row([k(n), '  ', d]));
          row(['Details: ', k('cd projects')], 'muted');
        },
      },
      contact: {
        run() {
          row(['email     ', link(LINKS.email, EMAIL)]);
          row(['linkedin  ', link(LINKS.linkedin, 'in/sadbin-hossain')]);
          row(['github    ', link(LINKS.github, '@Sadbin47')]);
          row('discord   @im_too_sad');
        },
      },
      cv: {
        run() {
          const a = document.createElement('a');
          a.href = LINKS.cv;
          a.download = 'Md-Sadbin-Hossain-CV.pdf';
          document.body.append(a);
          a.click();
          a.remove();
          row('Downloading Md-Sadbin-Hossain-CV.pdf …', 'ok');
        },
      },
      open: { run([target]) { openTarget(target); } },
      github: { run() { openTarget('github'); } },
      linkedin: { run() { openTarget('linkedin'); } },
      email: { run() { openTarget('email'); } },
      theme: {
        run([name]) {
          const wanted = (name || '').toLowerCase();
          let next;
          if (wanted === 'mocha' || wanted === 'latte') { next = wanted; setTheme(next, centreOf(themeBtn)); }
          else if (!wanted) { next = toggleTheme(themeBtn); }
          else { row(`theme: unknown theme '${name}' — try mocha or latte`, 'err'); return; }
          row(`Theme set to Catppuccin ${themeName(next)}`, 'ok');
        },
      },
      fastfetch: {
        run() {
          out.replaceChildren();
          if (firstLine) firstLine.hidden = false;
          if (ff) ff.hidden = false;
          term.scrollTop = 0;
        },
      },
      clear: { run() { clearScreen(); } },
      date: {
        run() {
          const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'full', timeStyle: 'short' });
          row(`${f.format(new Date())} (Dhaka, UTC+6)`);
        },
      },
      echo: { run(args) { row(args.join(' ')); } },
      history: { run() { past.forEach((c, i) => row(`${String(i + 1).padStart(4)}  ${c}`)); } },

      /* easter eggs — not listed in help */
      sudo: {
        hidden: true,
        run(args) {
          const rest = args.join(' ').toLowerCase();
          if (/^hire[- ]?me$/.test(rest)) {
            row('[sudo] password for recruiter: ••••••••', 'muted');
            row('Access granted. Opening ~/contact …', 'ok');
            setTimeout(() => goTo('contact'), 700);
          } else if (rest.startsWith('rm')) {
            commands.rm.run(args.slice(1));
          } else {
            row('sadbin is not in the sudoers file. This incident will be reported.', 'err');
          }
        },
      },
      rm: {
        hidden: true,
        run(args) {
          if (args.some((a) => a.startsWith('-') && a.includes('r'))) row("rm: refusing to remove '/': it's a static site, there is nothing to break.", 'warn');
          else row('rm: missing operand', 'err');
        },
      },
      pacman: { hidden: true, run() { row('error: you cannot perform this operation unless you are root.', 'err'); } },
      git: {
        hidden: true,
        run(args) {
          const rest = args.join(' ');
          if (rest === 'reset --hard') {
            row('HEAD is now at 3.67/4.00 “Someday, it will happen.”', 'ok');
            setTimeout(() => goTo('home'), 600);
          } else if (rest === 'status') {
            row("On branch main. Your portfolio is up to date with 'origin/main'.");
          } else {
            row("git: try 'git status' or 'git reset --hard'", 'muted');
          }
        },
      },
      vim: { hidden: true, run() { row("You'd never find the way out. (Hint: :q doesn't work on websites either.)", 'muted'); } },
      exit: { hidden: true, run() { row("logout… just kidding. There's no escaping ~ — try 'contact' instead.", 'muted'); } },
      motto: { hidden: true, run() { row('“Someday, it will happen.”', 'ok'); } },
      hello: { hidden: true, run() { row("Hey! Type 'help' to look around."); } },
    };
    commands.neofetch = commands.fastfetch;
    commands.nvim = commands.vim;
    commands.vi = commands.vim;
    commands.nano = commands.vim;
    commands.logout = commands.exit;
    commands.hi = commands.hello;

    const visible = Object.keys(commands).filter((name) => !commands[name].hidden && !['neofetch'].includes(name));

    function suggest(name) {
      const dist = (a, b) => {
        const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
        for (let j = 1; j <= b.length; j++) d[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
          }
        }
        return d[a.length][b.length];
      };
      let best = null;
      let bestD = 3;
      visible.forEach((c) => { const v = dist(name, c); if (v < bestD) { bestD = v; best = c; } });
      return best;
    }

    function run(line) {
      const [name, ...args] = line.split(/\s+/);
      const cmd = commands[name.toLowerCase()];
      if (cmd) { cmd.run(args, line); return; }
      row(`bash: ${name}: command not found`, 'err');
      const guess = suggest(name.toLowerCase());
      row(guess ? ['Did you mean ', k(guess), '? Type ', k('help'), ' for everything.'] : ['Type ', k('help'), ' to see what you can do.'], 'muted');
    }

    function completions(value) {
      const parts = value.replace(/^\s+/, '').split(/\s+/);
      if (parts.length === 1) return visible.filter((c) => c.startsWith(parts[0].toLowerCase()));
      const [cmd, arg = ''] = parts;
      const pool = { cd: SECTIONS, open: ['github', 'linkedin', 'email', 'cv'], theme: ['mocha', 'latte'] }[cmd] || [];
      return pool.filter((p) => p.startsWith(arg.toLowerCase())).map((p) => `${cmd} ${p}`);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = termInput.value;
      const line = raw.trim();
      termInput.value = '';
      echo(raw);
      if (line) past.push(line);
      pastIndex = past.length;
      if (line) run(line);
      while (out.childElementCount > 200) out.firstElementChild.remove();
      term.scrollTop = term.scrollHeight;
    });

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        if (!past.length) return;
        e.preventDefault();
        pastIndex = Math.max(0, pastIndex - 1);
        termInput.value = past[pastIndex] || '';
      } else if (e.key === 'ArrowDown') {
        if (!past.length) return;
        e.preventDefault();
        pastIndex = Math.min(past.length, pastIndex + 1);
        termInput.value = past[pastIndex] || '';
      } else if (e.key === 'Tab' && !e.shiftKey && termInput.value.trim()) {
        // Only complete when there is something typed, so Tab still moves focus otherwise.
        e.preventDefault();
        const matches = completions(termInput.value);
        if (matches.length === 1) {
          termInput.value = ['cd', 'open', 'theme'].includes(matches[0]) ? `${matches[0]} ` : matches[0];
        } else if (matches.length > 1) {
          echo(termInput.value);
          row(matches.join('   '), 'muted');
          let prefix = matches[0];
          matches.forEach((m) => { while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1); });
          if (prefix.length > termInput.value.length) termInput.value = prefix;
          term.scrollTop = term.scrollHeight;
        }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        clearScreen();
      } else if (e.key === 'Escape') {
        termInput.blur();
      }
    });

    // Clicking anywhere in the terminal focuses the prompt (unless selecting text or clicking a link).
    term.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input')) return;
      if (String(window.getSelection?.() || '')) return;
      termInput.focus({ preventScroll: true });
    });
  }

  /* ---------- 9. ResQRoute: a tiny flood-aware A* you can play with ---------- */
  const mapHost = $('#map');
  if (mapHost) safely('ResQRoute demo', () => initMap(mapHost));

  function initMap(host) {
    const NS = 'http://www.w3.org/2000/svg';
    const statusEl = $('#map-status');
    const floodBtn = $('#map-flood');
    const resetBtn = $('#map-reset');

    // A hand-drawn toy road network (viewBox units). Node 0 is "you"; 12 and 13 are shelters.
    const nodes = [
      [44, 296], [112, 272], [84, 206], [170, 226], [148, 142], [236, 164], [206, 76], [300, 104], [262, 246],
      [334, 190], [356, 282], [414, 146], [408, 56], [440, 252], [58, 122], [118, 58], [306, 312], [196, 304],
    ];
    const edges = [
      [0, 1], [0, 2], [1, 3], [1, 17], [2, 3], [2, 4], [2, 14], [14, 4], [14, 15], [15, 6], [4, 5], [4, 6], [3, 5], [3, 8], [17, 8],
      [17, 16], [5, 7], [5, 9], [6, 7], [7, 12], [7, 11], [8, 9], [8, 16], [9, 11], [9, 10], [16, 10], [10, 13], [11, 13], [11, 12],
    ];
    const START = 0;
    const SHELTERS = new Map([[12, 'A'], [13, 'B']]);
    const METRES_PER_UNIT = 5;
    const WET_COST = 2.5; // a waterlogged road is still usable, just "longer"

    const state = edges.map(() => 0); // 0 clear · 1 waterlogged · 2 blocked
    const adj = nodes.map(() => []);
    edges.forEach(([a, b], i) => { adj[a].push([b, i]); adj[b].push([a, i]); });
    const edgeIndex = new Map(edges.map(([a, b], i) => [`${Math.min(a, b)}-${Math.max(a, b)}`, i]));
    const len = (a, b) => Math.hypot(nodes[a][0] - nodes[b][0], nodes[a][1] - nodes[b][1]);
    const heuristic = (n) => Math.min(...[...SHELTERS.keys()].map((s) => len(n, s)));

    function astar() {
      const g = new Map([[START, 0]]);
      const f = new Map([[START, heuristic(START)]]);
      const came = new Map();
      const open = new Set([START]);
      while (open.size) {
        let cur = -1;
        let best = Infinity;
        open.forEach((n) => { const v = f.get(n); if (v < best) { best = v; cur = n; } });
        if (SHELTERS.has(cur)) {
          const path = [cur];
          while (came.has(path[0])) path.unshift(came.get(path[0]));
          return path;
        }
        open.delete(cur);
        for (const [next, ei] of adj[cur]) {
          if (state[ei] === 2) continue; // blocked roads are not part of the search
          const cost = g.get(cur) + len(cur, next) * (state[ei] === 1 ? WET_COST : 1);
          if (cost < (g.has(next) ? g.get(next) : Infinity)) {
            came.set(next, cur);
            g.set(next, cost);
            f.set(next, cost + heuristic(next));
            open.add(next);
          }
        }
      }
      return null;
    }

    const make = (tag, attrs = {}, parent) => {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([key, v]) => el.setAttribute(key, String(v)));
      if (parent) parent.append(el);
      return el;
    };

    const svg = make('svg', { viewBox: '0 0 480 340', role: 'img', 'aria-labelledby': 'map-title map-desc', focusable: 'false' });
    make('title', { id: 'map-title' }, svg).textContent = 'ResQRoute routing demo';
    make('desc', { id: 'map-desc' }, svg).textContent = 'A small road network with your location at the bottom left and two shelters on the right. The safest passable route is highlighted; the status line below describes it.';

    const defs = make('defs', {}, svg);
    const pattern = make('pattern', { id: 'map-grid', width: 24, height: 24, patternUnits: 'userSpaceOnUse' }, defs);
    make('path', { d: 'M24 0H0V24', class: 'map__grid' }, pattern);
    make('rect', { width: 480, height: 340, fill: 'url(#map-grid)' }, svg);
    make('path', {
      class: 'map__water',
      d: 'M-10 166C70 150 120 192 200 188S330 212 380 222 450 210 490 228V262C440 246 400 258 370 254S260 228 196 220 80 186-10 200Z',
    }, svg);

    const segLayer = make('g', {}, svg);
    const segs = edges.map(([a, b], i) => {
      const [x1, y1] = nodes[a];
      const [x2, y2] = nodes[b];
      const g = make('g', { class: 'map__seg', 'data-i': i }, segLayer);
      make('line', { class: 'map__road', x1, y1, x2, y2 }, g);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      make('path', { class: 'map__x', d: `M${mx - 5} ${my - 5}L${mx + 5} ${my + 5}M${mx + 5} ${my - 5}L${mx - 5} ${my + 5}` }, g);
      make('line', { class: 'map__hit', x1, y1, x2, y2 }, g);
      return g;
    });

    const glow = make('path', { class: 'map__route-glow', d: '' }, svg);
    const route = make('path', { class: 'map__route', d: '', pathLength: 1 }, svg);

    nodes.forEach(([x, y], i) => {
      if (i !== START && !SHELTERS.has(i)) make('circle', { class: 'map__node', cx: x, cy: y, r: 3.2 }, svg);
    });

    const shelterEls = new Map();
    SHELTERS.forEach((label, i) => {
      const [x, y] = nodes[i];
      const g = make('g', { class: 'map__shelter' }, svg);
      make('rect', { x: x - 11, y: y - 11, width: 22, height: 22, rx: 6 }, g);
      make('text', { x, y: y + 0.5 }, g).textContent = label;
      const text = make('text', { class: 'map__label', x, y: i === 12 ? y - 20 : y + 28, 'text-anchor': 'middle' }, svg);
      text.textContent = `Shelter ${label}`;
      shelterEls.set(i, g);
    });

    const [sx, sy] = nodes[START];
    make('circle', { class: 'map__you-ring', cx: sx, cy: sy, r: 7 }, svg);
    make('circle', { class: 'map__you', cx: sx, cy: sy, r: 6.5 }, svg);
    make('text', { class: 'map__label', x: sx - 4, y: sy + 28, 'text-anchor': 'middle' }, svg).textContent = 'You';

    host.append(svg);

    let routeEdges = [];

    function setStatus(kind, text) {
      if (!statusEl) return;
      statusEl.dataset.state = kind;
      statusEl.textContent = text;
    }

    function draw(animate) {
      if (!animate || !motionOK()) return;
      route.classList.remove('is-drawing');
      void route.getBoundingClientRect(); // restart the CSS animation
      route.classList.add('is-drawing');
    }

    function update(animate = true) {
      segs.forEach((g, i) => {
        g.classList.toggle('is-wet', state[i] === 1);
        g.classList.toggle('is-blocked', state[i] === 2);
      });
      const path = astar();
      shelterEls.forEach((el, id) => el.classList.toggle('is-target', !!path && path[path.length - 1] === id));
      if (!path) {
        route.setAttribute('d', '');
        glow.setAttribute('d', '');
        routeEdges = [];
        setStatus('none', 'No passable route. Stay on high ground and wait for rescue.');
        if (floodBtn) floodBtn.disabled = true;
        return;
      }
      if (floodBtn) floodBtn.disabled = false;
      const d = path.map((n, i) => `${i ? 'L' : 'M'}${nodes[n][0]} ${nodes[n][1]}`).join('');
      route.setAttribute('d', d);
      glow.setAttribute('d', d);
      draw(animate);

      routeEdges = path.slice(1).map((n, i) => edgeIndex.get(`${Math.min(n, path[i])}-${Math.max(n, path[i])}`));
      const metres = path.slice(1).reduce((sum, n, i) => sum + len(path[i], n), 0) * METRES_PER_UNIT;
      const wet = routeEdges.filter((i) => state[i] === 1).length;
      const shelter = SHELTERS.get(path[path.length - 1]);
      setStatus('ok', `Route → Shelter ${shelter} · ${(metres / 1000).toFixed(1)} km · ${routeEdges.length} roads${wet ? ` · ${wet} waterlogged` : ''}`);
    }

    svg.addEventListener('click', (e) => {
      const seg = e.target.closest('.map__seg');
      if (!seg) return;
      const i = Number(seg.dataset.i);
      state[i] = (state[i] + 1) % 3;
      update();
    });

    floodBtn?.addEventListener('click', () => {
      if (!routeEdges.length) return;
      const i = routeEdges[Math.floor(Math.random() * routeEdges.length)];
      state[i] = Math.min(2, state[i] + 1); // clear → waterlogged → blocked
      update();
    });

    resetBtn?.addEventListener('click', () => {
      state.fill(0);
      update();
    });

    update(false);

    // Draw the first route when the map scrolls into view.
    if (hasIO && motionOK()) {
      route.style.strokeDashoffset = '1';
      const seen = new IntersectionObserver((entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        route.style.strokeDashoffset = '';
        draw(true);
        seen.disconnect();
      }, { threshold: 0.35 });
      seen.observe(host);
    }
  }

  /* ---------- 10. Live GitHub star counts (falls back to the numbers in the HTML) ---------- */
  async function refreshStars() {
    const targets = $$('[data-stars]');
    if (!targets.length) return;
    const KEY = 's4d-stars';
    let stars = null;
    try { stars = JSON.parse(window.sessionStorage.getItem(KEY) || 'null'); } catch { stars = null; }
    if (!stars) {
      try {
        const res = await fetch('https://api.github.com/users/Sadbin47/repos?per_page=100', { headers: { Accept: 'application/vnd.github+json' } });
        if (!res.ok) return;
        const repos = await res.json();
        if (!Array.isArray(repos)) return;
        stars = {};
        repos.forEach((r) => { stars[String(r.name).toLowerCase()] = r.stargazers_count; });
        try { window.sessionStorage.setItem(KEY, JSON.stringify(stars)); } catch { /* storage unavailable */ }
      } catch {
        return; // offline or rate-limited: keep the baked-in numbers
      }
    }
    targets.forEach((el) => {
      const n = stars[el.dataset.stars.toLowerCase()];
      if (Number.isFinite(n)) el.textContent = String(n);
    });
  }
  (window.requestIdleCallback || ((fn) => setTimeout(fn, 1500)))(() => { refreshStars(); });

  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
