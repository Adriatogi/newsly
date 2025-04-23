#!/usr/bin/env python
import asyncio
import json as pyjson
import click
from app.utils import analyze_article_logic


async def analyze_article(url):
    return await analyze_article_logic(url)


@click.group()
def cli():
    """Article analysis tool."""
    pass


@cli.command()
@click.argument("url")
@click.option("--json", is_flag=True, help="Output as JSON")
def analyze(url, json):
    """Analyze an article from the given URL."""
    result = asyncio.run(analyze_article(url))

    if json:
        click.echo(pyjson.dumps(result, indent=2))
    else:
        for key, value in result.items():
            click.echo(f"{key}: {value}")
        # Add other fields as needed


if __name__ == "__main__":
    cli()
