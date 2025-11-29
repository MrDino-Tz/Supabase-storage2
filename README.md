# Supabase Storage & Edge Functions Demo

A Next.js application demonstrating Supabase Storage and Edge Functions capabilities with user authentication.

## Features

- **User Authentication** - Sign up/sign in with Supabase Auth
- **File Upload** - Upload files to Supabase Storage with progress tracking
- **File Management** - List, download, and delete files
- **Image Processing** - Process images using Supabase Edge Functions (resize, compress, thumbnail)
- **Real-time Updates** - Automatic UI updates when files change

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service (Database, Auth, Storage, Edge Functions)

## Prerequisites

1. **Supabase Project** - Create a new project at [supabase.com](https://supabase.com)
2. **Node.js** - Version 18 or higher
3. **npm/yarn/pnpm** - Package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd supabase-storage
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to **Project Settings** > **API**
3. Copy your Project URL and keys

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace the placeholder values with your actual Supabase credentials.

### 4. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage**
3. Create a new bucket named `demo-bucket`
4. Set bucket to be public (for demo purposes)

### 5. Set up Edge Function

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link
   ```

3. Deploy the Edge Function:
   ```bash
   supabase functions deploy image-process
   ```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up/Sign In** - Create an account or sign in with existing credentials
2. **Upload Files** - Select and upload files to Supabase Storage
3. **Manage Files** - View, download, or delete uploaded files
4. **Process Images** - Select images and apply transformations (resize, compress, thumbnail)

## Project Structure

```
src/
├── app/
│   └── page.tsx              # Main application page
├── components/
│   ├── Auth.tsx              # Authentication component
│   ├── FileUpload.tsx        # File upload with progress
│   ├── FileList.tsx          # File management interface
│   └── ImageProcessor.tsx    # Image processing controls
└── lib/
    └── supabase.ts           # Supabase client configuration
supabase/
└── functions/
    └── image-process/
        └── index.ts          # Edge Function for image processing
```

## Edge Function

The `image-process` Edge Function demonstrates:

- **Resize** - Change image dimensions
- **Compress** - Reduce file size with quality control
- **Thumbnail** - Generate small preview images

Note: This is a demonstration implementation. In production, you'd integrate with image processing libraries.

## Development

### Adding New Features

1. **Storage Operations** - Extend components in `/src/components/`
2. **Edge Functions** - Add new functions in `/supabase/functions/`
3. **Authentication** - Modify `/src/components/Auth.tsx`

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key for client-side use
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## Security Notes

- **Storage Policies** - Implement Row Level Security (RLS) policies in production
- **Authentication** - Enable proper authentication providers
- **API Keys** - Never expose service role keys on the client side

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes. Feel free to use and modify.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
