from app.ml import llm_summarize, political_bias
from app.utils import normalize_url, parse_article
from app.db import get_article_by_url, increment_article_read_count, add_article_to_db
from newspaper import Article

async def analyze_article(article: Article, test_mode=False):
    """
    Analyze an article.
    """
    summary = await llm_summarize(article["text"], test_mode=test_mode)
    bias = await political_bias(article["text"], test_mode=test_mode)

    return {
        "summary": summary,
        "bias": bias,
    }


async def process_article_db(url: str, test_mode=False):
    """
    Analyze an article from the given URL.
    """
    # Check if the article is already in the database
    clean_url = normalize_url(url)
    article = get_article_by_url(clean_url, test_mode=test_mode)

    if article:
        increment_article_read_count(article["id"], article["read_count"])
    else:
        # parse article
        new_article = parse_article(url)

        # Add article to the database
        article = add_article_to_db(clean_url, new_article, test_mode=test_mode)

    # Analyze article
    analysis = await analyze_article(article, test_mode=test_mode)
    article["summary"] = analysis["summary"]
    article["bias"] = analysis["bias"]

    return article
