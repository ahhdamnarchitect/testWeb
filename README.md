# Re-issued (replica)

A scroll-driven, Re-issued–style single-page site with video scrub, parallax image stacks, and GSAP ScrollTrigger. Built for static hosting (e.g. GitHub Pages).

## Run locally

Open `index.html` in a browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node (npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. **Push this repo to GitHub** (you already have `origin` set to `https://github.com/ahhdamnarchitect/testWeb.git`):

   ```bash
   git add .
   git commit -m "Add Re-issued replica"
   git push -u origin master
   ```

2. **Turn on GitHub Pages**  
   - Repo → **Settings** → **Pages**  
   - Under **Source**: choose **Deploy from a branch**  
   - **Branch**: `master` (or `main` if you use that)  
   - **Folder**: `/ (root)`  
   - Save.

3. **Wait a minute or two**, then open:

   `https://ahhdamnarchitect.github.io/testWeb/`

The `.nojekyll` file in the root tells GitHub Pages to serve the files as-is (no Jekyll), which is what you want for this static site.

## Features

- **Hero video** scrubbed by scroll and by holding Spacebar  
- **Sound On/Off** for the hero video (preference stored in `localStorage`)  
- **Fixed HUD** that switches to dark text on light sections  
- **Parallax image stacks** (Unsplash images)  
- **Giant SVG text** sections (“NO CAPS”, “NO TRAINERS”) with overlapping image cards  
- **Horizontal marquees** (“ENTER THE ARCHIVES”, “SHOP NOW”)  
- **Copy block** with fade-in on scroll  

## Assets

- **Local (in repo):** `assets/images/` — wordmark SVG, logo placeholders (brand + iD), `enter-the-archives.svg`, `shop-now-combo.svg`.
- **Videos:** Intro and loop clips are sourced from Pexels (direct MP4 URLs).
- **Images:** Stack photos are sourced from Unsplash (direct URLs).
