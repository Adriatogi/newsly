import os
from supabase import create_client, Client
from newspaper import Article
from datetime import datetime

# dotenv
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)


def get_all_articles():
    # Get all articles from the database
    response = supabase.table("articles").select("*").execute()
    return response.data


def get_article_by_url(url: str, test_mode=False):
    # Get article by URL from the database

    # if testing, we didn't find it
    if test_mode:
        return None

    response = supabase.table("articles").select("*").eq("url", url).execute()
    if response.data:
        return response.data[0]
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


def add_article_to_db(cleaned_url: str, article: Article, test_mode=False):
    """
    Add an article to the database.
    Args:
        article (Article): The article object to be added. Note that this expects `.parse()` to have already been called on the article.
    Returns:
        dict: The article data that got stored in the database.
    """
    parsed_article = {
        "url": cleaned_url,
        "source_url": article.source_url,
        "title": article.title,
        "text": article.text,
        "authors": article.authors,
        "image_url": article.top_image,
        "published_date": article.publish_date.isoformat(),
        "keywords": article.keywords,
        "last_analyzed_at": datetime.now().isoformat(),
        "summary": article.summary,
        "bias": article.bias,
    }

    # Add article to the database
    # TODO: Is this right for testing?
    if not test_mode:
        response = supabase.table("articles").insert(parsed_article).execute()
        if response.data:
            return response.data[0]
    else:
        return parsed_article

    return None
