from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from app.clients import generate_together
from app.utils import extract_json

class ArticleAnalysisRequest(BaseModel):
    url: str

try:
    import torch
    if torch.cuda.is_available():
        device = torch.device('cuda')
        print("Using GPU")
    else:
        device = torch.device('cpu')
        print("GPU not available, using CPU")
except ImportError:
    # Fallback if torch is not installed
    device = 'cpu'
    print("PyTorch not installed, using CPU")



async def political_bias(text: str, test_mode=False) -> dict:

    if test_mode:
        return {
            "probabilities": {
                "left": 0.3,
                "center": 0.4,
                "right": 0.3,
            },
            "predicted_bias": "test_mode_center",
        }

    if device == 'cuda':
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
    else:
        prompt = f"""
            looking at the following text, please determine the political bias of the text.
            Text: {text}

            Please return the answer in the following format:
            {{
                "probabilities": {{
                    "left": 0.3,
                    "center": 0.4,
                    "right": 0.3
                }},
                "predicted_bias": "center"
            }}
        """

        messages = [
            {"role": "system", "content": "You are a helpful assistant that determines the political bias of text."},
            {"role": "user", "content": prompt}
        ]

        response = generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        json_response = extract_json(response)

        return json_response

async def llm_summarize(text: str, max_length: int = 130, min_length: int = 40, test_mode=False) -> str:

    if test_mode:
        return "Test mode active summary"

    if device == 'cuda':
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        summary = summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)
        return summary[0]["summary_text"]
    else:
        
        prompt = f"""Please provide a concise summary of the following text in {min_length}-{max_length} words:

                Text: {text}

                Summary:
            """
        messages = [
            {"role": "system", "content": "You are a helpful assistant that summarizes text."},
            {"role": "user", "content": prompt}
        ]
        
        summary = generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )
        
        # Extract the summary from the response
        return summary
