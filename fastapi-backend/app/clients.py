import os
import time
import aiohttp
import asyncio
import random


async def generate_together(
    model, messages, max_tokens=1024, temperature=0.7, response_format=None, **kwargs
):
    output = None

    key = os.environ.get("TOGETHER_API_KEY")

    for sleep_time in [1, 2, 4, 8, 16, 32]:

        try:
            endpoint = "https://api.together.xyz/v1/chat/completions"

            await asyncio.sleep(2)

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    endpoint,
                    json={
                        "model": model,
                        "max_tokens": max_tokens,
                        "temperature": (temperature if temperature > 1e-4 else 0),
                        "messages": messages,
                        "response_format": (
                            str if response_format is None else response_format
                        ),
                    },
                    headers={
                        "Authorization": f"Bearer {key}",
                    },
                ) as res:
                    response_data = await res.json()

                    if "error" in response_data:
                        print("------------------------------------------")
                        print(f"Model with Error: {model}")
                        print(response_data)
                        print("------------------------------------------")

                        if response_data["error"]["type"] == "invalid_request_error":
                            return None

                    output = response_data["choices"][0]["message"]["content"]
                    break

        except Exception as e:
            print(f"{e} on response")
            random_multiplier = random.uniform(0.5, 1.5)
            # randomize the sleep time to avoid rate limiting
            print(f"Retry in {sleep_time * random_multiplier}s..")
            await asyncio.sleep(sleep_time * random_multiplier)

    if output is None:
        return None

    return output
