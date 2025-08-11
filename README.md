# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/55ff42e1-1ea7-42b5-afcc-20f02332f9ad

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/55ff42e1-1ea7-42b5-afcc-20f02332f9ad) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/55ff42e1-1ea7-42b5-afcc-20f02332f9ad) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Branching and CI workflow

We use two persistent branches:
- dev: main development branch
- test: sandbox/testing branch

GitHub Actions CI runs on push and pull requests targeting dev and test. The workflow at .github/workflows/ci.yml performs:
- Lint (npm run lint)
- Type check (npx tsc --noEmit)
- Build (npm run build)

### Branch badge in the app
The app shows a small badge with the current branch when VITE_BRANCH_NAME is set and is not "dev". CI sets VITE_BRANCH_NAME automatically from the Git ref during the build, so preview artifacts and deployments display the branch.

### Local setup
Create a .env file (see .env.example) and optionally set:

```
VITE_BRANCH_NAME=dev
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

This is optional; the app has safe fallbacks for Supabase, and the badge is hidden if VITE_BRANCH_NAME is empty or "dev".

