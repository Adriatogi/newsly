import modal

cuda_version = "12.4.0"  # should be no greater than host CUDA version
flavor = "devel"  #  includes full CUDA toolkit
operating_sys = "ubuntu22.04"
tag = f"{cuda_version}-{flavor}-{operating_sys}"

image = (
    # modal.Image.debian_slim(python_version="3.10")
    modal.Image.from_registry(f"nvidia/cuda:{tag}", add_python="3.10")
    .pip_install("torch")
    .pip_install("transformers")
    .pip_install("huggingface_hub[hf_xet]")
)
app = modal.App(name="newsly-modal-test")


# create a volume for huggingface cache
MODELS_DIR = "/models"
POLITICAL_BIAS_MODEL_NAME = "bucketresearch/politicalBiasBERT"

hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)


@app.function(
    gpu="L4",
    image=image,
    volumes={"/root/.cache/huggingface": hf_cache_vol},
)
def summarize(text: str) -> str:
    from transformers import pipeline
    import torch

    # Check if CUDA is available
    print("cuda available:", torch.cuda.is_available())

    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    print("model loaded")

    summary = summarizer(text, max_length=130, min_length=40, do_sample=False)

    print("summary:", summary)

    return summary[0]["summary_text"]


@app.function(gpu="L4", image=image, volumes={"/root/.cache/huggingface": hf_cache_vol})
async def political_bias(text: str) -> dict:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch

    # Check if CUDA is available
    print("cuda available:", torch.cuda.is_available())

    tokenizer = AutoTokenizer.from_pretrained("bucketresearch/politicalBiasBERT")
    model = AutoModelForSequenceClassification.from_pretrained(
        "bucketresearch/politicalBiasBERT"
    )

    print("model loaded")

    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    outputs = model(**inputs)
    logits = outputs.logits

    raw_probabilities = torch.softmax(logits, dim=1)

    predicted_class = torch.argmax(raw_probabilities, dim=1).item()
    probabilities = raw_probabilities[0].tolist()

    class_labels = ["left", "center", "right"]
    predicted_bias = class_labels[predicted_class]

    data = {
        "probabilities": {
            "left": probabilities[0],
            "center": probabilities[1],
            "right": probabilities[2],
        },
        "predicted_bias": predicted_bias,
    }
    print("data:", data)
    return data
