# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

El Pueblito is a Next.js 15 restaurant website for a chain of Mexican restaurants in Northwest Arkansas. The site features location information, menus, Instagram integration, customer testimonials, and contact forms. Built by Pulse Community Agency for El Pueblito.

## Common Commands

### Development
```bash
# Start development server with Turbopack
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Run linting
pnpm run lint
```

### Package Management
```bash
# Install dependencies
pnpm install

# Add new dependency
pnpm add <package-name>

# Add dev dependency
pnpm add -D <package-name>
```

## Architecture Overview

### Framework & Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS with custom Mexican restaurant theme
- **Package Manager**: pnpm with workspace support
- **Animation**: Framer Motion (motion/react)
- **UI Components**: Radix UI + shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Analytics**: PostHog, Google Analytics, Vercel Speed Insights
- **Code Quality**: Biome (extends "ultracite" config)

### Directory Structure
```
/app              # Next.js App Router pages
  /api            # API routes (newsletter endpoint)
  /contact        # Contact page
  /locations      # Locations page  
  /menu           # Menu page
  layout.tsx      # Root layout with fonts, metadata, analytics
  page.tsx        # Homepage with animated sections
  providers.tsx   # PostHog and other providers

/components       # Reusable React components
  /analytics      # QR tracking components
  /debug          # Development debug tools
  /ui             # shadcn/ui components
  Header.tsx      # Navigation with location-aware hours
  Hero.tsx        # Main hero section
  InstagramFeed.tsx # Instagram API integration
  LocationCard.tsx  # Individual location display
  Testimonials.tsx  # Customer reviews
  
/lib              # Utility functions and constants
  /constants      # Color schemes, review data
  /hooks          # Custom React hooks (screen size, restaurant hours)
  /utils          # Utility functions and date formatting
  
/styles           # Global CSS
```

### Key Architectural Patterns

#### Design System
- Custom color palette inspired by Mexican culture:
  - Primary: #D62828 (Deep red)
  - Secondary: #006847 (Mexican green) 
  - Accent: #F4C430 (Warm yellow)
  - Adobe: #DBAD6C (Warm tan)
- Typography: Custom "Bronto" font family with multiple weights
- Responsive design with custom tablet breakpoint (640px)

#### Component Architecture
- **Server Components**: Layout, static pages use RSC by default
- **Client Components**: Interactive components marked with 'use client'
- **Animation Strategy**: Framer Motion with consistent spring configurations
- **Form Handling**: React Hook Form + Zod for type-safe validation
- **State Management**: React hooks for local state, URL params with nuqs

#### Data Integration
- **Instagram Feed**: Basic Display API with weekly caching
- **Restaurant Hours**: Hook-based system with real-time status
- **Analytics**: Multi-platform tracking (PostHog, GA4, GTM)
- **Maps Integration**: Google Maps via @vis.gl/react-google-maps

#### Multi-Location Architecture
The site handles 4 restaurant locations:
1. Bella Vista (479-855-2324)
2. Highfill (479-525-6034) 
3. Prairie Creek (479-372-6275)
4. Centerton (479-224-4820)

Each location has structured data (JSON-LD), hours, contact info, and coordinates.

## Development Patterns

### Environment Setup
- Uses `.env.local` for sensitive data
- Instagram API token required for feed functionality
- PostHog API key for analytics (disabled in development)

### Custom Hooks
- `useRestaurantHours()`: Real-time open/closed status
- `useScreenSize()`: Responsive breakpoint detection
- `useWindowDimensions()`: Window size tracking

### Animation Patterns
```typescript
// Standard spring transition
const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};

// Page section animations
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
```

### Styling Conventions
- Tailwind utility classes with consistent spacing
- Component-scoped styles using CSS modules when needed
- Custom CSS properties for theme colors in `globals.css`
- Mobile-first responsive design approach

### Content Security Policy
Strict CSP configured in `next.config.js` for:
- Google services (Analytics, Maps, Fonts)
- PostHog analytics
- Vercel insights
- Instagram API domains

## Development Tools

### Debug Features
- Development-only debug buttons for testimonials
- Restaurant hours debug component
- Debug tools wrapper for development environment
- Console logging disabled in production

### Code Quality
- Biome configuration extending "ultracite" preset
- TypeScript strict mode with null checks
- Path aliases using `@/` prefix for clean imports

## Deployment Notes

### Environment Variables Required
```
INSTAGRAM_ACCESS_TOKEN=<instagram-basic-display-token>
NEXT_PUBLIC_POSTHOG_API_KEY=<posthog-project-key>
```

### Performance Optimizations
- Turbopack for fast development builds
- Image optimization with Next.js Image component
- Component lazy loading with Suspense boundaries
- Instagram feed caching (7-day intervals)

### SEO & Analytics
- Comprehensive metadata in root layout
- Structured data for all restaurant locations
- OpenGraph and Twitter card support
- Multiple analytics platforms integrated
- Sitemap and robots.txt generation

## Special Considerations

### Instagram Integration
- Requires Facebook Developer account setup
- Access tokens expire and need manual refresh
- Fallback images in development mode
- Weekly cache refresh strategy

### Multi-Location Management
- Hours handled generically across all locations
- Phone numbers and addresses in multiple components
- Location-specific pages under `/locations/[slug]`
- Google Maps integration with custom markers

### Brand Identity
- Authentic Mexican restaurant aesthetic
- Family recipe heritage messaging
- Northwest Arkansas community focus
- Professional business website built by Pulse Community Agency
