#!/usr/bin/env python
import asyncio
import json
import click
from app.server import process_article_db, analyze_article
import app.utils as utils
from app.utils import parse_article
from app.ml_newsly import get_logical_fallacies

async def process_article_wrapper(url, cache=True):
    return await process_article_db(url, cache=cache)


async def analyze_article_wrapper(url):
    article = parse_article(url)        
    if not article:
        raise click.ClickException("Failed to fetch or parse the URL")
    return await analyze_article(article)
    # return await analyze_article(url)


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
        click.echo(json.dumps(result, indent=2))


@cli.command()
@click.argument("url")
@click.option("--json-output", is_flag=True, help="Output as JSON")
@click.option("--test", is_flag=True, help="Run in test mode")
def get_logical(url, json_output, test):

    if test:
        utils.TEST = 1
        print("Test mode enabled")

    article = parse_article(url)
    print("parsed article")
    if not article:
        raise click.ClickException("Failed to fetch or parse the URL")
    
    text = article.text
    result = asyncio.run(get_logical_fallacies(text))

    if json_output:
        # Convert each LogicalFallacies object to a dict
        serializable_result = {k: v.model_dump() for k, v in result.items()}
        click.echo(json.dumps(serializable_result, indent=2))
    

if __name__ == "__main__":
    cli()
