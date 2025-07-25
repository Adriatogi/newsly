from pydantic import BaseModel, Field
from dataclasses import dataclass, field
from datetime import datetime


class ArticleAnalysisRequest(BaseModel):
    url: str


class LogicalFallacyAPI(BaseModel):
    quote: str = Field(description="The quote that is the fallacy")
    reason: str = Field(description="The reason for the fallacy")
    explanation: str = Field(
        description="An explanation of how confident it is in the rating"
    )
    rating: int = Field(description="The confidence rating of the fallacy")


# This is what is fed to the API
class LogicalFallacyListAPI(BaseModel):
    logical_fallacies: list[LogicalFallacyAPI] = Field(
        description="The logical fallacies in the text"
    )


class CombinedAnalysisAPI(BaseModel):
    analysis: dict[str, list[LogicalFallacyAPI]] = Field(
        description="Analysis results organized by fallacy type",
        default_factory=lambda: {
            "ad_hominem": [],
            "discrediting_sources": [],
            "emotion_fallacy": [],
            "false_dichotomy": [],
            "fear_mongering": [],
            "non_sequitur": [],
            "scapegoating": [],
            "good_sources": [],
            "presenting_other_side": [],
        },
    )


# This is the final output to the server (where it is a list of LogicalFallaciesComplete)
@dataclass
class LogicalFallacyServer:
    reason: str
    quote: str
    rating: int
    explanation: str


@dataclass
class LogicalFallacyServerList:
    logical_fallacies: list[LogicalFallacyServer] = field(default_factory=list)
    error: str | None = None


# although this is ugly, i dont expect this list to change throughout the project.
@dataclass
class LogicalFallacyComplete:
    ad_hominem: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )
    discrediting_sources: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )
    emotion_fallacy: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )
    false_dichotomy: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )
    fear_mongering: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )
    good_sources: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )
    non_sequitur: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )
    presenting_other_side: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )
    scapegoating: LogicalFallacyServerList = field(
        default_factory=LogicalFallacyServerList
    )


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
    lean: str = ""
    lean_explanation: str = ""
    topics: list[str] = field(default_factory=list)
    tag: str = ""
    contextualization: str = ""
    logical_fallacies: LogicalFallacyComplete = field(
        default_factory=LogicalFallacyComplete
    )

    # fields for the database
    # These fields are set by the database and should not be set manually
    id: str = None
    created_at: datetime = None
