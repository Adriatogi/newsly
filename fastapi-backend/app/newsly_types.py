from pydantic import BaseModel


class ArticleAnalysisRequest(BaseModel):
    url: str
