from newspaper import Article
import modal
import asyncio

from app.ml import llm_summarize, political_bias
from app.utils import normalize_url, parse_article
from app.db import get_article_by_url, increment_article_read_count, add_article_to_db

modal_summarize = modal.Function.from_name("newsly-modal-test", "summarize")
modal_political_bias = modal.Function.from_name("newsly-modal-test", "political_bias")


async def analyze_article(article: Article):
    """
    Analyze an article.
    """

    print("Analyzing article")
    # Use local llm
    # summary = await llm_summarize(article["text"])
    # bias = await political_bias(article["text"])

    # Use modal functions for summarization and bias analysis
    summary = modal_summarize.remote.aio(article["text"])
    bias = modal_political_bias.remote.aio(article["text"])
    summary, bias = await asyncio.gather(summary, bias)

    return {
        "summary": summary,
        "bias": bias,
    }


async def process_article_db(url: str, cache=True):
    """
    Analyze an article from the given URL.
    """
    # Check if the article is already in the database
    clean_url = normalize_url(url)
    article = get_article_by_url(clean_url)

    if article:
        print("article already in db")
        increment_article_read_count(article["id"], article["read_count"])
    else:
        print("article not in db")
        # parse article
        new_article = parse_article(url)

        if new_article == None:
            print("article not found")
            raise Exception("Article not found")
        else:
            print("article found")

        # Analyze article
        analysis = await analyze_article(new_article)

        # Add article to the database
        new_article.summary = analysis["summary"]
        new_article.bias = analysis["bias"]

        if cache:
            print("Caching article to db")
            article = add_article_to_db(clean_url, new_article)
        else:
            print("Not caching article to db")
            article = new_article

    return article
