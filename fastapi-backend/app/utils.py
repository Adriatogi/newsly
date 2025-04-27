from newspaper import Article
from urllib.parse import urlparse, urlunparse

from datetime import datetime
import json
import re


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
    
    try:
        json_obj = json.loads(json_str)
        return json_obj
    except json.JSONDecodeError:
        # Fallback for when JSON parsing fails
        return {"answer": "Failed to parse response as JSON."} 

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
