import { usePostHog } from 'posthog-react-native';
import { useEffect } from 'react';
import { Button, AppState } from 'react-native';

// Custom analytics hook
export const useAnalytics = () => {
  const posthog = usePostHog();

  const trackArticleRead = (articleId: string, source: 'url_query' | 'main_feed') => {
    posthog?.capture('article_read', {
      article_id: articleId,
      source,
      timestamp: new Date().toISOString(),
    });
  };

  const trackArticleShown = (articleId: string, source: 'url_query' | 'main_feed') => {
    posthog?.capture('article_shown', {
      article_id: articleId,
      source,
      timestamp: new Date().toISOString(),
    });
  };

  return { trackArticleRead, trackArticleShown };
};

// Custom session tracking (PostHog does it automatically, but just in case)
export const useSessionTracking = () => {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture('session_start', { timestamp: new Date().toISOString() });
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        posthog?.capture('session_end', { timestamp: new Date().toISOString() });
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [posthog]);
};

// Test event component for PostHog
export const TestEventComponent = () => {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.capture('test_event', { test: true });
  }, [posthog]);
  return null;
};

// Test button component for PostHog
export const TestButton = () => {
  const posthog = usePostHog();
  return (
    <Button
      title="Test PostHog Event"
      onPress={() => posthog?.capture('test_event', { test: true })}
    />
  );
};
