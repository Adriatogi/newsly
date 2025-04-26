import torch
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline


async def llm_summarize(text: str) -> str:
    return "summary of text"
    # summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    # summary = summarizer(text, max_length=130, min_length=40, do_sample=False)
    # return summary[0]["summary_text"]


async def political_bias(text: str) -> dict:
    tokenizer = AutoTokenizer.from_pretrained("bucketresearch/politicalBiasBERT")
    model = AutoModelForSequenceClassification.from_pretrained(
        "bucketresearch/politicalBiasBERT"
    )

    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    outputs = model(**inputs)
    logits = outputs.logits

    raw_probabilities = torch.softmax(logits, dim=1)

    predicted_class = torch.argmax(raw_probabilities, dim=1).item()
    probabilities = raw_probabilities[0].tolist()

    class_labels = ["left", "center", "right"]
    predicted_bias = class_labels[predicted_class]

    return {
        "probabilities": {
            "left": probabilities[0],
            "center": probabilities[1],
            "right": probabilities[2],
        },
        "predicted_bias": predicted_bias,
    }
