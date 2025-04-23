from fastapi import FastAPI
from app.models import ArticleAnalysisRequest
from app.utils import analyze_article_logic

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
    return await analyze_article_logic(article_analysis_request.url)
