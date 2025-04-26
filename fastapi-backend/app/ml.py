# from transformers import pipeline


async def llm_summarize(text: str) -> str:
    return "summary of text"
    # summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    # summary = summarizer(text, max_length=130, min_length=40, do_sample=False)
    # return summary[0]["summary_text"]
