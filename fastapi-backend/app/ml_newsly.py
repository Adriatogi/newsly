from pydantic import BaseModel, Field, ValidationError
from app.newsly_types import (
    LogicalFallacyServer,
    LogicalFallacyServerList,
    LogicalFallacyListAPI,
    LogicalFallacyComplete,
    CombinedAnalysisAPI,
)
from app.clients import generate_together
from app.utils import extract_json
import app.prompts as prompts

import app.utils as utils
import asyncio
import time


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


async def lean_explanation(
    text: str, predicted_lean: str, lean_probability: float
) -> str:
    if utils.TEST:
        print("Test lean explanation")
        return "Test lean explanation"

    prompt = f"""
    Provide a brief analysis of the political leaning of the following article, which has been classified as {predicted_lean} with a confidence level of {lean_probability:.2f} out of 1.
    Include an overall assessment of how the content, language, and tone aligns with {predicted_lean} viewpoints.
    The output should be no more than five to six complete sentences and nothing else.

    If it helps the analysis, you can use short quotes from the article to support.

    Article:
    {text}

    Analysis:
"""

    def extract_explanation(output: str) -> str:
        marker = "Analysis:"
        idx = output.find(marker)
        if idx != -1:
            return output[idx + len(marker) :].strip()
        return output.strip()

    if device == "cuda":
        from transformers import pipeline, AutoTokenizer

        model_name = "microsoft/phi-3-mini-128k-instruct"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        explainer = pipeline(
            "text-generation", model=model_name, tokenizer=tokenizer, device=0
        )

        import asyncio

        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: explainer(
                prompt,
                max_new_tokens=512,
                do_sample=True,
                temperature=0.3,
                top_p=0.9,
                repetition_penalty=1.2,
            ),
        )
        raw_output = result[0].get("generated_text", result[0].get("text", ""))
        explanation = extract_explanation(raw_output)
        return explanation
    else:
        messages = [
            {
                "role": "system",
                "content": "You are an expert political analyst that provides detailed, objective analysis of political content. Focus on specific evidence from the text and avoid making assumptions about the writer's beliefs.",
            },
            {"role": "user", "content": prompt},
        ]
        result = generate_together(
            model="microsoft/phi-3-mini-128k-instruct",
            messages=messages,
            max_tokens=512,
            temperature=0.3,
            top_p=0.9,
            repetition_penalty=1.2,
        )
        explanation = extract_explanation(result)
        return explanation


async def political_lean(text: str) -> dict:

    if utils.TEST:
        print("Test active political lean")
        return {
            "probabilities": {
                "left": 0.3,
                "center": 0.4,
                "right": 0.3,
            },
            "predicted_lean": "test_center",
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
        predicted_lean = class_labels[predicted_class]

        return {
            "probabilities": {
                "left": probabilities[0],
                "center": probabilities[1],
                "right": probabilities[2],
            },
            "predicted_lean": predicted_lean,
        }
    else:
        prompt = f"""
            looking at the following text, please determine the political lean of the text.
            Text: {text}

            Please return the answer in the following format:
            {{
                "probabilities": {{
                    "left": 0.3,
                    "center": 0.4,
                    "right": 0.3
                }},
                "predicted_lean": "center"
            }}
        """

        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant that determines the political lean of text.",
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
            max_tokens=130,
            temperature=0.0,
            do_sample=False,
            num_beams=4,
            early_stopping=True,
        )

        # Extract the summary from the response
        return summary


async def extract_topics(text: str) -> dict:
    topics = []

    if utils.TEST:
        print("Test active topic scrapping")
        return {"topics": ["topic_1", "topic_2"]}

    if device == "cuda":
        from transformers import pipeline
        import re

        pipe = pipeline(
            "text-generation",
            model="Qwen/Qwen2.5-3B-Instruct",
            # load_in_4bit=True,
        )

        prompt = """Extract the main topics into a list of strings of 1-2 words.
        It should come from the following text: {text}
        The output should be the list and nothing else.
        It should look like this: ["topic1", "topic2", "topic3"]
        The list should contain up to {n_topics} topics. 
        """

        n_topics = 3
        retry = 0
        while retry < 3:
            result = pipe(
                prompt.format(n_topics=n_topics, text=text),
                max_new_tokens=50,
                do_sample=True,
                return_full_text=False,
            )
            print(f"Result: {result}")
            topics_str = result[0].get("generated_text", result[0].get("text", ""))
            topics_match = re.search(r'\[(?:\s*"[^"]*"\s*,?)*\]', topics_str)
            if not topics_match:
                retry += 1
                continue

            try:
                topics = topics_match.group(0)
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
        return {"topics": topics}


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


async def contextualize_article(text: str) -> str:
    if utils.TEST:
        print("Test active contextualization")
        return "Test active contextualization of the article's broader context."

    # First extract topics
    topics_result = await extract_topics(text)
    topics = topics_result.get("topics", [])

    # Use TinyLlama or similar small model if available, otherwise fallback to generate_together
    try:
        from transformers import pipeline
        import os

        hf_token = os.environ.get("HF_TOKEN", None)
        if hf_token:
            context_pipe = pipeline(
                "text-generation",
                model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                token=hf_token,
                temperature=0.3,
            )
            prompt = f"""You are an expert analyst of political, cultural, and historical discourse.\n\nGiven the article excerpt: {text}\nand the following topics identified within it: {', '.join(topics)}\n\nWrite a single, concise paragraph that analyzes how historical, cultural, and political factors relate to and shape these topics in the context of the article. Do not include headings, bullet points, or lists. Your response should be fluid, academic in tone, and approximately 5–6 sentences long. Output only the paragraph.\n"""
            result = context_pipe(
                prompt,
                max_new_tokens=192,
                do_sample=True,
                return_full_text=False,
            )
            contextualization = result[0]["generated_text"].strip()
            print("Contextualization:", contextualization)
            return contextualization
    except Exception as e:
        print("Falling back to generate_together due to:", e)

    # Fallback: use generate_together API
    prompt = f"""You are an expert analyst of political, cultural, and historical discourse.\n\nGiven the article excerpt: {text}\nand the following topics identified within it: {', '.join(topics)}\n\nWrite a single, concise paragraph that analyzes how historical, cultural, and political factors relate to and shape these topics in the context of the article. Do not include headings, bullet points, or lists. Your response should be fluid, academic in tone, and approximately 5–6 sentences long. Output only the paragraph.\n"""
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
        max_tokens=192,
        temperature=0.7,
    )
    print("Contextualization:", contextualization)
    return contextualization


async def get_logical_fallacies(text: str, sequential: bool = False) -> dict:
    start_time = time.time()

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
        print("Running parallel logical fallacies")
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

    print("finished in ", time.time() - start_time)

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


async def get_combined_logical_fallacies(text: str) -> LogicalFallacyComplete:
    """
    Get all logical fallacies using a single combined prompt.
    """
    if utils.TEST:
        print("Test active combined logical fallacies")
        # Return test data for all categories
        test_fallacy = LogicalFallacyServer(
            reason="Test active combined analysis",
            quote="Test active combined analysis",
            rating=1,
            explanation="Test active combined analysis",
        )
        test_list = LogicalFallacyServerList(
            logical_fallacies=[test_fallacy], error=None
        )

        return LogicalFallacyComplete(
            ad_hominem=test_list,
            discrediting_sources=test_list,
            emotion_fallacy=test_list,
            false_dichotomy=test_list,
            fear_mongering=test_list,
            good_sources=test_list,
            non_sequitur=test_list,
            presenting_other_side=test_list,
            scapegoating=test_list,
        )

    print("Running combined logical fallacies analysis")

    prompt = prompts.combined_analysis.format(text=text)

    try:
        messages = [
            {
                "role": "system",
                "content": "You are a helpful assistant that analyzes text for logical fallacies and rhetorical elements.",
            },
            {"role": "user", "content": prompt},
        ]

        response = await generate_together(
            model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages=messages,
            max_tokens=3096,  # Increased for combined analysis
            temperature=0.7,
            response_format={
                "type": "json_object",
                "schema": CombinedAnalysisAPI.model_json_schema(),
            },
        )

        json_response = CombinedAnalysisAPI.model_validate_json(response)

        # Convert the combined response to LogicalFallacyComplete
        result = LogicalFallacyComplete()

        for category, fallacies in json_response.analysis.items():
            logical_fallacies_complete = []

            for fallacy in fallacies:
                # Check that quote actually exists in the text
                if fallacy.quote is None or fallacy.quote == "":
                    continue

                logical_fallacies_complete.append(
                    LogicalFallacyServer(
                        reason=fallacy.reason,
                        quote=fallacy.quote,
                        rating=fallacy.rating,
                        explanation=fallacy.explanation,
                    )
                )

            fallacy_list = LogicalFallacyServerList(
                logical_fallacies=logical_fallacies_complete, error=None
            )

            # Set the appropriate attribute on the result object
            setattr(result, category, fallacy_list)

        return result

    except Exception as e:
        print(f"Error getting combined logical fallacies: {e}")
        # Return empty lists with error for all categories
        error_list = LogicalFallacyServerList(logical_fallacies=[], error=str(e))

        return LogicalFallacyComplete(
            ad_hominem=error_list,
            discrediting_sources=error_list,
            emotion_fallacy=error_list,
            false_dichotomy=error_list,
            fear_mongering=error_list,
            good_sources=error_list,
            non_sequitur=error_list,
            presenting_other_side=error_list,
            scapegoating=error_list,
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
        response = await generate_together(
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
        return LogicalFallacyServerList(logical_fallacies=[], error=str(e))

    # get list of logical fallacies from json_response (to avoid double keying)
    logical_fallacies = json_response.logical_fallacies

    logical_fallacies_complete = []
    for fallacy in logical_fallacies:

        # check that quote actually exists in the text
        if fallacy.quote is None:
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
