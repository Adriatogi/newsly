#!/usr/bin/env python
import asyncio
import json
import click
from app.utils import process_article_db, analyze_article


async def process_article_wrapper(url):
    return await process_article_db(url)

async def analyze_article_wrapper(url):
    return await analyze_article(url)

@click.group()
def cli():
    """Article analysis tool."""
    pass


@cli.command()
@click.argument("url")
@click.option("--json_output", is_flag=True, help="Output as JSON")
def process_article(url, json_output):
    """Analyze an article from the given URL."""
    result = asyncio.run(process_article_wrapper(url))

    if json_output:
        click.echo(json.dumps(result, indent=2))
    else:
        for key, value in result.items():
            click.echo(f"{key}: {value}")
        # Add other fields as needed

@click.command()
@click.argument("url")
@click.option("--json_output", is_flag=True, help="Output as JSON")
def parse_article(url, json_output):
    """Parse an article from the given URL."""
    result = asyncio.run(parse_article(url))

    if json_output:
        click.echo(json.dumps(result, indent=2))

@cli.command()
@click.argument("url")
@click.option("--json_output", is_flag=True, help="Output as JSON")
def analyze(url, json_output):
    """Analyze an article from the given URL."""
    result = asyncio.run(analyze_article_wrapper(url))

    if json_output:
        click.echo(json.dumps(result, indent=2))

if __name__ == "__main__":
    cli()
