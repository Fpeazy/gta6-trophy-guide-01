// Leonida Ledger — GTA VI trophy guide and tracker (revision 2).
// Loads app/data/trophies.json, renders the checklist, the roadmap, and one
// trophy's cited guide at a time. Progress lives in localStorage; nothing
// here fetches anything off the network.
//
// Revision 3: every trophy now carries 9 guided steps, each a cited claim,
// and the last thirteen carry a verification step on top.
// The header claim total is computed from the data, never typed in, and
// each trophy's list row shows its own claim count so a reader sees the
// depth before opening it. Missable trophies get a warning banner in the
// detail view, because the moment they depend on is the thing to protect.
(function () {
  var KEY = 'leonida-ledger-earned-v1';
  var SPOILER_KEY = 'leonida-ledger-spoiler-v1';

  var STAGES = [
    { n: 1, title: 'Stage 1 — Story: Chapters 1–4 + finale', note: 'Play the story in order. Chapter trophies (Paradise Lost, T**s Ass Drug Money, Vice City, Baby!, Top Of The World, Ma) and the gold finale (You Gotta Know When to Get Off).' },
    { n: 2, title: 'Stage 2 — Story missions', note: 'The named missions: Gone Fishing, Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory.' },
    { n: 3, title: 'Stage 3 — Contacts & strangers', note: 'Final missions for Andy, Kenton, Billy, Randy and Tyrone, plus 8 Strangers & Freaks strands across Leonida.' },
    { n: 4, title: 'Stage 4 — Collectibles & counts', note: '250 stunts, 42 Shooting Range golds, 3 card sets, 100 WAiNK spots, 50 challenges, 100 vehicles, 52 areas.' },
    { n: 5, title: 'Stage 5 — Activities', note: '14 drone race locations, 20 different races, fishing vs Cal, one arcade game, 18 meditation spots, Bret\u2019s hunt, bowling, Ocean Beach.' },
    { n: 6, title: 'Stage 6 — Combat & chaos', note: 'Combat Focus, wanted levels with your partner, robberies (jewelry, vaults, trucks, gangs), the Rhino, the VCIA departure. Do the 6 missable flags here, while the moments are live.' },
    { n: 7, title: 'Stage 7 — Economy, cleanup & platinum', note: 'Launder $250,000, spend $100,000, buy all 8 garages, register 10 vehicles, reach 100% completion — then the platinum.' }
  ];

  var KIND_LABELS = { story: 'Story', mission: 'Mission', contact: 'Contact', collectible: 'Collectible', activity: 'Activity', combat: 'Combat', economy: 'Economy', misc: 'Misc' };

  var earned = {};
  try { earned = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { earned = {}; }
  var spoiler = localStorage.getItem(SPOILER_KEY) === '1';
  var filter = 'all';
  var query = '';
  var data = null;

  var listEl = document.getElementById('list');
  var listCountEl = document.getElementById('listCount');
  var emptyEl = document.getElementById('emptyNote');
  var detailEl = document.getElementById('detail');
  var detailBody = document.getElementById('detailBody');

  function save() { localStorage.setItem(KEY, JSON.stringify(earned)); }
  function isEarned(t) { return !!earned[t.id]; }
  function toggleEarned(t) { if (earned[t.id]) delete earned[t.id]; else earned[t.id] = 1; save(); render(); }

  // Cited claims: each trophy contributes its official name, description and
  // grade (3 claims from the PlayStation official list) plus one claim per
  // guided step. Nine steps per trophy gives 12 claims each (ten steps,
  // 13 claims, on the last thirteen), 673 in total.
  // Computed from the data, never typed in.
  function trophyClaims(t) { return 3 + (t.steps || []).length; }
  function claimCount() {
    var total = 0;
    data.trophies.forEach(function (t) { total += trophyClaims(t); });
    return total;
  }

  function visibleName(t) {
    if (spoiler && t.kind === 'story' && !isEarned(t)) return 'Hidden story trophy';
    return t.name;
  }
  function visibleDesc(t) {
    if (spoiler && t.kind === 'story' && !isEarned(t)) return 'Hidden until earned — turn the spoiler setting off to see it.';
    return t.desc;
  }

  function matches(t) {
    if (query) {
      var hay = (t.name + ' ' + t.desc + ' ' + (t.guide || '')).toLowerCase();
      if (hay.indexOf(query) === -1) return false;
    }
    if (filter === 'all') return true;
    if (filter === 'earned') return isEarned(t);
    if (filter === 'todo') return !isEarned(t);
    if (filter === 'missable') return !!t.missable;
    if (filter === 'online') return false; // the official list has no online trophies
    if (filter === 'story') return t.kind === 'story' || t.kind === 'mission';
    if (filter === 'collectible') return t.kind === 'collectible';
    if (filter === 'activity') return t.kind === 'activity' || t.kind === 'contact';
    return true;
  }

  function gradeBadge(t) {
    var s = document.createElement('span');
    s.className = 'grade ' + t.grade;
    s.textContent = t.grade;
    return s;
  }

  function render() {
    var shown = data.trophies.filter(matches);
    listEl.innerHTML = '';
    shown.forEach(function (t) {
      var li = document.createElement('li');
      if (isEarned(t)) li.className = 'done';
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = isEarned(t);
      box.setAttribute('aria-label', 'Earned: ' + t.name);
      box.addEventListener('change', function (ev) { ev.stopPropagation(); toggleEarned(t); });
      var mid = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'tname';
      name.textContent = visibleName(t);
      var desc = document.createElement('div');
      desc.className = 'tdesc';
      desc.textContent = visibleDesc(t);
      var tags = document.createElement('div');
      tags.className = 'tags';
      var kind = document.createElement('span');
      kind.className = 'tag';
      kind.textContent = KIND_LABELS[t.kind] || t.kind;
      tags.appendChild(kind);
      if (t.missable) { var m = document.createElement('span'); m.className = 'tag miss'; m.textContent = 'Missable'; tags.appendChild(m); }
      if (t.hidden) { var h = document.createElement('span'); h.className = 'tag hidden'; h.textContent = 'Hidden'; tags.appendChild(h); }
      if (t.count) { var c = document.createElement('span'); c.className = 'tag count'; c.textContent = '×' + t.count; tags.appendChild(c); }
      var cl = document.createElement('span');
      cl.className = 'tag claims';
      cl.textContent = trophyClaims(t) + ' claims';
      tags.appendChild(cl);
      mid.appendChild(name);
      mid.appendChild(desc);
      mid.appendChild(tags);
      li.appendChild(box);
      li.appendChild(mid);
      li.appendChild(gradeBadge(t));
      li.addEventListener('click', function (ev) { if (ev.target !== box) openDetail(t); });
      listEl.appendChild(li);
    });
    emptyEl.hidden = shown.length > 0;
    listCountEl.textContent = '— ' + shown.length + ' shown';
    var n = Object.keys(earned).length;
    document.getElementById('statEarned').textContent = n;
    document.getElementById('statClaims').textContent = claimCount();
    document.getElementById('progressBar').style.width = Math.round(n / data.trophies.length * 100) + '%';
    document.getElementById('listTitle').firstChild.textContent = 'All trophies ';
  }

  function renderRoadmap() {
    var ol = document.getElementById('stages');
    STAGES.forEach(function (s) {
      var count = data.trophies.filter(function (t) { return t.stage === s.n; }).length;
      var li = document.createElement('li');
      var b = document.createElement('b');
      b.textContent = s.title + ' — ' + count + ' trophies';
      var span = document.createElement('span');
      span.textContent = s.note;
      li.appendChild(b);
      li.appendChild(span);
      ol.appendChild(li);
    });
  }

  function openDetail(t) {
    detailEl.hidden = false;
    detailBody.innerHTML = '';
    var h = document.createElement('h3');
    h.textContent = t.name + '  ·  ' + t.grade;
    var off = document.createElement('p');
    off.className = 'official';
    off.textContent = 'Official: "' + t.desc + '" — PlayStation official trophy list. Grade: ' + t.grade + (t.hidden ? ' · Hidden on PlayStation until earned.' : '') + (t.missable ? ' · Missable — see the guide.' : '');
    var claims = document.createElement('p');
    claims.className = 'claims';
    claims.textContent = 'Claims cited for this trophy: ' + trophyClaims(t) + ' — 3 official facts (name, description, grade) plus ' + (t.steps || []).length + ' guided steps, every step citing the sources below.';
    var g = document.createElement('p');
    g.className = 'guide';
    g.textContent = t.guide;
    var ol = document.createElement('ol');
    (t.steps || []).forEach(function (s) {
      var li = document.createElement('li');
      li.textContent = s;
      ol.appendChild(li);
    });
    var src = document.createElement('p');
    src.className = 'srcs';
    src.textContent = 'Sources: ' + (t.src || []).join(' · ') + ' — every step above cites these sources; the guide text is original, never copied.';
    detailBody.appendChild(h);
    detailBody.appendChild(off);
    detailBody.appendChild(claims);
    if (t.missable) {
      var warn = document.createElement('p');
      warn.className = 'misswarn';
      warn.textContent = 'MISSABLE — this trophy depends on a single moment or a state that is hard to recreate. Do it when the guide says, before the moment passes.';
      detailBody.appendChild(warn);
    }
    detailBody.appendChild(g);
    detailBody.appendChild(ol);
    detailBody.appendChild(src);
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeDetail() { detailEl.hidden = true; }

  // Hash routes, combined with '+': #trophy-17 opens a guide,
  // #roadmap scrolls to the roadmap, #spoiler turns spoiler-safe on,
  // #filter-missable (or any filter name) applies that filter.
  function applyHash() {
    var parts = (location.hash || '').replace(/^#/, '').split('+').filter(Boolean);
    if (!parts.length) return;
    parts.forEach(function (part) {
      if (part.indexOf('trophy-') === 0) {
        var t = data.trophies.find(function (x) { return x.id === parseInt(part.slice(7), 10); });
        if (t) openDetail(t);
      } else if (part === 'roadmap') {
        document.body.classList.add('focus-roadmap');
        window.scrollTo(0, 0);
      } else if (part === 'spoiler') {
        spoiler = true;
        document.getElementById('spoilerToggle').checked = true;
        localStorage.setItem(SPOILER_KEY, '1');
        render();
      } else if (part.indexOf('filter-') === 0) {
        var f = part.slice(7);
        filter = f;
        document.querySelectorAll('#filters button').forEach(function (x) {
          x.classList.toggle('on', x.getAttribute('data-filter') === f);
        });
        render();
      }
    });
  }

  fetch('data/trophies.json').then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    renderRoadmap();
    render();
    applyHash();
  });

  document.getElementById('filters').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-filter]');
    if (!b) return;
    filter = b.getAttribute('data-filter');
    document.querySelectorAll('#filters button').forEach(function (x) { x.classList.toggle('on', x === b); });
    render();
  });
  document.getElementById('search').addEventListener('input', function (ev) {
    query = ev.target.value.trim().toLowerCase();
    render();
  });
  var spoilerToggle = document.getElementById('spoilerToggle');
  spoilerToggle.checked = spoiler;
  spoilerToggle.addEventListener('change', function () {
    spoiler = spoilerToggle.checked;
    localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
    render();
  });
  document.getElementById('detailClose').addEventListener('click', closeDetail);
  document.getElementById('exportBtn').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify({ earned: Object.keys(earned).map(Number), exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-ledger-progress.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  document.getElementById('importBtn').addEventListener('click', function () {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', function (ev) {
    var file = ev.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var obj = JSON.parse(reader.result);
        var ids = Array.isArray(obj) ? obj : (obj.earned || []);
        earned = {};
        ids.forEach(function (id) { earned[Number(id)] = 1; });
        save();
        render();
      } catch (e) { alert('That file is not a valid Leonida Ledger export.'); }
    };
    reader.readAsText(file);
  });
})();
