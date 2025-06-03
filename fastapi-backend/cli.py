#!/usr/bin/env python
import asyncio
import json
import click
from app.server import process_article_db, analyze_article
import app.utils as utils
from app.utils import parse_article
from app.ml_newsly import get_combined_logical_fallacies
from app.ml_modal import extract_topics
import dataclasses


async def process_article_wrapper(url, cache=True):
    return await process_article_db(url, cache=cache)


async def analyze_article_wrapper(url):
    article = parse_article(url)
    if not article:
        raise click.ClickException("Failed to fetch or parse the URL")
    await analyze_article(article)
    return article


@click.group()
def cli():
    """Article analysis tool."""
    pass


@cli.command()
@click.argument("url")
@click.option("--json-output", is_flag=True, help="Output as JSON")
@click.option("--test", is_flag=True, help="Run in test mode")
@click.option("--no-cache", is_flag=True, help="Cache the article")
def process_article(url, json_output, test, no_cache):

    if test:
        utils.TEST = 1

    """Analyze an article from the given URL."""

    if test:
        no_cache = True

    result = asyncio.run(process_article_wrapper(url, cache=not no_cache))

    if json_output:
        click.echo(json.dumps(result, indent=2))
    else:
        for key, value in result.items():
            click.echo(f"{key}: {value}")
        # Add other fields as needed


@cli.command()
@click.argument("url")
@click.option("--json-output", is_flag=True, help="Output as JSON")
def parse(url, json_output):
    """Parse an article from the given URL."""
    result = asyncio.run(parse_article(url))

    if json_output:
        click.echo(json.dumps(result, indent=2))


@cli.command()
@click.argument("url")
@click.option("--json-output", is_flag=True, help="Output as JSON")
@click.option("--test", is_flag=True, help="Run in test mode")
def analyze(url, json_output, test):

    if test:
        utils.TEST = 1

    """Analyze an article from the given URL."""
    result = asyncio.run(analyze_article_wrapper(url))

    if json_output:
        # Convert NewslyArticle to dict before JSON serialization
        result_dict = dataclasses.asdict(result)
        click.echo(json.dumps(result_dict, indent=2))
    else:
        # Print each field in a readable format
        click.echo("\nArticle Analysis Results:")
        click.echo("------------------------")
        click.echo(f"Title: {result.title}")
        click.echo(f"URL: {result.url}")
        click.echo(f"Source: {result.source}")
        click.echo(f"Date: {result.date}")
        click.echo(f"Authors: {', '.join(result.authors)}")
        click.echo("\nSummary:")
        click.echo(result.summary)
        click.echo("\nLean Analysis:")
        click.echo(f"Predicted Lean: {result.lean['predicted_lean']}")
        click.echo("Probabilities:")
        for lean, prob in result.lean["probabilities"].items():
            click.echo(f"  {lean}: {prob:.2%}")
        click.echo("\nLean Explanation:")
        click.echo(result.lean_explanation)
        click.echo("\nTopics:")
        for topic in result.topics:
            click.echo(f"  - {topic}")
        click.echo("\nContextualization:")
        click.echo(result.contextualization)
        click.echo("\nLogical Fallacies:")
        for fallacy_type, fallacy_data in result.logical_fallacies.items():
            click.echo(f"\n{fallacy_type}:")
            click.echo(f"  Found: {fallacy_data['found']}")
            if fallacy_data["found"]:
                click.echo(f"  Explanation: {fallacy_data['explanation']}")
                if "error" in fallacy_data:
                    click.echo(f"  Error: {fallacy_data['error']}")


@cli.command()
@click.argument("url")
@click.option("--json-output", is_flag=True, help="Output as JSON")
@click.option("--test", is_flag=True, help="Run in test mode")
@click.option("--sequential", is_flag=True, help="Run sequentially")
def get_logical(url, json_output, test, sequential):

    if test:
        utils.TEST = 1
        print("Test mode enabled")

    article = parse_article(url)
    print("parsed article")
    if not article:
        raise click.ClickException("Failed to fetch or parse the URL")

    text = article.text
    result = asyncio.run(get_combined_logical_fallacies(text))

    if json_output:
        # Convert each LogicalFallacies object to a dict
        serializable_result = dataclasses.asdict(result)
        click.echo(json.dumps(serializable_result, indent=2))


@cli.command()
@click.argument("url")
def get_topics(url):
    import modal

    modal_extract_topics = modal.Function.from_name(
        "newsly-modal-test", "extract_topics"
    )

    article = parse_article(url)
    if not article:
        raise click.ClickException("Failed to fetch or parse the URL")

    topics = asyncio.run(modal_extract_topics.remote.aio(article.text))

    click.echo(topics)


if __name__ == "__main__":
    cli()
