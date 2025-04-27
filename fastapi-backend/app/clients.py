import os
import time
import requests

def generate_together(model, messages, max_tokens=1024, temperature=0.7, **kwargs):
    output = None

    key = os.environ.get("TOGETHER_API_KEY")

    for sleep_time in [1, 2, 4, 8, 16, 32]:

        res = None
        try:

            endpoint = "https://api.together.xyz/v1/chat/completions"

            time.sleep(2)

            res = requests.post(
                endpoint,
                json={
                    "model": model,
                    "max_tokens": max_tokens,
                    "temperature": (temperature if temperature > 1e-4 else 0),
                    "messages": messages,
                },
                headers={
                    "Authorization": f"Bearer {key}",
                },
            )
            if "error" in res.json():

                print("------------------------------------------")
                print(f"Model with Error: {model}")
                print(res.json())
                print("------------------------------------------")

                if res.json()["error"]["type"] == "invalid_request_error":
                    return None

            output = res.json()["choices"][0]["message"]["content"]

            break
        except Exception as e:
            response = "failed before response" if res is None else res
            print(f"{e} on response: {response}")
            print(f"Retry in {sleep_time}s..")
            time.sleep(sleep_time)

    if output is None:
        return output

    return output.strip()