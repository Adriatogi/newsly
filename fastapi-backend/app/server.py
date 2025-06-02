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
    get_combined_logical_fallacies,
    lean_explanation,
)
from app.utils import normalize_url, parse_article, NewslyArticle
from app.db import (
    get_article_by_url,
    increment_article_read_count,
    add_article_to_db,
    update_article,
)
import app.prompts as prompts
from app.newsly_types import (
    LogicalFallacyComplete,
    LogicalFallacyServerList,
    LogicalFallacyServer,
)

modal_summarize = modal.Function.from_name("newsly-modal-test", "summarize")
modal_political_lean = modal.Function.from_name("newsly-modal-test", "political_lean")
modal_extract_topics = modal.Function.from_name("newsly-modal-test", "extract_topics")
modal_get_keywords = modal.Function.from_name("newsly-modal-test", "get_keywords")
modal_get_tag = modal.Function.from_name("newsly-modal-test", "get_tag")
modal_contextualize_article = modal.Function.from_name(
    "newsly-modal-test", "contextualize_article"
)
modal_lean_explanation = modal.Function.from_name(
    "newsly-modal-test", "lean_explanation"
)
modal_get_logical_fallacies = modal.Function.from_name(
    "newsly-modal-test", "get_logical_fallacies"
)

NO_MODAL = False


async def get_modal_logical_fallacies(text: str) -> LogicalFallacyComplete:
    """
    Get all logical fallacies using Modal functions.
    """
    # Define all fallacy types with their prompts and system messages
    fallacy_configs = {
        "ad_hominem": {
            "prompt": prompts.ad_hominem,
            "system_message": "You are a helpful assistant that identifies ad hominem attacks in text.",
        },
        "discrediting_sources": {
            "prompt": prompts.discrediting_sources,
            "system_message": "You are a helpful assistant that identifies discrediting sources in text.",
        },
        "emotion_fallacy": {
            "prompt": prompts.emotion_fallacy,
            "system_message": "You are a helpful assistant that identifies emotion fallacy in text.",
        },
        "false_dichotomy": {
            "prompt": prompts.false_dichotomy_fallacy,
            "system_message": "You are a helpful assistant that identifies false dichotomies in text.",
        },
        "fear_mongering": {
            "prompt": prompts.fear_mongering_fallacy,
            "system_message": "You are a helpful assistant that identifies fear mongering in text.",
        },
        "good_sources": {
            "prompt": prompts.good_sources,
            "system_message": "You are a helpful assistant that identifies good sources in text.",
        },
        "non_sequitur": {
            "prompt": prompts.non_sequitur,
            "system_message": "You are a helpful assistant that identifies non-sequiturs in text.",
        },
        "presenting_other_side": {
            "prompt": prompts.presenting_other_side,
            "system_message": "You are a helpful assistant that identifies presenting the other side in text.",
        },
        "scapegoating": {
            "prompt": prompts.scapegoating,
            "system_message": "You are a helpful assistant that identifies scapegoating in text.",
        },
    }

    # Create async tasks for all fallacy types
    tasks = []
    for fallacy_type, config in fallacy_configs.items():
        task = modal_get_logical_fallacies.remote.aio(
            text, fallacy_type, config["prompt"]
        )
        tasks.append((fallacy_type, task))

    # Wait for all tasks to complete
    results = {}
    for fallacy_type, task in tasks:
        try:
            result = await task
            # Convert the result to LogicalFallacyServerList
            logical_fallacies = []
            if result.get("logical_fallacies"):
                for fallacy in result["logical_fallacies"]:
                    logical_fallacies.append(
                        LogicalFallacyServer(
                            reason=fallacy["reason"],
                            quote=fallacy["quote"],
                            rating=fallacy["rating"],
                            explanation=fallacy["explanation"],
                        )
                    )

            results[fallacy_type] = LogicalFallacyServerList(
                logical_fallacies=logical_fallacies, error=result.get("error")
            )
        except Exception as e:
            print(f"Error processing {fallacy_type}: {e}")
            results[fallacy_type] = LogicalFallacyServerList(
                logical_fallacies=[], error=str(e)
            )

    # Create LogicalFallacyComplete object
    return LogicalFallacyComplete(
        ad_hominem=results["ad_hominem"],
        discrediting_sources=results["discrediting_sources"],
        emotion_fallacy=results["emotion_fallacy"],
        false_dichotomy=results["false_dichotomy"],
        fear_mongering=results["fear_mongering"],
        good_sources=results["good_sources"],
        non_sequitur=results["non_sequitur"],
        presenting_other_side=results["presenting_other_side"],
        scapegoating=results["scapegoating"],
    )


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
        logical_fallacies = await get_combined_logical_fallacies(article.text)
        lean_explanation_text = await lean_explanation(
            article.text,
            lean["predicted_lean"],
            lean["probabilities"][lean["predicted_lean"]],
        )
    else:
        print("Running modal")
        summary = modal_summarize.remote.aio(article.text)
        lean = modal_political_lean.remote.aio(article.text)
        topics = modal_extract_topics.remote.aio(article.text)
        keywords = modal_get_keywords.remote.aio(article.text)
        tag = modal_get_tag.remote.aio(article.text)
        logical_fallacies = get_logical_fallacies(article.text)
        contextualization = modal_contextualize_article.remote.aio(article.text)
        summary, lean, topics, keywords, tag, logical_fallacies, contextualization = (
            await asyncio.gather(
                summary,
                lean,
                topics,
                keywords,
                tag,
                logical_fallacies,
                contextualization,
            )
        )
        # lean explanation needs lean to be set
        lean_explanation_text = await modal_lean_explanation.remote.aio(
            article.text,
            lean["predicted_lean"],
            lean["probabilities"][lean["predicted_lean"]],
        )

    # set the properties of the article to the result of the analysis
    article.summary = summary
    article.lean = lean
    article.lean_explanation = lean_explanation_text
    article.topics = topics.get("topics", [])
    article.keywords = keywords
    article.tag = tag
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
