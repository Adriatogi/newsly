from newspaper import Article
from app.models import llm_summarize

async def analyze_article_logic(url: str):
    article = Article(url)
    article.download()
    article.parse()
    
    summary = await llm_summarize(article.text)
    
    return {
        "url": article.url,
        "title": article.title,
        "text": article.text,
        "authors": article.authors,
        "image": article.top_image,
        "summary": summary
    } 