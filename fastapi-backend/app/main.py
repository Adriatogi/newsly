from typing import Union

from fastapi import FastAPI

from app.models import ArticleAnalysisRequest

app = FastAPI()


@app.get("/")
def read_root():
    return {"hello": "world"}


@app.post("/articles/analyze")
async def analyze_article(
    article_analysis_request: ArticleAnalysisRequest,
):
    return {"message": "Article analysis started", "url": article_analysis_request.url}
