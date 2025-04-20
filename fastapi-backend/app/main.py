from typing import Union

from fastapi import FastAPI

from app.models import ArticleAnalysisRequest
from newspaper import Article

app = FastAPI()


@app.get("/")
def read_root():
    return {"hello": "world"}


@app.post("/articles/analyze")
async def analyze_article(
    article_analysis_request: ArticleAnalysisRequest,
):
    # download and parse the article
    article = Article(article_analysis_request.url)
    article.download()
    article.parse()

    return {
        "url": article.url,
        "title": article.title,
        "text": article.text,
        "authors": article.authors,
        "image": article.top_image,
    }
