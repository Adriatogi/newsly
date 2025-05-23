import modal
from typing import Any, Dict

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
)
app = modal.App(name="newsly-modal-test")


# create a volume for huggingface cache
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)


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
    summary = summarizer(text, max_length=130, min_length=40, do_sample=False)

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
async def extract_topics(text: str) -> list[str]:
    from keybert import KeyBERT

    kw_model = KeyBERT()
    keywords = kw_model.extract_keywords(text)
    print("keywords:", keywords)
    topics = [keyword[0] for keyword in keywords]
    return topics


@app.function(
    gpu="L4",
    image=image,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
async def contextualize_article(text: str, topics: list[str]) -> dict:
    from transformers import pipeline

    context_pipe = pipeline(
        "text2text-generation", model="google/flan-t5-large", device=0
    )
    prompt = (
        "You are an expert in modern and historical political discourse.\n\n"
        f"Article excerpt:\n{text}\n\n"
        f"Key topics: {', '.join(topics)}\n\n"
        "Please return a JSON object with fields 'topics' and 'contextualization', where 'contextualization' is 1-2 concise paragraphs relating the topics to the article."
    )
    contextualization = context_pipe(prompt, max_length=1024, do_sample=False)
    return contextualization[0].get(
        "generated_text", contextualization[0].get("text", "")
    )


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
