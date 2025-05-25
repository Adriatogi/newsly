import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.db import get_all_articles, update_article
from app.newsly_types import NewslyArticle


def fix_lean_column():
    articles = get_all_articles()
    updated_count = 0

    for article in articles:
        lean = getattr(article, "lean", None)
        if not isinstance(lean, dict):
            continue

        # If it has "predicted_bias" but not "predicted_lean"
        if "predicted_bias" in lean:
            lean["predicted_lean"] = lean.pop("predicted_bias")
            # Update the article's lean field
            article.lean = lean
            update_article(article)
            updated_count += 1
            print(f"Updated article ID {article.id}")

    print(f"Done. Updated {updated_count} articles.")


if __name__ == "__main__":
    fix_lean_column()
