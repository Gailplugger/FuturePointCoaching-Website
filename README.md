# Future Point Coaching Institute Website

A modern, production-ready website for Future Point Coaching Institute built with Next.js, Tailwind CSS, and Framer Motion. Uses Netlify Functions and GitHub as a CMS backend.

## 🚀 Features

- **Modern UI/UX**: Dark gradient theme with orange accents, smooth animations
- **Study Notes Portal**: Browse and download study materials by class, stream, and subject
- **Admin Dashboard**: Upload PDFs, manage notes, and administer users
- **GitHub CMS**: All content stored and versioned in GitHub repository
- **Multi-Admin Support**: Super-admins can add/remove other admins
- **Responsive Design**: Works beautifully on all devices
- **Accessibility**: WCAG compliant with ARIA labels and keyboard navigation

## 📁 Project Structure

```
├── public/
│   └── images/                 # Static images (faculty photos)
├── notes/                      # Study materials (PDFs)
│   ├── class-10/
│   ├── class-11/
│   └── class-12/
├── admins/
│   └── admins.json            # Admin user list
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── notes/             # Notes listing page
│   │   └── admin/             # Admin section
│   │       ├── login/         # Admin login
│   │       ├── dashboard/     # Admin dashboard
│   │       └── users/         # Manage admins (super-admin only)
│   ├── components/            # React components
│   │   ├── layout/            # Header, Footer
│   │   ├── ui/                # Reusable UI components
│   │   ├── admin/             # Admin-specific components
│   │   └── motion/            # Animation components
│   └── lib/                   # Utilities, API, constants
├── netlify/
│   └── functions/             # Netlify serverless functions
│       ├── admin-login.js     # PAT authentication
│       ├── admin-logout.js    # Logout handler
│       ├── upload-pdf.js      # PDF upload to GitHub
│       ├── list-notes.js      # List notes from GitHub
│       ├── add-admin.js       # Add admin (super-admin only)
│       └── remove-admin.js    # Remove admin (super-admin only)
└── netlify.toml               # Netlify configuration
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Backend**: Netlify Functions (Node.js)
- **CMS**: GitHub Contents API
- **Auth**: GitHub PAT + JWT sessions
- **Hosting**: Netlify

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- GitHub account
- Netlify account

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/future-point-site.git
   cd future-point-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
   GH_USER=your-github-username
   GH_REPO=future-point-site
   NEXT_PUBLIC_GH_USER=your-github-username
   NEXT_PUBLIC_GH_REPO=future-point-site
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **For Netlify Functions locally**
   ```bash
   npx netlify dev
   ```

### Deployment to Netlify

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

3. **Set Environment Variables**
   
   In Netlify dashboard → Site settings → Environment variables:
   - `JWT_SECRET`: A strong random string (32+ characters)
   - `GH_USER`: Your GitHub username or organization
   - `GH_REPO`: Repository name

4. **Deploy**
   
   Netlify will automatically build and deploy on push to main branch.

## 👤 Admin Onboarding

### Creating a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Set a descriptive name: "Future Point Admin"
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### Setting Up the First Admin

1. Edit `admins/admins.json`:
   ```json
   {
     "super_admins": ["YourGitHubUsername"],
     "admins": []
   }
   ```

2. Commit and push the change
3. Go to your deployed site's `/admin/login`
4. Enter your GitHub PAT to login

### Adding More Admins

1. Login as a super-admin
2. Go to "Manage Admins" in the dashboard
3. Enter the GitHub username of the new admin
4. Click "Add Admin"

## 🔒 Security Considerations

- **Never commit PATs** to the repository
- PATs are validated server-side and used only for GitHub API calls
- JWT tokens are httpOnly and expire after 2 hours
- All admin actions are logged as commits to the repository
- Recommend using GitHub App/OAuth for production-grade auth

## 📝 Faculty Information

### Er. Sachin Kumar
- **Subject**: Mathematics
- **Experience**: 10+ Years
- **Qualifications**: M.Tech in Applied Mathematics
- **Photo**: `public/images/REAL-SACHIN.JPG`

### Prof. Gautam Sharma
- **Subject**: Biology
- **Experience**: 7+ Years
- **Qualifications**: M.Sc. Biology, B.Ed
- **Photo**: `public/images/GAUTOM.jpg`

## 📞 Contact Information

- **Address**: Ghanshyam Murliwala Complex, Near Maharana Pratap Chowk, Sadulpur, Churu - 331023
- **Phone**: +91 8209429318
- **Email**: futurepointcoaching@gmail.com
- **Hours**: Mon–Sat 9:00 AM - 8:00 PM, Sunday Closed

## 🎨 Branding

Footer includes clickable branding:
> "Made with ❤️ by ASTRAFORENSICS"

Links to: https://astraforensics.in

## 📄 License

© 2024 Future Point Coaching Institute. All rights reserved.

---

Built with ❤️ by [AstraForensics](https://astraforensics.in)

Key with Layers of enc
dHVjXzUwd00wWGhWS0FCUVF1cXRnUzQ1WUhFU1ZMTkhzWDFWS3hvRA==
