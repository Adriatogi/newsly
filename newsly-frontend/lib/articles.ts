import { supabase } from "./supabase";

export interface LogicalFallacy {
  quote: string;
  rating: number;
  reason: string;
  explanation: string;
}

export interface FallacyCategory {
  error: string | null;
  logical_fallacies: LogicalFallacy[];
}

export interface LogicalFallacies {
  ad_hominem: FallacyCategory;
  good_sources: FallacyCategory;
  non_sequitur: FallacyCategory;
  scapegoating: FallacyCategory;
  fear_mongering: FallacyCategory;
  emotion_fallacy: FallacyCategory;
  false_dichotomy: FallacyCategory;
  discrediting_sources: FallacyCategory;
  presenting_other_side: FallacyCategory;
}

interface BiasData {
  probabilities: {
    left: number;
    center: number;
    right: number;
  };
  predicted_bias: string;
}

export interface NewsArticle {
  id: string;
  url: string;
  title: string;
  text: string;
  authors: string[];
  image_url: string;
  read_count: number;
  published_date: string;
  last_analyzed_at: string;
  created_at: string;
  source_url: string;
  keywords: string[];
  summary: string;
  bias: BiasData;
  topics: string[];
  contextualization: string;
  images: string[];
  movies: string[];
  logical_fallacies: LogicalFallacies;
}

function filterHighRatedFallacies(
  fallacies: LogicalFallacies
): LogicalFallacies {
  const result: LogicalFallacies = {
    ad_hominem: { error: null, logical_fallacies: [] },
    good_sources: { error: null, logical_fallacies: [] },
    non_sequitur: { error: null, logical_fallacies: [] },
    scapegoating: { error: null, logical_fallacies: [] },
    fear_mongering: { error: null, logical_fallacies: [] },
    emotion_fallacy: { error: null, logical_fallacies: [] },
    false_dichotomy: { error: null, logical_fallacies: [] },
    discrediting_sources: { error: null, logical_fallacies: [] },
    presenting_other_side: { error: null, logical_fallacies: [] },
  };

  // Filter each category to only include fallacies with rating >= 4
  Object.keys(fallacies).forEach((category) => {
    const typedCategory = category as keyof LogicalFallacies;
    result[typedCategory] = {
      error: fallacies[typedCategory].error,
      logical_fallacies: fallacies[typedCategory].logical_fallacies.filter(
        (fallacy) => fallacy.rating >= 4
      ),
    };
  });
  return result;
}

function transformArticle(data: any): NewsArticle {
  const defaultFallacies = {
    ad_hominem: { error: null, logical_fallacies: [] },
    good_sources: { error: null, logical_fallacies: [] },
    non_sequitur: { error: null, logical_fallacies: [] },
    scapegoating: { error: null, logical_fallacies: [] },
    fear_mongering: { error: null, logical_fallacies: [] },
    emotion_fallacy: { error: null, logical_fallacies: [] },
    false_dichotomy: { error: null, logical_fallacies: [] },
    discrediting_sources: { error: null, logical_fallacies: [] },
    presenting_other_side: { error: null, logical_fallacies: [] },
  };

  return {
    id: data.id || "",
    url: data.url || "",
    title: data.title || "",
    text: data.text || "",
    authors: Array.isArray(data.authors) ? data.authors : [],
    image_url: data.image_url || "",
    read_count: data.read_count || 0,
    published_date: data.published_date || "",
    last_analyzed_at: data.last_analyzed_at || "",
    created_at: data.created_at || "",
    source_url: data.source_url || "",
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    summary: data.summary || "",
    bias:
      data.bias && typeof data.bias === "object"
        ? data.bias
        : {
            probabilities: {
              left: 0,
              center: 0,
              right: 0,
            },
            predicted_bias: "center",
          },
    topics:
      Array.isArray(data.topics) && data.topics.length > 0
        ? [data.topics[0]]
        : [],
    contextualization: data.contextualization || "NONE",
    images: Array.isArray(data.images) ? data.images : [],
    movies: Array.isArray(data.movies) ? data.movies : [],
    logical_fallacies: data.logical_fallacies
      ? filterHighRatedFallacies(data.logical_fallacies)
      : defaultFallacies,
  };
}

export async function fetchArticles(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }

  return (data || []).map(transformArticle);
}

export async function fetchArticleById(
  id: string
): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching article:", error);
    throw error;
  }

  return data ? transformArticle(data) : null;
}

export async function fetchArticleByUrl(
  url: string
): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("url", url)
    .single();

  if (error) {
    console.error("Error fetching article:", error);
    throw error;
  }

  return data ? transformArticle(data) : null;
}
