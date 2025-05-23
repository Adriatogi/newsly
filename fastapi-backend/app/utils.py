from fastapi import HTTPException
from newspaper import Article
import modal
from datetime import datetime
from urllib.parse import urlparse, urlunparse
from dataclasses import fields
import json
import re
import os
from newspaper.exceptions import ArticleException
from pydantic import BaseModel, ValidationError
from app.newsly_types import NewslyArticle, LogicalFallacyComplete

modal_summarize = modal.Function.from_name("newsly-modal-test", "summarize")
modal_political_lean = modal.Function.from_name("newsly-modal-test", "political_lean")

TEST = int(os.environ.get("TEST", "0"))


def filter_article_data(data: dict) -> dict:
    """
    Filters the incoming article data dictionary to include only keys
    that are valid fields of the NewslyArticle dataclass. This prevents
    unexpected keys (e.g., from a newer or out-of-sync DB schema) from
    causing a TypeError when unpacking into the dataclass.
    """
    valid_fields = {f.name for f in fields(NewslyArticle)}
    invalid_keys = set(data) - valid_fields
    if invalid_keys:
        print(f"[Warning] Dropped unknown keys: {invalid_keys}")
    return {k: v for k, v in data.items() if k in valid_fields}


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


def extract_json(text: str):
    block_matches = list(re.finditer(r"```(?:json)?\\s*(.*?)```", text, re.DOTALL))
    bracket_matches = list(re.finditer(r"\{.*?\}", text, re.DOTALL))

    # SE(01/20/2025): we take the last match because the model may output
    # multiple JSON blocks and often
    if block_matches:
        json_str = block_matches[-1].group(1).strip()
    elif bracket_matches:
        json_str = bracket_matches[-1].group(0)
    else:
        json_str = text

    # Clean up the string - handle escaped newlines and nested JSON
    json_str = json_str.replace("\\n", "\n").replace('\\"', '"')

    try:
        # First try direct parsing
        json_obj = json.loads(json_str)
        return json_obj
    except json.JSONDecodeError:
        try:
            # Try with regex to extract JSON objects from text that might contain other content
            matches = re.findall(
                r"\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}", json_str
            )
            if matches:
                return json.loads(matches[0])
        except:
            pass

        # If all parsing attempts fail
        return None


def parse_article(url: str) -> NewslyArticle:
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
    try:
        article = Article(url)
        article.download()
        article.parse()
    except Exception as e:
        if isinstance(e, ArticleException):
            raise HTTPException(
                status_code=404, detail="Article not found or not supported"
            )
        else:
            print("Error parsing article:", e)
            raise HTTPException(status_code=500, detail="Error parsing article")

    # str readable date
    date = article.publish_date
    date = date.isoformat()

    return NewslyArticle(
        url=url,
        title=article.title,
        text=article.text,
        authors=article.authors,
        image_url=article.top_image,
        published_date=date,
        last_analyzed_at=datetime.now().isoformat(),
        source_url=url,
        keywords=article.keywords or [],
        images=article.images or [],
        movies=article.movies or [],
    )
