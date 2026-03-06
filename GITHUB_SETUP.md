# Push to GitHub

1. **Create a new repository** on [github.com/new](https://github.com/new)
   - Name it `brief` (or any name)
   - Don't initialize with README (this project already has one)

2. **Add the remote and push:**
   ```bash
   cd c:\Users\andre\Downloads\brief
   git remote add origin https://github.com/YOUR_USERNAME/brief.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

3. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the GitHub repo
   - Link a Blob store (Storage tab) for add/delete to work
   - Deploy
