from newspaper import Article
import modal
import asyncio

from app.ml_newsly import llm_summarize, political_bias, extract_topics, contextualize_article
from app.utils import normalize_url, parse_article
from app.db import get_article_by_url, increment_article_read_count, add_article_to_db

modal_summarize = modal.Function.from_name("newsly-modal-test", "summarize")
modal_political_bias = modal.Function.from_name("newsly-modal-test", "political_bias")

async def generate_explanation(predicted_bias: str, probabilities: dict):
    explanation = f"This article leans {predicted_bias} because: "
    if predicted_bias == "left":
        explanation += "It emphasizes social justice, government intervention, and progressive policies."
    elif predicted_bias == "right":
        explanation += "It focuses on individual responsibility, limited government, and traditional values."
    return explanation

async def analyze_article(article: Article):
    """
    Analyze an article.
    """

    print("Analyzing article")
    summary = modal_summarize.remote.aio(article.text)
    bias = modal_political_bias.remote.aio(article.text)
    summary, bias = await asyncio.gather(summary, bias)


    topics = await extract_topics(article.text)
    contextualization = await contextualize_article(article.text, topics)

    predicted_bias = bias.get("predicted_bias", "unknown")
    probabilities = bias.get("probabilities", {})
    explanation = bias.get("explanation", "No explanation available")

        # Generate explanation
    explanation = f"This article leans {predicted_bias} because: "
    if predicted_bias == "left":
        explanation += "It emphasizes social justice, government intervention, and progressive policies."
    elif predicted_bias == "right":
        explanation += "It focuses on individual responsibility, limited government, and traditional values."
    else:
        explanation += "It presents a balanced view with consideration of multiple perspectives."

    print(f"Generated explanation: {explanation}")

    bias_data = {
        "predicted_bias": predicted_bias,
        "explanation": explanation,
        "probabilities": probabilities
    }

    print("Processed bias_data:", bias_data)

    return {
        "summary": summary,
        "bias": bias_data["predicted_bias"],
        "bias_explanation": bias_data["explanation"],
        "bias_probabilities": bias_data["probabilities"],
        "topics": topics,
        "contextualization": contextualization, 
        "explanation": explanation
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
