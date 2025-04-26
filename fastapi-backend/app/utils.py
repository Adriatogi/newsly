from newspaper import Article
from app.ml import llm_summarize, political_bias
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


def parse_article(url: str):
    """
    Parse an article from the given URL.

    The Article object has the following attributes:
    - title: The title of the article.
    - authors: A list of authors of the article.
    - publish_date: The publication date of the article.
    - text: The full text of the article.
    - top_image: The URL of the top image in the article.
    - movies: A list of videos found in the article.

    Args:
        url (str): The URL of the article to parse.

    Returns:
        Article: An object containing the parsed article data.
    """
    article = Article(url)
    article.download()
    article.parse()

    return article


def analyze_article(article: Article):
    """
    Analyze an article.
    """
    summary = await llm_summarize(article.text)
    bias = await political_bias(article.text)

    return {
        "summary": summary,
        "bias": bias,
    }


async def process_article_db(url: str):
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
        new_article = parse_article(url)

        # Add article to the database
        article = add_article_to_db(clean_url, new_article)

        # Analyze article
        analysis = analyze_article(new_article)
        article["summary"] = analysis["summary"]
        article["bias"] = analysis["bias"]

    return article
