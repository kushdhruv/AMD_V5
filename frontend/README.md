# AMD V5 - Smart Registration Helper

A modern Next.js web application that helps users generate smart registration forms with AI-powered features and website builder capabilities.

## Overview

AMD V5 is a sophisticated web application built with Next.js that combines:
- **AI-Powered Form Generation** using Google Generative AI and Groq SDK
- **Smart Registration Helper** - Generate and customize registration forms intelligently
- **Website Builder** - Create and manage web content with drag-and-drop functionality
- **Database Integration** with Supabase for scalable backend
- **Payment Processing** with Stripe integration
- **GitHub Integration** for repository management via GitHub API

## Features

✨ **Core Features:**
- 🤖 AI-powered form generation and suggestions
- 🎨 Drag-and-drop form builder interface
- 📦 Export forms as zipped packages
- 💳 Stripe payment integration
- 🗄️ Supabase database for data persistence
- 🔗 GitHub API integration
- 🎯 Custom component library with Lucide React icons
- ⚡ Real-time form preview and editing
- 📱 Responsive design with Tailwind CSS

## Tech Stack

**Frontend:**
- [Next.js 14.2.16](https://nextjs.org/) - React framework
- [React 18](https://react.dev/) - UI library
- [Tailwind CSS 3.4.1](https://tailwindcss.com/) - Styling
- [Framer Motion 12.34.0](https://www.framer.com/motion/) - Animations

**AI & Integrations:**
- [@google/genai 1.41.0](https://github.com/google/generative-ai-js) - Google Generative AI
- [Groq SDK 0.37.0](https://console.groq.com/docs/quickstart) - Groq API for AI
- [@octokit/rest 22.0.1](https://octokit.github.io/rest.js/) - GitHub API

**Database & Backend:**
- [@supabase/supabase-js 2.95.3](https://supabase.com/) - Backend-as-a-Service

**Utilities:**
- [@dnd-kit](https://docs.dndkit.com/) - Drag and drop functionality
- [jszip 3.10.1](https://stuk.github.io/jszip/) - ZIP file generation
- [archiver 7.0.1](https://www.archiverjs.com/) - Archive creation
- [Stripe 20.3.1](https://stripe.com/docs/libraries/node) - Payment processing
- [Zod 4.3.6](https://zod.dev/) - TypeScript-first schema validation
- [UUID 13.0.0](https://github.com/uuidjs/uuid) - Unique ID generation

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository:**
```
bash
git clone https://github.com/kushdhruv/AMD_V5.git
cd AMD_V5
```

2. **Install dependencies:**
```
bash
npm install
# or
yarn install
```

3. **Environment Setup:**
Create a `.env.local` file in the root directory with your API keys:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GOOGLE_API_KEY=your_google_genai_key
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_token
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Development

### Running the Development Server

```
bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The application will automatically reload as you make changes to files.

### Building for Production

```
bash
npm run build
npm start
```

### Linting

```
bash
npm run lint
```

## Project Structure

```
AMD_V5/
├── src/
│   ├── app/              # Next.js app directory with pages
│   ├── components/       # Reusable React components
│   └── lib/             # Utility functions and helpers
├── public/              # Static assets
├── supabase/            # Supabase configuration
├── generated-app/       # Generated application output
├── package.json         # Project dependencies
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.mjs   # PostCSS configuration
├── next.config.mjs      # Next.js configuration
└── README.md            # This file
```

## Key Components

- **Form Builder** - Interactive drag-and-drop interface for creating registration forms
- **AI Generator** - Utilizes Google Generative AI and Groq for intelligent suggestions
- **Database Layer** - Supabase integration for user data and form storage
- **Export System** - Generate and download forms as ZIP packages
- **Payment Integration** - Stripe integration for subscription/payment features

## Environment Variables

The application requires the following environment variables:

| Variable | Description |
|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key |
| GOOGLE_API_KEY | Google Generative AI API key |
| GROQ_API_KEY | Groq API key for AI operations |
| GITHUB_TOKEN | GitHub personal access token |
| STRIPE_PUBLIC_KEY | Stripe public key |
| STRIPE_SECRET_KEY | Stripe secret key |

## API Integrations

### Google Generative AI
Used for generating intelligent form suggestions and content.

### Groq API
Alternative AI provider for optimized inference.

### GitHub API
Enables repository management and integration features.

### Stripe
Handles payment processing and subscription management.

### Supabase
Provides database, authentication, and real-time features.

## Deployment

The application can be deployed on various platforms:

### Vercel (Recommended)
```
bash
npm install -g vercel
vercel
```

### Docker
Create a Dockerfile and build the application as a container.

### Other Platforms
The application is compatible with any Node.js hosting platform (AWS, Google Cloud, Azure, etc.).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please:
- Open an issue on GitHub
- Check existing issues and discussions
- Visit the project wiki for additional documentation

## Changelog

### Version 0.1.0
- Initial project setup with Next.js 14
- Form builder interface
- AI integration with Google Generative AI and Groq
- Supabase database setup
- Stripe payment integration

## Future Roadmap

- [ ] Enhanced form templates library
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] Additional AI model integrations
- [ ] Form versioning and rollback

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Drag-and-drop by [@dnd-kit](https://docs.dndkit.com/)
- AI powered by [Google Generative AI](https://ai.google.dev/) and [Groq](https://www.groq.com/)

---

**Last Updated:** 2026-02-21 06:56:32