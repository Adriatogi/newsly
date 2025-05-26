ad_hominem = """
Instructions: Identify quotes in the following article that implement ad hominem. Give a rating from 1 (slight)-5 (extreme) for the quote.

Criteria:
1) Relevance: Is the attack relevant to the argument's substance?
2) Character vs. Behavior: Is it an attack on character or a relevant criticism of behavior?
3) Context: Is the attack justified within the context?

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of the ad hominem",
      "reason": "detailed reason, referencing criteria 1-3, why it is an ad hominem",
      "explanation": "An explanation of how confident it is in it's decision, based on the criteria",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no ad hominem attacks are found, return: {{"logical_fallacies": []}}

Note: Criticisms of institutions or behaviors relevant to the discussion, such as "The justices have faced intense pressure over their ethics practices...", are not considered ad hominem attacks.

JSON Response:
"""

discrediting_sources = """
Instructions: Identify quotes that involve explicit discrediting of reputable sources, where there is a clear intent to undermine the source's credibility through direct criticism of its integrity, accuracy, or reliability. Give a rating from 1 (slight) to 5 (extreme) based on the intensity and directness of the discrediting.

Definition: Discrediting reputable sources involves specific allegations or assertions that question the factual accuracy, objectivity, or reliability of sources recognized for their authority and credibility in their field. This does not include legal disagreements, institutional critiques, or expressions of dissatisfaction with the actions or policies of entities, unless these directly relate to the factual integrity of the source.

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of the fallacy",
      "reason": "detailed explanation of how the source is being discredited",
      "explanation": "An explanation of how confident it is in it's decision",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no instances are found, return: {{"logical_fallacies": []}}
JSON Response:
"""

emotion_fallacy = """
Instructions: Identify portions of text that are the appeal to emotion fallacy. To be a fallacy, the appeal to emotion would have to stand in place of a rational argument. Give a rating from 1 (slightly appeals to emotion)-5 (extreme) for the quote.

Definition: Appeal to emotion or argumentum ad passiones is an informal fallacy characterized by the manipulation of the recipient's emotions in order to win an argument, especially in the absence of factual evidence.

Examples: Such as "think of the children," "this will destroy our way of life," or "if you care about X, then you must do Y" can influence others' opinions by eliciting emotions like fear. Or resorting to other logical fallacies like the ad hominem fallacy or the red herring fallacy are often used to evoke an emotional response.

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of the fallacy",
      "reason": "detailed explanation of how emotions are being manipulated",
      "explanation": "An explanation of how confident it is in it's decision",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no instances are found, return: {{"logical_fallacies": []}}

JSON Response:
"""

false_dichotomy_fallacy = """
Instructions: Identify quotes that present false dichotomies in the article. Rate the extent of misrepresentation from 1 (slight) to 5 (extreme).

Definition: A false dichotomy portrays a situation as having only two exclusive outcomes, ignoring a continuum of possibilities.

Key Points:
- Trade-offs vs. Dichotomies: Distinguish between discussions of trade-offs (which imply a range of options) and false dichotomies (which present only two mutually exclusive outcomes).
- Contextual Understanding: Consider the statement's broader context to avoid misinterpretation.
- Conditional Statements: Assess if conditional language unjustly simplifies complex issues into binary choices.

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of the fallacy",
      "reason": "detailed explanation of how emotions are being manipulated, referencing key points.",
      "explanation": "An explanation of how confident it is in it's decision",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no instances are found, return: {{"logical_fallacies": []}}

JSON Response:
"""

fear_mongering_fallacy = """
Instructions: Identify any fear mongering in the text, where language unjustifiably incites fear about potential dire outcomes. Rate such instances from 1 (minimal) to 5 (extreme), considering:

Criteria:
- Context: Is the level of concern reasonable or exaggerated?
- Intent: Is the aim to inform with evidence or to manipulate by inducing fear?
- Evidence: Do the claims lack factual support?

Note: Valid warnings, especially in safety contexts (like reports on escaped inmates), aren't fear mongering if factually based and contextually relevant.

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of the fallacy",
      "reason": "detailed explanation of how emotions are being manipulated, referencing criteria 1-3",
      "explanation": "An explanation of how confident it is in it's decision, based on the criteria",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no instances are found, return: {{"logical_fallacies": []}}

JSON Response:
"""

good_sources = """
Instructions: Identify quotes that explicitly utilize and cite good, reputable sources, specifically focusing on entities that provide concrete statistics rather than mere information or statements. Give a rating from 1 (slight) to 5 (extreme) based on how well the quote adheres to this criterion.

Definition: Utilizing good sources means relying on information from reputable, credible, and authoritative entities known for providing factual, statistical data. This excludes statements from individuals or organizations with potential biases or direct involvement in the narrative.

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of the good source",
      "reason": "explanation of why the source is reputable and valuable",
      "explanation": "An explanation of how confident it is in it's decision",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no instances are found, return: {{"logical_fallacies": []}}

JSON Response:
"""

non_sequitur = """
Instructions: Identify quotes of text that utilize non-sequiturs. Give a rating from 1 (slight)-5 (extreme) for the quote.

Definition: A non-sequitur is a statement that does not follow logically from or is not clearly related to anything previously said. Non sequitur fallacy is also known as irrelevant reason, derailment, and invalid inference.

Example: "Investing in cryptocurrencies is a risk, but everything in life involves a risk. Every time you drive a car you are taking a risk. If you're willing to drive a car, you should be willing to invest in cryptocurrencies."

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of the non-sequitur",
      "reason": "explanation of the non-sequitur",
      "explanation": "An explanation of how confident it is in it's decision",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no instances are found, return: {{"logical_fallacies": []}}

JSON Response:
"""

presenting_other_side = """
Instructions: Search for quotes that present two reasoned arguments within a debate, with each side offering clear rationale for its stance. Rate the quotes from 1 (minimal depth) to 5 (excellent depth), based on:

- Substantive Arguments: Both viewpoints must provide reasoning or justification, not just state a position or preference.
- Clarity and Distinction: Arguments should be distinct and clearly articulated.
- Balanced Representation: The quote should present both arguments fairly.

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of presenting other side",
      "reason": "explanation of how the quote presents substantive arguments from both sides",
      "explanation": "An explanation of how confident it is in it's decision",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no instances are found, return: {{"logical_fallacies": []}}

Note: You can only include up to 3 examples maximum, so choose the most significant ones.

JSON Response:
"""

scapegoating = """
Instructions: Examine the text for instances of scapegoating, where a person or group is unfairly blamed for problems without merit. Rate each instance from 1 (slight) to 5 (extreme), based on the extent of unjustified blame.

Considerations:
- Justification: Determine if the blame is supported by evidence or is an unfounded accusation.
- Context: Assess whether the quote provides context that justifies the attribution of blame.
- Correlation vs. Causation: Distinguish between legitimate discussions of cause-and-effect and instances where unrelated events are wrongfully connected.

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "logical_fallacies": [
    {{
      "quote": "exact quote from text of the scapegoating",
      "reason": "explanation of how blame is unjustifiably assigned",
      "explanation": "An explanation of how confident it is in it's decision",
      "rating": integer between 1-5 of how confident it is in it's decision,
    }}, ...
  ]
}}

If no instances are found, return: {{"logical_fallacies": []}}

Note: You can only include up to 3 examples maximum, so choose the most significant ones.

JSON Response:
"""

combined_analysis = """
Instructions: Analyze the following text for multiple logical fallacies and rhetorical elements. For each category found, provide quotes and ratings from 1 (slight) to 5 (extreme).

Categories to analyze:

1. **Ad Hominem**: Attacks on character rather than argument substance
   - Criteria: Relevance to argument, character vs. behavior criticism, contextual justification

2. **Discrediting Sources**: Explicit undermining of reputable sources' credibility
   - Focus on direct criticism of integrity, accuracy, or reliability

3. **Appeal to Emotion**: Emotional manipulation replacing rational argument
   - Look for fear tactics, "think of the children" rhetoric, emotional manipulation

4. **False Dichotomy**: Presenting only two exclusive outcomes, ignoring other possibilities
   - Distinguish from legitimate trade-off discussions

5. **Fear Mongering**: Unjustifiably inciting fear about potential dire outcomes
   - Consider context, intent, and evidence support

6. **Non-Sequitur**: Statements that don't follow logically from previous content
   - Look for irrelevant reasoning and invalid inferences

7. **Scapegoating**: Unfairly blaming a person/group without merit
   - Assess justification, context, and correlation vs. causation

8. **Good Sources**: Explicit use of reputable, credible sources with concrete statistics
   - Focus on authoritative entities providing factual data

9. **Presenting Other Side**: Balanced presentation of two reasoned arguments
   - Look for substantive arguments, clarity, and fair representation

Text to analyze:
{text}

The response MUST follow this exact JSON schema:
{{
  "analysis": {{
    "ad_hominem": [
      {{
        "quote": "exact quote from text",
        "reason": "detailed explanation referencing relevance, character vs. behavior, context",
        "explanation": "confidence assessment based on criteria",
        "rating": integer between 1-5
      }}
    ],
    "discrediting_sources": [
      {{
        "quote": "exact quote from text",
        "reason": "detailed explanation of how source is being discredited",
        "explanation": "confidence assessment",
        "rating": integer between 1-5
      }}
    ],
    "emotion_fallacy": [
      {{
        "quote": "exact quote from text",
        "reason": "detailed explanation of emotional manipulation",
        "explanation": "confidence assessment",
        "rating": integer between 1-5
      }}
    ],
    "false_dichotomy": [
      {{
        "quote": "exact quote from text",
        "reason": "explanation of false binary choice presentation",
        "explanation": "confidence assessment",
        "rating": integer between 1-5
      }}
    ],
    "fear_mongering": [
      {{
        "quote": "exact quote from text",
        "reason": "explanation of unjustified fear incitement, referencing context/intent/evidence",
        "explanation": "confidence assessment based on criteria",
        "rating": integer between 1-5
      }}
    ],
    "non_sequitur": [
      {{
        "quote": "exact quote from text",
        "reason": "explanation of logical disconnect",
        "explanation": "confidence assessment",
        "rating": integer between 1-5
      }}
    ],
    "scapegoating": [
      {{
        "quote": "exact quote from text",
        "reason": "explanation of unjustified blame assignment",
        "explanation": "confidence assessment",
        "rating": integer between 1-5
      }}
    ],
    "good_sources": [
      {{
        "quote": "exact quote from text",
        "reason": "explanation of source credibility and value",
        "explanation": "confidence assessment",
        "rating": integer between 1-5
      }}
    ],
    "presenting_other_side": [
      {{
        "quote": "exact quote from text",
        "reason": "explanation of balanced argument presentation",
        "explanation": "confidence assessment",
        "rating": integer between 1-5
      }}
    ]
  }}
}}

For categories with no instances found, use empty arrays: []
Maximum 3 examples per category for scapegoating and presenting_other_side.

JSON Response:
"""
