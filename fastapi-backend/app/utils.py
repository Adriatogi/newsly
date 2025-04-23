from newspaper import Article
from app.models import llm_summarize
from app.db import add_article_to_db, get_article_by_url, increment_article_read_count
from urllib.parse import urlparse, urlunparse

from datetime import datetime


def normalize_url(url: str) -> str:
    """
    Normalize a URL by removing the query and fragment components.
    Args:
        url (str): The URL to normalize.
    Returns:
        str: The normalized URL.
    """
    parsed = urlparse(url)
    normalized = parsed._replace(query="", fragment="")
    return urlunparse(normalized)


async def analyze_article_logic(url: str):
    """
    Analyze an article from the given URL.
    """
    # Check if the article is already in the database
    clean_url = normalize_url(url)
    article = get_article_by_url(clean_url)

    if article:
        increment_article_read_count(article["id"], article["read_count"])
    else:
        # parse article
        new_article = Article(url)
        new_article.download()
        new_article.parse()

        # Add article to the database
        article = add_article_to_db(clean_url, new_article)

    # summary = await llm_summarize(article.text)

    return article
