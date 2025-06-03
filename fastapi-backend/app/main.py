from fastapi import FastAPI
from app.newsly_types import ArticleAnalysisRequest
from app.server import process_article_db
from app.ml_newsly import get_logical_fallacies
import app.utils as utils
import uvicorn
import argparse

# dotenv
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI()


@app.get("/")
def read_root():
    return {"hello": "world"}


@app.post("/articles/analyze")
async def analyze_article(article_analysis_request: ArticleAnalysisRequest):
    return await process_article_db(article_analysis_request.url)


# for testing, but lets keep pls
@app.post("/articles/analyze/logical-fallacies")
async def analyze_article_logical_fallacies(
    article_analysis_request: ArticleAnalysisRequest,
):
    article = utils.parse_article(article_analysis_request.url)
    text = article.text
    return await get_logical_fallacies(text)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the FastAPI server")
    parser.add_argument(
        "--test", action="store_true", help="Run the server in test mode"
    )
    args = parser.parse_args()

    if args.test:
        utils.TEST = 1

    uvicorn.run(app)
