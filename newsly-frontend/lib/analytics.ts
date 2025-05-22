import PostHog from 'posthog-react-native';

// Initialize PostHog
const posthog = new PostHog('YOUR_POSTHOG_API_KEY', {
  host: 'YOUR_POSTHOG_HOST', // e.g., 'https://app.posthog.com'
});

// Article reading events
export const trackArticleRead = (articleId: string, source: 'url_query' | 'main_feed') => {
  posthog.capture('article_read', {
    article_id: articleId,
    source: source,
    timestamp: new Date().toISOString(),
  });
};

// Daily article count
export const trackDailyArticleCount = (count: number) => {
  posthog.capture('daily_article_count', {
    count: count,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  });
};

export default posthog;