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
  },
];
