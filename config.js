const CONFIG = {
  gnews: {
    apiKey: 'f9fb9961bee13fd243a8ab7d128d54ac',
    baseUrl: 'https://gnews.io/api/v4/top-headlines',
    topics: ['world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health', 'ai'],
    searchTopics: { ai: 'artificial intelligence' },
  },
  corsProxies: [
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ],
  emailjs: {
    publicKey: '9RfrlqCaxAspqkxIf',
    serviceId: 'service_ic1l08p',
    templateId: 'template_jv12wqb',
  },
  recipients: ['recipient1@example.com', 'recipient2@example.com'],
};
