import { Globe, Play, ImageIcon, Smartphone, Github, Star } from 'lucide-react';

export const DEMO_FREELANCERS = [
  {
    id: "demo-1",
    full_name: "Ananya Sharma",
    bio: "Full-stack developer specializing in React, Next.js and Node.js. I build performant web apps with stunning UIs. 4+ years shipping production code for startups. Passionate about AI-integrated user experiences.",
    skills: "React, Next.js, Node.js, TypeScript, Tailwind CSS, OpenAI API",
    profile_picture_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    availability: "actively_looking",
    location: "Bangalore, India",
    github_url: "https://github.com/ananya-sharma",
    linkedin_url: "https://linkedin.com/in/ananya-sharma",
    portfolio_url: "https://ananya.dev",
    contact_email: "ananya@example.com",
    is_demo: true,
    is_verified: true,
    is_top_performer: true,
    rating: 4.9,
    review_count: 32,
    portfolios: [
      {
        id: "dp-1",
        title: "SaaS Analytics Dashboard",
        description: "Real-time analytics dashboard with interactive charts, dark mode, and team collaboration features. Scalable up to 1M events per day.",
        thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        tech_stack: "React, D3.js, Node.js, PostgreSQL",
        link: "#",
      },
      {
        id: "dp-2",
        title: "E-Commerce Mobile App",
        description: "Full-featured shopping app with AR try-on, wishlist, and payment integration. Built for scale using React Native.",
        thumbnail_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
        tech_stack: "React Native, Stripe, Firebase",
        link: "#",
      },
    ],
    ai_creations: [
      {
        id: "ai-1",
        type: "Website",
        name: "Eco-Friendly Living",
        prompt: "A modern, green-themed website for sustainable living enthusiasts.",
        image_url: "https://images.unsplash.com/photo-1542601906970-d4d812ed9e06?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
      },
      {
        id: "ai-2",
        type: "Video",
        name: "Urban Cyberpunk 2077",
        prompt: "Neon-lit city streets at night, futuristic cars, rainy cinematic atmosphere.",
        video_url: "#",
        thumbnail_url: "https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
      }
    ],
    github_projects: [
      {
        id: "gh-1",
        repo_name: "nextjs-saas-starter",
        repo_url: "https://github.com",
        description: "A comprehensive SaaS starter kit with Auth, Subscription, and Multi-tenancy.",
        stars: 1240,
        created_at: new Date().toISOString(),
      },
      {
        id: "gh-2",
        repo_name: "react-glassmorphism-ui",
        repo_url: "https://github.com",
        description: "A lightweight CSS library for ultra-premium glassmorphism components.",
        stars: 890,
        created_at: new Date().toISOString(),
      }
    ],
    reviews: [
      {
        id: "rev-1",
        client_name: "Sarah Jenkins",
        client_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        role: "CEO, TechFlow",
        rating: 5,
        content: "Ananya is a phenomenal developer. She took our messy legacy code and transformed it into a lightning-fast Next.js application in record time. Her design sense is also top-tier!",
        date: "2024-02-15"
      },
      {
        id: "rev-2",
        client_name: "David Chen",
        client_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        role: "Project Manager, GlobalLink",
        rating: 5,
        content: "High quality code and excellent communication. Ananya really understands the business logic behind the features she builds. Looking forward to our next project together.",
        date: "2024-01-20"
      }
    ]
  },
  {
    id: "demo-2",
    full_name: "Marcus Chen",
    bio: "ML engineer & data scientist. I turn messy data into actionable insights and deploy production ML pipelines. Published researcher in NLP with a focus on Large Language Models.",
    skills: "Python, Machine Learning, TensorFlow, FastAPI, AWS, PyTorch",
    profile_picture_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    availability: "actively_looking",
    location: "San Francisco, CA",
    github_url: "https://github.com/marcus-ml",
    linkedin_url: "https://linkedin.com/in/marcus-chen",
    contact_email: "marcus@example.com",
    is_demo: true,
    is_verified: true,
    is_top_performer: false,
    rating: 4.7,
    review_count: 18,
    portfolios: [
      {
        id: "dp-3",
        title: "AI Content Moderation System",
        description: "Automated content moderation pipeline processing 10K+ images/day with 99.2% accuracy. Integrated with enterprise APIs.",
        thumbnail_url: "https://images.unsplash.com/photo-1555949963-aa79dcee578d?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Python, PyTorch, FastAPI, Redis",
        link: "#",
      },
      {
        id: "dp-4",
        title: "Stock Prediction Dashboard",
        description: "LSTM-based stock price predictions with interactive backtesting and portfolio optimization. Real-time ticker integration.",
        thumbnail_url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Python, TensorFlow, Plotly, AWS",
        link: "#",
      },
    ],
    ai_creations: [
      {
        id: "ai-3",
        type: "App",
        name: "Mindful Meditation",
        prompt: "A soothing meditation app with ambient soundscapes and guided sessions.",
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
      },
      {
        id: "ai-4",
        type: "Image",
        name: "Intergalactic Voyage",
        prompt: "A massive spaceship traveling through a vibrant nebula, high detail, 8k.",
        image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
      }
    ],
    github_projects: [
      {
        id: "gh-3",
        repo_name: "pytorch-transformer-api",
        repo_url: "https://github.com",
        description: "Custom transformer implementation for sequence-to-sequence learning tasks.",
        stars: 450,
        created_at: new Date().toISOString(),
      }
    ],
    reviews: [
      {
        id: "rev-3",
        client_name: "Liam O'Connor",
        client_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam",
        role: "Head of Engineering, DataCore",
        rating: 4.8,
        content: "Marcus is a deep expert in ML. He optimized our computer vision models and reduced inference latency by 40%. Exceptionally thorough and academic approach.",
        date: "2024-03-01"
      }
    ]
  },
  {
    id: "demo-3",
    full_name: "Priya Desai",
    bio: "UI/UX designer who codes. I create pixel-perfect interfaces and design systems. Previously at a Y-Combinator startup. I bridge the gap between design and engineering.",
    skills: "UI/UX, Figma, React, Tailwind CSS, Framer Motion, GSAP",
    profile_picture_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    availability: "actively_looking",
    location: "Mumbai, India",
    github_url: "https://github.com/priya-design",
    linkedin_url: "https://linkedin.com/in/priya-desai",
    contact_email: "priya@example.com",
    is_demo: true,
    is_verified: true,
    is_top_performer: true,
    rating: 5.0,
    review_count: 24,
    portfolios: [
      {
        id: "dp-5",
        title: "Fintech Design System",
        description: "A comprehensive design system for financial apps, focusing on clarity, trust, and accessibility. Used by 3 separate product teams.",
        thumbnail_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        tech_stack: "Figma, React, Storybook",
        link: "#",
      }
    ],
    ai_creations: [
      {
        id: "ai-5",
        type: "Website",
        name: "Zen Garden Spa",
        prompt: "A minimalist, peaceful website for a luxury spa and wellness center.",
        image_url: "https://images.unsplash.com/photo-1544161515-4ae6ce6ca8b8?auto=format&fit=crop&w=800&q=80",
        created_at: new Date().toISOString(),
      }
    ],
    github_projects: [
      {
        id: "gh-4",
        repo_name: "framer-motion-utils",
        repo_url: "https://github.com",
        description: "A collection of reusable animation snippets for Framer Motion.",
        stars: 156,
        created_at: new Date().toISOString(),
      }
    ],
    reviews: [
      {
        id: "rev-4",
        client_name: "Emma Wilson",
        client_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        role: "Product Lead, StellarApp",
        rating: 5,
        content: "Priya is the best designer I've worked with. She not only delivers beautiful screens but actually understands how to implement them in React. A rare find!",
        date: "2024-03-20"
      }
    ]
  }
];
