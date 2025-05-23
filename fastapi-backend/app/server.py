import modal
import asyncio
from fastapi import HTTPException
from newspaper import Article


from app.ml_newsly import (
    llm_summarize,
    political_lean,
    extract_topics,
    contextualize_article,
    get_logical_fallacies,
    lean_explanation,
)
from app.utils import normalize_url, parse_article, NewslyArticle
from app.db import (
    get_article_by_url,
    increment_article_read_count,
    add_article_to_db,
    update_article,
)

modal_summarize = modal.Function.from_name("newsly-modal-test", "summarize")
modal_political_lean = modal.Function.from_name("newsly-modal-test", "political_lean")
modal_extract_topics = modal.Function.from_name("newsly-modal-test", "extract_topics")
modal_contextualize_article = modal.Function.from_name(
    "newsly-modal-test", "contextualize_article"
)
modal_lean_explanation = modal.Function.from_name("newsly-modal-test", "lean_explanation")

NO_MODAL = False

async def analyze_article(article: NewslyArticle, no_modal: bool = NO_MODAL) -> None:
    """
    Analyze an article. It will set the properties of the article to the result of the analysis.
    """

    print("Analyzing article")
    if no_modal:
        print("Running no modal")
        summary = await llm_summarize(article.text)
        lean = await political_lean(article.text)
        topics = await extract_topics(article.text)
        logical_fallacies = await get_logical_fallacies(article.text)
        lean_explanation_text = await lean_explanation(article.text, lean["predicted_lean"], lean["probabilities"][lean["predicted_lean"]])
    else:
        print("Running modal")
        summary = modal_summarize.remote.aio(article.text)
        lean = modal_political_lean.remote.aio(article.text)
        topics = modal_extract_topics.remote.aio(article.text)
        logical_fallacies = get_logical_fallacies(article.text)
        summary, lean, topics, logical_fallacies = await asyncio.gather(summary, lean, topics, logical_fallacies)
        # lean explanation needs lean to be set
        lean_explanation_text = await modal_lean_explanation.remote.aio(article.text, lean["predicted_lean"], lean["probabilities"][lean["predicted_lean"]])

    # contextualizing depends on `topics` so we need to wait for it. Can't run async with other functions
    contextualization = modal_contextualize_article.remote(
        article.text, topics
    )  # synchronous, so we don't need to await

    # set the properties of the article to the result of the analysis
    article.summary = summary
    article.lean = lean
    article.lean_explanation = lean_explanation_text
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
            and article.lean
            and article.lean_explanation
            and article.topics
            and article.contextualization
            and article.logical_fallacies
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
