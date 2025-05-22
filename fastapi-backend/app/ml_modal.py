import modal

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
async def political_bias(text: str) -> dict:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch

    print("Starting political bias analysis...")

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
    predicted_bias = class_labels[predicted_class]

    print(f"Predicted bias: {predicted_bias}")
    print(f"Raw probabilities: {probabilities}")

    probabilities_dict = {
        "left": float(probabilities[0]),
        "center": float(probabilities[1]),
        "right": float(probabilities[2])
    }

    data = {
        "probabilities": probabilities_dict,
        "predicted_bias": str(predicted_bias)
    }
    
    print("Final data structure being returned:", data)
    return data


@app.function(
    gpu="L4",
    image=image,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
    scaledown_window=IDLE_TIMEOUT,
)
async def extract_topics(text: str) -> list[str]:
    from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

    topics = []

    tokenizer = AutoTokenizer.from_pretrained("dslim/bert-base-NER")
    model = AutoModelForTokenClassification.from_pretrained("dslim/bert-base-NER")

    ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer)
    entities = ner_pipeline(text)

    # Filter out entities with low confidence scores
    # TODO: include confidence score in output to make it more transparent?
    possible_topics = set()
    for entity in entities:
        if entity["score"] > 0.85 and entity["word"] not in possible_topics:
            possible_topics.add(entity["word"])

    topics = list(possible_topics)
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
async def bias_explanation(text: str, predicted_bias: str, probabilities: dict) -> str:
    from transformers import pipeline

    print("Starting bias explanation generation...")

    explainer = pipeline("text-generation", model="gpt2-medium")
    prompt = f"""
    Based on the article text, explain why it was classified as {predicted_bias} leaning.
    Focus on specific examples from the text and explain the reasoning.
    If it enriches the explanation, pull from the model's confidence in this classification given
    {probabilities[predicted_bias]:.2f}, but don't mention it directly or get too technical/verbose. 

    Article text:
    {text}

    Explanation:
    """
    explanation = explainer(prompt, max_length=1024, do_sample=False)
    return explanation[0].get("generated_text", explanation[0].get("text", ""))
