import modal
from typing import Any, Dict
from dotenv import load_dotenv
from app.prompts import (
    ad_hominem,
    discrediting_sources,
    emotion_fallacy,
    false_dichotomy_fallacy,
    fear_mongering_fallacy,
    good_sources,
    non_sequitur,
    presenting_other_side,
    scapegoating,
)
import json
import re

# settings for timeout
IDLE_TIMEOUT = 60  # seconds

# Setup image and app
tag = "12.4.0-devel-ubuntu22.04"
image = (
    modal.Image.from_registry(f"nvidia/cuda:{tag}", add_python="3.10")
    # modal.Image.debian_slim(python_version="3.10") # use this if we don't need CUDA
    .pip_install("torch")
    .pip_install("transformers")
    .pip_install("huggingface_hub[hf_xet]")
    .pip_install("keybert")
    .pip_install("python-dotenv")
)
app = modal.App(name="newsly-modal-test")


# create a volume for huggingface cache
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

# load .env
load_dotenv()


@app.function(
    gpu="L4",
    image=image,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
def summarize(text: str) -> str:
    print("starting summarization")

    from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

    # get the model and tokenizer
    model = AutoModelForSeq2SeqLM.from_pretrained("facebook/bart-large-cnn")
    tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
    max_input_tokens = model.config.max_position_embeddings

    print("model loaded")

    # Truncate to max input tokens
    tokens = tokenizer.encode(text, truncation=False)
    print("number of tokens:", len(tokens))
    if len(tokens) > max_input_tokens:
        tokens = tokens[: max_input_tokens - 1]
        text = tokenizer.decode(tokens, skip_special_tokens=True)

    # Summarizer pipeline
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    summary = summarizer(
        text,
        max_length=130,
        min_length=40,
        do_sample=False,
        num_beams=4,
        early_stopping=True,
    )
    print("summary:", summary)
    return summary[0]["summary_text"]


@app.function(
    gpu="L4",
    image=image,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
async def political_lean(text: str) -> dict:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch

    print("Starting political lean analysis...")

    tokenizer = AutoTokenizer.from_pretrained("bucketresearch/politicalBiasBERT")
    model = AutoModelForSequenceClassification.from_pretrained(
        "bucketresearch/politicalBiasBERT"
    )

    print("Model loaded successfully")

    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    outputs = model(**inputs)
    logits = outputs.logits

    raw_probabilities = torch.softmax(logits, dim=1)
    predicted_class = torch.argmax(raw_probabilities, dim=1).item()
    probabilities = raw_probabilities[0].tolist()

    class_labels = ["left", "center", "right"]
    predicted_lean = class_labels[predicted_class]

    print(f"Predicted lean: {predicted_lean}")
    print(f"Raw probabilities: {probabilities}")

    probabilities_dict = {
        "left": float(probabilities[0]),
        "center": float(probabilities[1]),
        "right": float(probabilities[2]),
    }

    data = {"probabilities": probabilities_dict, "predicted_lean": str(predicted_lean)}

    print("Final data structure being returned:", data)
    return data


@app.function(
    gpu="L4",
    image=image,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
async def get_keywords(text: str) -> dict:
    from keybert import KeyBERT

    kw_model = KeyBERT()
    keywords = kw_model.extract_keywords(text)
    words = [keyword[0] for keyword in keywords]
    return words


@app.function(
    gpu="L40S",
    image=image,
    secrets=[modal.Secret.from_name("huggingface-secret")],
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
async def get_tag(text: str) -> str:
    from transformers import pipeline
    import re
    import os

    hf_token = os.environ["HF_TOKEN"]

    pipe = pipeline(
        "text-generation",
        model="meta-llama/Llama-3.1-8B-Instruct",
        token=hf_token,
        trust_remote_code=True,
        # load_in_4bit=True,
    )

    prompt = """Given the following text;
{text}

    extract a single tag from the following list:
•	Politics & Government
•	Business & Economy
•	Health & Science
•	Technology & Innovation
•	Social Issues & Inequality
•	Crime & Law
•	World Affairs
•	Environment & Climate
•	Culture & Entertainment
•	Sports
•	Education
•	Opinion & Editorial
•	Religion & Ethics

The output should be the tag and nothing else.
    """

    retry = 0
    while retry < 3:

        result = pipe(
            prompt.format(text=text),
            max_new_tokens=10,
            do_sample=True,
            temperature=0.3,
            return_full_text=False,
            pad_token_id=pipe.tokenizer.eos_token_id,
        )
        print(result)

        tag = result[0]["generated_text"].split("\n")[0].strip()
        tag = re.sub(r"^[^\w\s&]+|[^\w\s&]+$", "", tag)

        valid_tags = [
            "Politics & Government",
            "Business & Economy",
            "Health & Science",
            "Technology & Innovation",
            "Social Issues & Inequality",
            "Crime & Law",
            "World Affairs",
            "Environment & Climate",
            "Culture & Entertainment",
            "Sports",
            "Education",
            "Opinion & Editorial",
            "Religion & Ethics",
        ]

        # Find the best match
        if tag not in valid_tags:
            retry += 1
            print(f"Invalid tag: {tag}, retrying...")
            continue

        break

    return tag


@app.function(
    gpu="L40S",
    image=image,
    secrets=[modal.Secret.from_name("huggingface-secret")],
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
async def extract_topics(text: str, n_topics: int = 3) -> dict:
    from transformers import pipeline
    import re
    import os

    hf_token = os.environ["HF_TOKEN"]

    pipe = pipeline(
        "text-generation",
        model="meta-llama/Llama-3.1-8B-Instruct",
        temperature=0.3,
        token=hf_token,
        # load_in_4bit=True,
    )

    prompt = """Extract the main topics into a list of strings of 1-2 words.
    It should come from the following text: {text}
    The output should be the list and nothing else.
    It should look like this: ["topic1", "topic2", "topic3"]
    The list should contain up to {n_topics} topics. 
    """

    retry = 0
    while retry < 3:
        result = pipe(
            prompt.format(n_topics=n_topics, text=text),
            max_new_tokens=50,
            do_sample=True,
            return_full_text=False,
        )
        print(f"Result: {result}")
        topics = result[0]["generated_text"]
        topics = re.search(r'\[(?:\s*"[^"]*"\s*,?)*\]', topics)
        if not topics:
            retry += 1
            continue

        try:
            topics = topics.group(0)
            topics = eval(topics)
            break
        except Exception as e:
            print(f"Error evaluating topics: {e}")
            retry += 1
            continue

    if retry == 3:
        print("Failed to extract topics")
        return {"topics": []}

    print(f"Topics: {topics}")
    return {"topics": topics}


@app.function(
    gpu="L4",
    image=image,
    secrets=[modal.Secret.from_name("huggingface-secret")],
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
async def contextualize_article(text: str) -> dict:
    from transformers import pipeline
    import os
    import re

    hf_token = os.environ["HF_TOKEN"]

    # First extract topics
    topics_result = extract_topics.remote(text)
    topics = topics_result["topics"]

    # Then generate contextualization using Llama
    context_pipe = pipeline(
        "text-generation",
        model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
        token=hf_token,
        temperature=0.3,
    )

    prompt = f"""You are an expert analyst of political, cultural, and historical discourse.

    Given the article excerpt: {text}
    and the following topics identified within it: {', '.join(topics)}

    Write a single, concise paragraph that analyzes how historical, cultural, and political factors relate to and shape these topics in the context of the article. Do not include headings, bullet points, or lists. Your response should be fluid, academic in tone, and approximately 5–6 sentences long. Output only the paragraph.

    Contextualization:"""

    result = context_pipe(
        prompt,
        max_new_tokens=512,
        do_sample=True,
        return_full_text=False,
    )

    contextualization = result[0]["generated_text"].strip()
    print("Contextualization:", contextualization)
    return contextualization


@app.function(
    gpu="L4",
    image=image,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
async def lean_explanation(
    text: str, predicted_lean: str, lean_probability: float
) -> str:
    """
    Generate an explanation for the predicted political lean of an article.
    """
    print("Starting lean explanation generation...")

    from transformers import pipeline, AutoTokenizer

    # Load tokenizer to check input length
    tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-large")
    tokens = tokenizer.encode(text)

    # Truncate text if it's too long (leave room for the prompt)
    max_input_tokens = 200  # Reduced to ensure we're well under 512 token limit
    if len(tokens) > max_input_tokens:
        text = tokenizer.decode(tokens[:max_input_tokens])

    explainer = pipeline("text2text-generation", model="google/flan-t5-large", device=0)
    prompt = f"""Analyze {predicted_lean} lean ({lean_probability:.2f} confidence) based on the following article:
    {text}

    Your analysis must consider: topics, word choice, framing, and perspective.

    Analysis:"""
    explanation = explainer(
        prompt, max_new_tokens=1024, do_sample=True, temperature=0.7
    )
    result = explanation[0].get("generated_text", explanation[0].get("text", ""))
    print("\nGenerated explanation:", result)
    return result


@app.function(
    gpu="A100-80GB",
    image=image,
    secrets=[modal.Secret.from_name("huggingface-secret")],
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
    timeout=600,
)
async def get_logical_fallacies(text: str, fallacy_type: str, prompt: str) -> dict:
    """
    Detect logical fallacies in text using Llama 3.1-8B-Instruct.
    """
    from transformers import AutoTokenizer, AutoModelForCausalLM
    import os

    hf_token = os.environ["HF_TOKEN"]

    # Explicitly set cache directory
    os.environ["HF_HOME"] = "/root/.cache/huggingface"
    os.environ["TRANSFORMERS_CACHE"] = "/root/.cache/huggingface"

    formatted_prompt = prompt.format(text=text)
    print(f"Formatted prompt: {formatted_prompt}")

    # Load with explicit cache directory
    tokenizer = AutoTokenizer.from_pretrained(
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
        token=hf_token,
        cache_dir="/root/.cache/huggingface",
    )

    # Set pad token if it doesn't exist
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
        token=hf_token,
        cache_dir="/root/.cache/huggingface",
    )

    retry = 0
    max_retries = 3
    error = None

    while retry < max_retries:
        try:
            inputs = tokenizer(
                formatted_prompt,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=2048,
            )
            outputs = model.generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,  # Add attention mask
                max_new_tokens=1024,
                do_sample=True,
                temperature=0.7,
                pad_token_id=tokenizer.eos_token_id,  # Set pad token ID
            )
            response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

            # Remove the input prompt from response
            response_text = response_text[len(formatted_prompt) :].strip()

            print(f"Raw response for {fallacy_type}: {response_text}")

            json_response = extract_json(response_text)

            if json_response and "logical_fallacies" in json_response:
                # Validate the structure
                logical_fallacies = json_response["logical_fallacies"]

                # Filter out fallacies with missing quotes
                valid_fallacies = []
                for fallacy in logical_fallacies:
                    if (
                        isinstance(fallacy, dict)
                        and fallacy.get("quote")
                        and fallacy.get("reason")
                        and fallacy.get("explanation")
                        and fallacy.get("rating")
                    ):
                        valid_fallacies.append(
                            {
                                "quote": fallacy["quote"],
                                "reason": fallacy["reason"],
                                "explanation": fallacy["explanation"],
                                "rating": int(fallacy["rating"]),
                            }
                        )

                return {"logical_fallacies": valid_fallacies, "error": None}
            else:
                print(f"Invalid JSON response for {fallacy_type}, retrying...")
                retry += 1
                continue

        except Exception as e:
            print(f"Error processing {fallacy_type}: {e}")
            error = e
            retry += 1
            continue

    # If all retries failed
    return {
        "logical_fallacies": [],
        "error": f"Failed to process {fallacy_type} after {max_retries} retries. Last error: {error}",
    }


# since we are using a modal function, we can't use the utils.py file
def extract_json(text: str):
    block_matches = list(re.finditer(r"```(?:json)?\\s*(.*?)```", text, re.DOTALL))
    bracket_matches = list(re.finditer(r"\{.*?\}", text, re.DOTALL))

    # SE(01/20/2025): we take the last match because the model may output
    # multiple JSON blocks and often
    if block_matches:
        json_str = block_matches[-1].group(1).strip()
    elif bracket_matches:
        json_str = bracket_matches[-1].group(0)
    else:
        json_str = text

    # Clean up the string - handle escaped newlines and nested JSON
    json_str = json_str.replace("\\n", "\n").replace('\\"', '"')

    try:
        # First try direct parsing
        json_obj = json.loads(json_str)
        return json_obj
    except json.JSONDecodeError:
        try:
            # Try with regex to extract JSON objects from text that might contain other content
            matches = re.findall(
                r"\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}", json_str
            )
            if matches:
                return json.loads(matches[0])
        except:
            pass

        # If all parsing attempts fail
        return None
