import modal
from typing import Any, Dict
from dotenv import load_dotenv

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
        temperature=0.0,  # more deterministic, less hallucination
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
