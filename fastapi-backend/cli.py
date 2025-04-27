#!/usr/bin/env python
import asyncio
import json
import click
from app.server import process_article_db, analyze_article


async def process_article_wrapper(url, test_mode=False):
    return await process_article_db(url, test_mode=test_mode)


async def analyze_article_wrapper(url, test_mode=False):
    return await analyze_article(url, test_mode=test_mode)


@click.group()
def cli():
    """Article analysis tool."""
    pass


@cli.command()
@click.argument("url")
@click.option("--json-output", is_flag=True, help="Output as JSON")
@click.option("--test-mode", is_flag=True, help="Run in test mode")
def process_article(url, json_output, test_mode):
    """Analyze an article from the given URL."""
    result = asyncio.run(process_article_wrapper(url, test_mode=test_mode))

    if json_output:
        click.echo(json.dumps(result, indent=2))
    else:
        for key, value in result.items():
            click.echo(f"{key}: {value}")
        # Add other fields as needed


@cli.command()
@click.argument("url")
@click.option("--json-output", is_flag=True, help="Output as JSON")
def parse_article(url, json_output):
    """Parse an article from the given URL."""
    result = asyncio.run(parse_article(url))

    if json_output:
        click.echo(json.dumps(result, indent=2))


@cli.command()
@click.argument("url")
@click.option("--json-output", is_flag=True, help="Output as JSON")
@click.option("--test-mode", is_flag=True, help="Run in test mode")
def analyze(url, json_output, test_mode):
    """Analyze an article from the given URL."""
    result = asyncio.run(analyze_article_wrapper(url, test_mode=test_mode))

    if json_output:
        click.echo(json.dumps(result, indent=2))


if __name__ == "__main__":
    cli()
