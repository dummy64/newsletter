// State
let articles = [];

// Init
(function init() {
  emailjs.init(CONFIG.emailjs.publicKey);
  const grid = document.getElementById('topic-grid');
  CONFIG.gnews.topics.forEach(t => {
    grid.innerHTML += `<label class="topic-pill"><input type="checkbox" value="${t}" checked> ${t[0].toUpperCase() + t.slice(1)}</label>`;
  });
})();

// Toast
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast-msg ${type}`;
  el.textContent = msg;
  document.getElementById('toast').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// Loader
const setLoading = (v) => document.getElementById('loader').hidden = !v;

// Fetch news through CORS proxies with fallback
async function fetchNews(topic) {
  const url = `${CONFIG.gnews.baseUrl}?topic=${topic}&lang=en&max=10&apikey=${CONFIG.gnews.apiKey}`;
  for (const proxy of CONFIG.corsProxies) {
    try {
      const res = await fetch(proxy(url));
      if (!res.ok) continue;
      const data = await res.json();
      return data.articles || [];
    } catch { continue; }
  }
  toast(`Failed to fetch "${topic}" — all proxies failed`, 'error');
  return [];
}

async function fetchAllNews() {
  const selected = [...document.querySelectorAll('#topic-grid input:checked')].map(i => i.value);
  if (!selected.length) return toast('Select at least one topic', 'error');

  setLoading(true);
  try {
    const results = await Promise.all(selected.map(fetchNews));
    const seen = new Set();
    articles = results.flat().filter(a => a.url && !seen.has(a.url) && seen.add(a.url));
    articles.forEach(a => a._selected = true);

    if (!articles.length) return toast('No articles found', 'error');
    renderCards();
    document.getElementById('news').hidden = false;
    toast(`Fetched ${articles.length} articles`, 'success');
  } catch (e) {
    toast('Fetch failed: ' + e.message, 'error');
  } finally {
    setLoading(false);
  }
}

// Cards
function renderCards() {
  const container = document.getElementById('cards');
  container.innerHTML = articles.map((a, i) => `
    <div class="card ${a._selected ? 'selected' : ''}" onclick="toggleCard(${i})">
      <input type="checkbox" class="card-check" ${a._selected ? 'checked' : ''} onclick="event.stopPropagation(); toggleCard(${i})">
      ${a.image ? `<img src="${a.image}" alt="" loading="lazy">` : ''}
      <div class="card-body">
        <h3>${a.title}</h3>
        <p>${a.description || ''}</p>
        <div class="card-meta">${a.source?.name || ''} · ${new Date(a.publishedAt).toLocaleDateString()}</div>
      </div>
    </div>`).join('');
  updateCount();
}

function toggleCard(i) {
  articles[i]._selected = !articles[i]._selected;
  renderCards();
}

function toggleAll(checked) {
  articles.forEach(a => a._selected = checked);
  renderCards();
}

function updateCount() {
  const sel = articles.filter(a => a._selected).length;
  document.getElementById('count').textContent = `(${sel} of ${articles.length} selected)`;
  document.getElementById('select-all').checked = sel === articles.length;
}

// Newsletter HTML
function buildNewsletterHTML() {
  const selected = articles.filter(a => a._selected);
  if (!selected.length) return null;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
      <h1 style="background:#1a1a2e;color:#fff;padding:20px;margin:0;text-align:center">📰 Newsletter</h1>
      <p style="padding:15px 20px;color:#666;margin:0">Your curated news digest — ${date}</p>
      ${selected.map(a => `
        <div style="padding:15px 20px;border-bottom:1px solid #eee">
          ${a.image ? `<img src="${a.image}" style="width:100%;max-height:200px;object-fit:cover;border-radius:6px;margin-bottom:10px" alt="">` : ''}
          <h2 style="margin:0 0 8px;font-size:18px"><a href="${a.url}" style="color:#1a1a2e;text-decoration:none">${a.title}</a></h2>
          <p style="margin:0 0 6px;font-size:14px;color:#555">${a.description || ''}</p>
          <p style="margin:0;font-size:12px;color:#999">${a.source?.name || ''} · ${new Date(a.publishedAt).toLocaleDateString()}</p>
        </div>`).join('')}
      <p style="padding:20px;text-align:center;color:#999;font-size:12px">Sent via Newsletter Admin Tool</p>
    </div>`;
}

// Preview
function showPreview() {
  const html = buildNewsletterHTML();
  if (!html) return toast('No articles selected', 'error');
  document.getElementById('preview').innerHTML = html;
  document.getElementById('modal').classList.add('active');
}

function closeModal() { document.getElementById('modal').classList.remove('active'); }

// Send
async function sendNewsletter() {
  const html = buildNewsletterHTML();
  if (!html) return toast('No articles selected', 'error');
  const recipients = CONFIG.recipients;
  if (!recipients.length) return toast('No recipients configured', 'error');
  if (!confirm(`Send newsletter to ${recipients.length} recipient(s)?`)) return;

  const btn = document.getElementById('send-btn');
  btn.disabled = true;
  let sent = 0, failed = 0;

  for (const email of recipients) {
    try {
      btn.textContent = `Sending ${sent + failed + 1}/${recipients.length}...`;
      await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, {
        to_email: email,
        newsletter_html: html,
        subject: `Newsletter — ${new Date().toLocaleDateString()}`,
      });
      sent++;
    } catch (e) {
      failed++;
      console.error(`Failed to send to ${email}:`, e);
    }
  }

  btn.disabled = false;
  btn.textContent = 'Send Newsletter';
  toast(`Sent: ${sent}, Failed: ${failed}`, failed ? 'error' : 'success');
  if (sent > 0) closeModal();
}
