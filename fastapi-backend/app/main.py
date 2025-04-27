from fastapi import FastAPI
from app.types import ArticleAnalysisRequest
from app.utils import process_article_db
import uvicorn
import argparse
import os

# dotenv
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI()

#set env var
TEST_MODE = False

@app.get("/")
def read_root():
    return {"hello": "world"}


@app.post("/articles/analyze")
async def analyze_article(article_analysis_request: ArticleAnalysisRequest):
    return await process_article_db(article_analysis_request.url, TEST_MODE)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run the FastAPI server')
    parser.add_argument('--test', action='store_true', help='Run the server in test mode')
    args = parser.parse_args()
    
    # Set the environment variable for test mode
    if args.test:
        TEST_MODE = True
        
    uvicorn.run(app)
