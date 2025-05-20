export interface NewsArticle {
  id: string;
  title: string;
  imageUrl: string;
  reads: number;
  publishDate: string;
  category: string;
  biasScore: number;
  summary: string;
  author: string;
  historicalContext: string;
  logicalFallacies: string;
  biasAnalysis: Map<string, string>;
}

export const mockArticles: NewsArticle[] = [
  {
    id: "1",
    title: "Astronauts Stuck on ISS 'Confident' Starliner Will Get Them Home",
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
    reads: 2435,
    publishDate: "2024-01-01",
    category: "Science",
    biasScore: -0.6,
    author: "Dr. Sarah Chen",
    summary: `NASA astronauts remain aboard the International Space Station (ISS) following a delay in the planned return of the Starliner spacecraft. Originally scheduled to depart last week, the Starliner encountered technical issues, including a malfunctioning propulsion system and unexpected telemetry readings, prompting mission controllers to postpone its return for safety evaluations.`,
    historicalContext:
      "This incident follows a series of technical challenges with the Starliner program, which has faced delays since its initial development in 2014. The program represents NASA's effort to reduce reliance on Russian Soyuz spacecraft for ISS crew transport.",
    logicalFallacies:
      "Appeal to authority (relying on astronaut confidence without technical details), False dichotomy (presenting only two possible outcomes)",
    biasAnalysis: new Map([
      ["NASA astronauts remain aboard the International Space Station", "blue"],
      ["Starliner encountered technical issues", "blue"],
      [
        "mission controllers to postpone its return for safety evaluations",
        "blue",
      ],
      ["reliance on Russian Soyuz spacecraft", "red"],
      ["safety evaluations", "blue"],
    ]),
  },
  {
    id: "2",
    title: "NASA's Artemis II Moon Mission: What You Need to Know",
    imageUrl:
      "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2070&auto=format&fit=crop",
    reads: 1234,
    publishDate: "2024-01-01",
    category: "Space",
    biasScore: 0.4,
    author: "James Wilson",
    summary:
      "NASA's next moon mission is preparing to launch with four astronauts onboard, marking a significant step in the agency's plans to return humans to the lunar surface.",
    historicalContext:
      "Artemis II follows the successful uncrewed Artemis I mission in 2022, continuing NASA's efforts to return humans to the Moon since the Apollo program ended in 1972. This mission represents the first crewed lunar mission in over 50 years.",
    logicalFallacies:
      "Appeal to progress (assuming advancement is inherently good), Hasty generalization (oversimplifying complex mission details)",
    biasAnalysis: new Map([
      ["NASA's next moon mission is preparing to launch", "red"],
      ["significant step in the agency's plans", "red"],
      ["return humans to the lunar surface", "red"],
      ["four astronauts onboard", "blue"],
      ["continuing NASA's efforts", "blue"],
    ]),
  },
  {
    id: "3",
    title: "AI Breakthrough: New Model Achieves Human-Level Understanding",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
    reads: 5678,
    publishDate: "2024-01-01",
    category: "Technology",
    biasScore: 0.2,
    author: "Dr. Michael Rodriguez",
    summary:
      "Researchers have developed a new artificial intelligence model that demonstrates unprecedented capabilities in natural language understanding and reasoning.",
    historicalContext:
      "This development follows decades of AI research, from early neural networks in the 1950s to recent transformer-based models. The field has seen multiple 'AI winters' and periods of both hype and skepticism.",
    logicalFallacies:
      "Appeal to novelty (overemphasizing newness), False analogy (comparing AI understanding to human understanding)",
    biasAnalysis: new Map([
      ["new artificial intelligence model", "red"],
      ["unprecedented capabilities", "red"],
      ["natural language understanding", "blue"],
      ["decades of AI research", "blue"],
      ["periods of both hype and skepticism", "blue"],
    ]),
  },
  {
    id: "4",
    title: "Global Climate Summit Reaches Historic Agreement",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
    reads: 3456,
    publishDate: "2024-01-01",
    category: "Environment",
    biasScore: -0.3,
    author: "Emma Thompson",
    summary:
      "World leaders have reached a landmark agreement on climate change, setting ambitious targets for reducing carbon emissions and establishing a framework for international cooperation.",
    historicalContext:
      "This agreement builds upon previous climate accords including the Paris Agreement (2015) and Kyoto Protocol (1997), representing the latest in a series of international efforts to address climate change since the 1992 Earth Summit.",
    logicalFallacies:
      "Appeal to consensus (assuming agreement means correctness), False cause (oversimplifying complex climate solutions)",
    biasAnalysis: new Map([
      ["landmark agreement on climate change", "blue"],
      ["ambitious targets for reducing carbon emissions", "blue"],
      ["framework for international cooperation", "blue"],
      ["World leaders have reached", "red"],
      ["previous climate accords", "blue"],
    ]),
  },
  {
    id: "5",
    title: "Revolutionary Quantum Computing Milestone Achieved",
    imageUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop",
    reads: 2890,
    publishDate: "2024-01-01",
    category: "Technology",
    biasScore: 0.1,
    author: "Dr. Alan Turing",
    summary:
      "Scientists have achieved quantum supremacy in a new experiment, demonstrating the ability to solve complex problems that would take classical computers thousands of years.",
    historicalContext:
      "This breakthrough follows decades of quantum computing research, from Richard Feynman's initial proposal in 1982 to Google's first claimed quantum supremacy in 2019. The field has seen steady progress despite significant technical challenges.",
    logicalFallacies:
      "Appeal to authority (relying on expert claims without detailed evidence), False dichotomy (presenting quantum vs classical as the only options)",
    biasAnalysis: new Map([
      ["achieved quantum supremacy", "red"],
      ["solve complex problems", "red"],
      ["classical computers thousands of years", "blue"],
      ["decades of quantum computing research", "blue"],
      ["significant technical challenges", "blue"],
    ]),
  },
  {
    id: "6",
    title: "New Study Reveals Breakthrough in Cancer Treatment",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
    reads: 4321,
    publishDate: "2024-01-01",
    category: "Health",
    biasScore: -0.2,
    author: "Dr. Lisa Patel",
    summary:
      "Medical researchers have discovered a promising new approach to treating certain types of cancer, showing remarkable results in early clinical trials.",
    historicalContext:
      "This research builds upon decades of cancer treatment evolution, from early chemotherapy in the 1940s to recent immunotherapy breakthroughs. The field has seen numerous promising treatments that later faced challenges in wider application.",
    logicalFallacies:
      "Appeal to hope (overemphasizing positive outcomes), Hasty generalization (extrapolating from early trials to broader success)",
    biasAnalysis: new Map([
      ["promising new approach to treating certain types of cancer", "blue"],
      ["remarkable results in early clinical trials", "blue"],
      ["Medical researchers have discovered", "blue"],
      ["early chemotherapy in the 1940s", "red"],
      ["challenges in wider application", "red"],
    ]),
  },
  {
    id: "7",
    title: "Global Economy Shows Signs of Recovery",
    imageUrl:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    reads: 3789,
    publishDate: "2024-01-01",
    category: "Business",
    biasScore: 0.5,
    author: "Robert Chen",
    summary:
      "Economic indicators suggest a strong recovery in global markets, with experts predicting sustained growth in key sectors.",
    historicalContext:
      "This recovery follows the global economic downturn caused by the COVID-19 pandemic, which led to the most severe global recession since World War II. The current situation represents a complex interplay of post-pandemic recovery, inflation, and geopolitical factors.",
    logicalFallacies:
      "Post hoc ergo propter hoc (assuming correlation implies causation), Appeal to authority (relying on expert predictions without detailed analysis)",
    biasAnalysis: new Map([
      ["strong recovery in global markets", "red"],
      ["experts predicting sustained growth", "red"],
      ["key sectors", "red"],
      ["global economic downturn", "blue"],
      ["post-pandemic recovery", "red"],
    ]),
  },
  {
    id: "8",
    title: "Major Sports League Announces Revolutionary Rule Changes",
    imageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop",
    reads: 2987,
    publishDate: "2024-01-01",
    category: "Sports",
    biasScore: 0.0,
    author: "Mark Johnson",
    summary:
      "In an effort to increase game engagement and player safety, the league has announced sweeping changes to its rules and regulations.",
    historicalContext:
      "This announcement follows a long history of rule changes in professional sports, from the introduction of the shot clock in basketball to recent concussion protocols in football. Sports leagues have consistently adapted rules to balance entertainment, safety, and competitive integrity.",
    logicalFallacies:
      "False dilemma (presenting safety and engagement as the only considerations), Appeal to tradition (assuming past rule changes were successful)",
    biasAnalysis: new Map([
      ["increase game engagement", "red"],
      ["player safety", "blue"],
      ["sweeping changes to its rules and regulations", "red"],
      ["concussion protocols", "blue"],
      ["competitive integrity", "red"],
    ]),
  },
];
