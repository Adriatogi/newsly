from pydantic import BaseModel, Field
from dataclasses import dataclass, field
from datetime import datetime

class ArticleAnalysisRequest(BaseModel):
    url: str


# This is the dataclass for an article stored in the database
# NOTE: This NEEDS to be in sync with the database schema. It should have the same fields
@dataclass
class NewslyArticle:
    url: str
    title: str
    text: str
    authors: list[str]
    image_url: str
    published_date: datetime
    last_analyzed_at: datetime
    source_url: str
    read_count: int = 1  # start with 1 for new articles
    keywords: list[str] = field(default_factory=list)
    images: list[str] = field(default_factory=list)  # images found in the article
    movies: list[str] = field(default_factory=list)  # videos found in the article

    # fields from analysis
    summary: str = ""
    bias: str = ""
    topics: list[str] = field(default_factory=list)
    contextualization: str = ""

    # fields for the database
    # These fields are set by the database and should not be set manually
    id: str = None
    created_at: datetime = None


class LogicalFallacy(BaseModel):
    reason: str = Field(description="The reason for the fallacy")
    quote: str = Field(description="The quote that is the fallacy")
    rating: int = Field(description="The rating of the fallacy")
    explanation: str = Field(description="The explanation of the fallacy")

class LogicalFallaciesResponse(BaseModel):
    logical_fallacies: list[LogicalFallacy] = Field(description="The logical fallacies in the text")

class LogicalFallacies(BaseModel):
    logical_fallacies: list[LogicalFallacy] = Field(description="The logical fallacies in the text")
    error: str | None = Field(description="The error message if the schema is not valid")
