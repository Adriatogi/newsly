import modal
import asyncio
from fastapi import HTTPException

from app.ml_newsly import (
    llm_summarize,
    political_bias,
    extract_topics,
    contextualize_article,
    get_logical_fallacies,
)
from app.utils import normalize_url, parse_article, NewslyArticle
from app.db import (
    get_article_by_url,
    increment_article_read_count,
    add_article_to_db,
    update_article,
)

modal_summarize = modal.Function.from_name("newsly-modal-test", "summarize")
modal_political_bias = modal.Function.from_name("newsly-modal-test", "political_bias")
modal_extract_topics = modal.Function.from_name("newsly-modal-test", "extract_topics")
modal_contextualize_article = modal.Function.from_name(
    "newsly-modal-test", "contextualize_article"
)


async def analyze_article(article: NewslyArticle, no_modal: bool = False) -> None:
    """
    Analyze an article. It will set the properties of the article to the result of the analysis.
    """

    print("Analyzing article")
    if no_modal:
        summary = llm_summarize(article.text)
        bias = political_bias(article.text)
        topics = extract_topics(article.text)
        logical_fallacies = get_logical_fallacies(article.text)
    else:
        summary = modal_summarize.remote.aio(article.text)
        bias = modal_political_bias.remote.aio(article.text)
        topics = modal_extract_topics.remote.aio(article.text)
        summary, bias, topics = await asyncio.gather(summary, bias, topics)

    # contextualizing depends on `topics` so we need to wait for it. Can't run async with other functions
    contextualization = modal_contextualize_article.remote(
        article.text, topics
    )  # synchronous, so we don't need to await

    # set the properties of the article to the result of the analysis
    article.summary = summary
    article.bias = bias
    article.topics = topics
    article.contextualization = contextualization
    article.logical_fallacies = logical_fallacies

async def process_article_db(url: str, cache=True) -> NewslyArticle | None:
    """
    Analyze an article from the given URL.
    """
    # Check if the article is already in the database
    url = normalize_url(url)
    article = get_article_by_url(url)

    if article:  # If the article is already in the database, increment the read count
        increment_article_read_count(article.id, article.read_count)

        # If the article is already analyzed, return it
        if (
            article.summary
            and article.bias
            and article.topics
            and article.contextualization
        ):
            print("Article already analyzed")
            return article
        else:
            print("Article not analyzed yet, analyzing it now")
            await analyze_article(article)

            if cache:
                print("Caching article to db")
                article = update_article(article)
    else:
        # parse article
        article = parse_article(url)

        if not article:
            raise HTTPException(
                status_code=404, detail="Article not found or not supported"
            )

        # Analyze article
        await analyze_article(article)

        # Add article to the database
        if cache:
            print("Caching article to db")
            article = add_article_to_db(article)

    return article
