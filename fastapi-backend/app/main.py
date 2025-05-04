from fastapi import FastAPI
from app.types import ArticleAnalysisRequest
from app.server import process_article_db, analyze_article
import app.utils as utils
import uvicorn
import argparse
import os

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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run the FastAPI server')
    parser.add_argument('--test', action='store_true', help='Run the server in test mode')
    args = parser.parse_args()

    if args.test:
        utils.TEST = 1
    
    uvicorn.run(app)
