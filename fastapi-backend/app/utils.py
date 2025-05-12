from newspaper import Article
import modal
from datetime import datetime
from urllib.parse import urlparse, urlunparse
from dataclasses import dataclass, field
import json
import re
import os


modal_summarize = modal.Function.from_name("newsly-modal-test", "summarize")
modal_political_bias = modal.Function.from_name("newsly-modal-test", "political_bias")

TEST = int(os.environ.get("TEST", "0"))


# TODO: move this dataclass to a different file
# This is the dataclass for an article stored in the database
# NOTE: This NEEDS to be in sync with the database schema. It should have the same fields
@dataclass
class NewslyArticle:
    url: str
    title: str
    text: str
    authors: list[str]
    image_url: str
    published_date: str
    last_analyzed_at: str
    source_url: str
    read_count: int = 1  # start with 1 for new articles
    keywords: list[str] = field(default_factory=list)
    images: list[str] = field(default_factory=list)  # images found in the article
    movies: list[str] = field(default_factory=list)  # videos found in the article

    # fields from analysis
    summary: str = ""
    bias: str = ""
    topics: list[str] = field(default_factory=list)
    contextualization: str = ""

    # fields for the database
    # These fields are set by the database and should not be set manually
    id: str = None
    created_at: str = None


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
        return {"answer": f"Failed to parse response as JSON. Original text: {text}"}


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
    article = Article(url)
    article.download()
    article.parse()
    article.nlp()

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
