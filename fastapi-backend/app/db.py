from dataclasses import dataclass
import dataclasses
import os
from supabase import create_client, Client
from datetime import datetime
from app.utils import NewslyArticle

import app.utils as utils

# dotenv
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)


def get_all_articles() -> list[NewslyArticle]:
    # Get all articles from the database
    response = supabase.table("articles").select("*").execute()
    return (
        [NewslyArticle(**article) for article in response.data] if response.data else []
    )


def get_article_by_url(url: str) -> NewslyArticle | None:
    # Get article by URL from the database

    # if testing, we didn't find it
    if utils.TEST:
        return None

    response = supabase.table("articles").select("*").eq("url", url).execute()
    if response.data:
        return NewslyArticle(**response.data[0])
    else:
        return None


def delete_article_by_id(article_id: str):
    # Delete an article by ID from the database
    response = supabase.table("articles").delete().eq("id", article_id).execute()
    return response.data


def delete_article_by_url(url: str):
    # Delete an article by URL from the database
    response = supabase.table("articles").delete().eq("url", url).execute()
    return response.data


def increment_article_read_count(article_id: str, previous_read_count: int = 0):
    # Increment the read count of an article
    response = (
        supabase.table("articles")
        .update({"read_count": previous_read_count + 1})
        .eq("id", article_id)
        .execute()
    )
    return response.data


def add_article_to_db(cleaned_url: str, article: NewslyArticle) -> NewslyArticle | None:
    """
    Add an article to the database.
    Args:
        article (Article): The article object to be added. Note that this expects `.parse()` to have already been called on the article.
    Returns:
        dict: The article data that got stored in the database.
    """
    parsed_article = dataclasses.asdict(article)

    # Add article to the database
    if not utils.TEST:
        response = supabase.table("articles").insert(parsed_article).execute()
        if response.data:
            return NewslyArticle(**response.data[0])
    else:
        return article

    return None


def update_article(article: NewslyArticle) -> NewslyArticle | None:
    """
    Update an article in the database.
    Args:
        article (NewslyArticle): The article object to be updated. It should have an ID.
    Returns:
    """
    article_id = article.id
    if not article_id:
        raise ValueError("Article ID is required for updating.")

    data = dataclasses.asdict(article)

    # Update an article by ID in the database
    response = supabase.table("articles").update(data).eq("id", article_id).execute()
    if response.data:
        return NewslyArticle(**response.data[0])
    else:
        return None
