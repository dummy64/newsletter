# 📰 Newsletter Admin Tool

A static, client-side newsletter admin tool. Select news topics, fetch latest articles from GNews.io, preview and curate them, then send a formatted newsletter via EmailJS — all from a single HTML page deployable on GitHub Pages.

## Features

- Topic-based news fetching (world, business, technology, sports, etc.)
- CORS proxy fallback (allorigins.win → corsproxy.io)
- Article preview cards with select/deselect
- Formatted newsletter preview
- Email sending via EmailJS (200 free emails/month)
- No backend, no build step

## Setup

### 1. GNews API Key
1. Register at [gnews.io](https://gnews.io/register)
2. Copy your API key from the dashboard

### 2. EmailJS Setup
1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Add an email service (e.g., Gmail) — note the **Service ID**
3. Create an email template with these variables:
   - `{{to_email}}` — recipient address (set as the "To" field)
   - `{{subject}}` — email subject line
   - `{{newsletter_html}}` — the newsletter HTML body
4. Note the **Template ID** and your **Public Key** (from Account > API Keys)

### 3. Configure
Edit `config.js`:
```js
const CONFIG = {
  gnews: { apiKey: 'YOUR_GNEWS_API_KEY', ... },
  emailjs: {
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
  },
  recipients: ['email1@example.com', 'email2@example.com'],
};
```

### 4. Run Locally
Open `index.html` in a browser. No server needed.

### 5. Deploy to GitHub Pages
1. Push the repo to GitHub
2. Go to **Settings > Pages**
3. Set source to the branch/root containing `index.html`
4. Site will be live at `https://<username>.github.io/<repo>/`

## Free Tier Limits

| Service | Limit |
|---------|-------|
| GNews.io | 100 requests/day, 10 articles/request |
| EmailJS | 200 emails/month |
| CORS Proxies | Unlimited (community-maintained) |

## Usage Flow

1. Select topics → **Fetch News**
2. Review article cards, deselect unwanted ones
3. **Preview Newsletter** → review formatted email
4. **Send Newsletter** → delivers to all recipients

## License

MIT
