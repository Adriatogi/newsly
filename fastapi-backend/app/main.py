from fastapi import FastAPI
from app.types import ArticleAnalysisRequest
from app.utils import process_article_db

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
