# AstroGuard Frontend

This is the frontend application for AstroGuard, a space equipment detection system built with Next.js, React, and Shadcn UI. The application provides a modern and intuitive interface for uploading images and detecting objects like fire extinguishers, toolboxes, and oxygen tanks in the International Space Station (ISS) environment.

## Features

- Clean, responsive UI built with Tailwind CSS and Shadcn UI components
- Image upload and preview functionality
- Real-time object detection using the AstroGuard backend API
- Detailed visualization of detected objects with bounding boxes
- Confidence scores for each detected object
- Dark/Light mode toggle

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── home/       # Home page with object detection UI
│   │   ├── layout.tsx  # Root layout with theme provider
│   │   └── page.tsx    # Redirect to home page
│   ├── components/     # Reusable React components
│   │   ├── ui/         # Shadcn UI components
│   │   ├── NavBar.tsx  # Navigation bar
│   │   └── theme-*.tsx # Theme related components
│   └── lib/            # Utility functions and shared code
├── package.json        # Project dependencies
└── next.config.ts      # Next.js configuration
```

## Prerequisites

- Node.js 16.8.0 or later
- npm or yarn package manager
- AstroGuard backend API running (see backend README)

## Getting Started

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
# then edit .env.local
```

If these variables are missing or incorrect the application will log
"Invalid API key" errors when it tries to access Supabase.

The following variables are required:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Integration

The frontend communicates with the AstroGuard backend API to perform object detection. Make sure the backend server is running at `http://localhost:8000` before using the detection features.

## Using the Application

1. Navigate to the home page
2. Upload an image using the file input or by clicking the "Select Image" button
3. Click "Detect Objects" to send the image to the backend API
4. View the detection results with bounding boxes and confidence scores

## Building for Production

```bash
npm run build
# or
yarn build
```

## Deployment

The application can be deployed to various hosting platforms. For the simplest deployment:

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
