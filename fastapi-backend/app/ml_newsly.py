from pydantic import BaseModel, Field, ValidationError
from app.newsly_types import (
    LogicalFallacyServer,
    LogicalFallacyServerList,
    LogicalFallacyListAPI,
    LogicalFallacyComplete,
)
from app.clients import generate_together
from app.utils import extract_json
import app.prompts as prompts

import app.utils as utils
import asyncio


class ArticleAnalysisRequest(BaseModel):
    url: str


try:
    import torch

    if torch.cuda.is_available():
        from transformers import (
            AutoTokenizer,
            AutoModelForSequenceClassification,
            pipeline,
        )

        device = torch.device("cuda")
        print("Using GPU")
    else:
        device = torch.device("cpu")
        print("GPU not available, using CPU")
except ImportError:
    # Fallback if torch is not installed
    device = "cpu"
    print("PyTorch not installed, using CPU")


async def bias_explanation(text: str, predicted_bias: str, probabilities: dict):
    if utils.TEST:
        print("Test active bias explanation")
        return "Test active explanation"

    if device == "cuda":
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
    else:
        prompt = f"""
        Based on the article text, explain why it was classified as {predicted_bias} leaning.
        Focus on specific examples from the text and explain the reasoning.
        If it enriches the explanation, pull from the model's confidence in this classification given
        {probabilities[predicted_bias]:.2f}, but don't mention it directly or get too technical/verbose. 

        Article text:
        {text}

        Provide a clear explanation focusing on:
        1. Key phrases or topics that indicate {predicted_bias} bias
        2. The overall tone and perspective
        3. Specific examples from the text

        Explanation:
        """
        messages = [
            {
                "role": "system",
                "content": "You are a helpful expert well-versed in political bias and the news.",
            },
            {"role": "user", "content": prompt},
        ]

        explanation = generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        return explanation


async def political_bias(text: str) -> dict:

    if utils.TEST:
        print("Test active political bias")
        return {
            "probabilities": {
                "left": 0.3,
                "center": 0.4,
                "right": 0.3,
            },
            "predicted_bias": "test_center",
        }

    if device == "cuda":
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
            {
                "role": "system",
                "content": "You are a helpful assistant that determines the political bias of text.",
            },
            {"role": "user", "content": prompt},
        ]

        response = generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        json_response = extract_json(response)

        return json_response


async def llm_summarize(text: str, max_length: int = 130, min_length: int = 40) -> str:

    if utils.TEST:
        print("Test active summary")
        return "Test active summary"

    if device == "cuda":
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        summary = summarizer(
            text, max_length=max_length, min_length=min_length, do_sample=False
        )
        return summary[0]["summary_text"]
    else:

        prompt = f"""Please provide a concise summary of the following text in {min_length}-{max_length} words:

                Text: {text}

                Summary:
            """
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant that summarizes text.",
            },
            {"role": "user", "content": prompt},
        ]

        summary = generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        # Extract the summary from the response
        return summary


async def extract_topics(text: str) -> list[str]:
    topics = []

    if utils.TEST:
        print("Test active topic scrapping")
        return ["topic_1", "topic_2"]

    if device == "cuda":
        ner_pipeline = pipeline("ner", model="dslim/bert-base-NER", device=0)
        entities = ner_pipeline(text)

        possible_topics = set()
        for entity in entities:
            if entity["score"] > 0.85 and entity["word"] not in topics:
                topics.add(entity["word"])

        topics = list(possible_topics)
        return topics
    else:
        prompt = f"""
            Extract the key political, historical, and cultural topics related to the following text.
            Return only the topics as a comma-separated list.
            
            Text: {text}
            
            Topics:
        """

        messages = [
            {
                "role": "system",
                "content": "You are a helpful, unbiased expert that extracts political, historical, and cultural topics from news article text.",
            },
            {"role": "user", "content": prompt},
        ]

        response = generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=256,
            temperature=0.3,
        )

        topics = [topic.strip() for topic in response.split(",")]
        return topics


async def get_topic_background(topic: str) -> str:
    """
    Helper for getting topic backgrounds for informed contextualizations.
    """
    prompt = f"Provide a concise, unbiased explanation or historical context for the topic: '{topic}'."
    messages = [
        {
            "role": "system",
            "content": "You are a knowledgeable assistant providing background information.",
        },
        {"role": "user", "content": prompt},
    ]
    background = generate_together(
        model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages=messages,
        max_tokens=128,
        temperature=0.3,
    )
    return background.strip()


async def contextualize_article(text: str, topics: list[str]) -> dict:
    if utils.TEST:
        print("Test active contextualization")
        return {
            "topics": topics,
            "contextualization": "Test active contextualization of the article's broader context.",
        }

    if device == "cuda":
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

    else:
        prompt = f"""
        You are an expert analyst of political, cultural, and historical discourse.

        Article excerpt:
        {text}

        Key extracted topics:
        {', '.join(topics)}

        Please provide a nuanced discussion (1-2 concise paragraphs) of the historical,
        cultural, and political context that informs these topics as they appear
        in the article. The topics are related to the article and must be referenced. The relevance of topics
        to the articlemust be mentioned in the contextualization.
        Return a JSON object with the fields:
        {{
        "topics": [...],               
        "contextualization": "..."     
        }}
        """

        messages = [
            {
                "role": "system",
                "content": "You are a knowledgeable, unbiased expert providing contextual analysis.",
            },
            {"role": "user", "content": prompt},
        ]
        contextualization = generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )

        return contextualization


async def get_logical_fallacies(text: str, sequential: bool = False) -> dict:
    if sequential:
        ad_hominem = await get_ad_hominem(text)
        discrediting_sources = await get_discrediting_sources(text)
        emotion_fallacy = await get_emotion_fallacy(text)
        false_dichotomy = await get_false_dichotomy(text)
        fear_mongering = await get_fear_mongering(text)
        good_sources = await get_good_sources(text)
        non_sequitur = await get_non_sequitur(text)
        presenting_other_side = await get_presenting_other_side(text)
        scapegoating = await get_scapegoating(text)
    else:
        (
            ad_hominem,
            discrediting_sources,
            emotion_fallacy,
            false_dichotomy,
            fear_mongering,
            good_sources,
            non_sequitur,
            presenting_other_side,
            scapegoating,
        ) = await asyncio.gather(
            get_ad_hominem(text),
            get_discrediting_sources(text),
            get_emotion_fallacy(text),
            get_false_dichotomy(text),
            get_fear_mongering(text),
            get_good_sources(text),
            get_non_sequitur(text),
            get_presenting_other_side(text),
            get_scapegoating(text),
        )

    return LogicalFallacyComplete(
        ad_hominem=ad_hominem,
        discrediting_sources=discrediting_sources,
        emotion_fallacy=emotion_fallacy,
        false_dichotomy=false_dichotomy,
        fear_mongering=fear_mongering,
        good_sources=good_sources,
        non_sequitur=non_sequitur,
        presenting_other_side=presenting_other_side,
        scapegoating=scapegoating,
    )


async def get_logical_fallacy_response(
    text: str, prompt_fn: str, system_message: str, test_reason: str = None
) -> LogicalFallacyServerList:
    """
    Helper to call the LLM, handle errors, and return a LogicalFallacyResponse.
    If utils.TEST is True and test_reason is provided, returns a test LogicalFallacyResponse.
    """
    if utils.TEST and test_reason:
        print(f"Test active {test_reason}")
        return LogicalFallacyServerList(
            logical_fallacies=[
                LogicalFallacyServer(
                    reason=f"Test active {test_reason}",
                    quote=f"Test active {test_reason}",
                    rating=1,
                    explanation=f"Test active {test_reason}",
                )
            ],
            error=None,
        )

    print(f"Running {test_reason}")

    prompt = prompt_fn.format(text=text)

    error = None
    json_response = None
    try:
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ]
        response = generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
            response_format={
                "type": "json_object",
                "schema": LogicalFallacyListAPI.model_json_schema(),
            },
        )
        json_response = LogicalFallacyListAPI.model_validate_json(response)

    except Exception as e:
        print("Error getting logical fallacies: ", e)
        error = e

    # get list of logical fallacies from json_response (to avoid double keying)
    logical_fallacies = json_response.logical_fallacies

    logical_fallacies_complete = []
    for fallacy in logical_fallacies:

        # check that quote actually exists in the text
        if fallacy.quote not in text:
            print(f"Quote {fallacy.quote} not found in text. Skipping...")
            continue

        logical_fallacies_complete.append(
            LogicalFallacyServer(
                reason=fallacy.reason,
                quote=fallacy.quote,
                rating=fallacy.rating,
                explanation=fallacy.explanation,
            )
        )

    return LogicalFallacyServerList(
        logical_fallacies=logical_fallacies_complete, error=error
    )


async def get_ad_hominem(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.ad_hominem,
        "You are a helpful assistant that identifies ad hominem attacks in text.",
        test_reason="ad hominem",
    )


async def get_discrediting_sources(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.discrediting_sources,
        "You are a helpful assistant that identifies discrediting sources in text.",
        test_reason="discrediting sources",
    )


async def get_emotion_fallacy(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.emotion_fallacy,
        "You are a helpful assistant that identifies emotion fallacy in text.",
        test_reason="emotion fallacy",
    )


async def get_false_dichotomy(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.false_dichotomy_fallacy,
        "You are a helpful assistant that identifies false dichotomies in text.",
        test_reason="false dichotomy",
    )


async def get_fear_mongering(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.fear_mongering_fallacy,
        "You are a helpful assistant that identifies fear mongering in text.",
        test_reason="fear mongering",
    )


async def get_good_sources(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.good_sources,
        "You are a helpful assistant that identifies good sources in text.",
        test_reason="good sources",
    )


async def get_non_sequitur(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.non_sequitur,
        "You are a helpful assistant that identifies non-sequiturs in text.",
        test_reason="non-sequitur",
    )


async def get_presenting_other_side(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.presenting_other_side,
        "You are a helpful assistant that identifies presenting the other side in text.",
        test_reason="presenting the other side",
    )


async def get_scapegoating(text: str) -> LogicalFallacyServerList:
    return await get_logical_fallacy_response(
        text,
        prompts.scapegoating,
        "You are a helpful assistant that identifies scapegoating in text.",
        test_reason="scapegoating",
    )
