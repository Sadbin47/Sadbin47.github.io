# sadbin47.github.io

Personal portfolio of **Md. Sadbin Hossain**, a CSE undergraduate and student researcher at AIUB, working on efficient, explainable deep learning for medical imaging and privacy-aware healthcare systems.

**Live:** https://sadbin47.github.io

The site is plain HTML, CSS and JavaScript. It has no framework, no build step and no dependencies. It looks like a Hyprland desktop, in the Catppuccin palette: Mocha for dark, Latte for light.

## Features

- **Waybar navigation.** Six workspaces (press `1`–`6`), a live Dhaka clock and a theme switch (press `T`).
- **A working terminal** in the hero. Try `help`, `projects`, `cd research` or `sudo hire-me`.
- **Research tracker.** Each manuscript shows where it is in the review pipeline.
- **ResQRoute demo.** A small flood-aware A* router you can play with: tap roads to flood or block them.
- **Light and dark themes.** The site follows the system setting until the visitor picks one, then remembers the choice.
- **Accessible.** Semantic HTML, full keyboard use, `prefers-reduced-motion` support, and no content that needs JavaScript to appear.
- **Ready to share.** Open Graph card, JSON-LD, sitemap and a custom 404 page.

## Deploy on GitHub Pages

1. Create a **public** repository named exactly `Sadbin47.github.io`.
2. Put the contents of this folder in the root of that repository:

   ```bash
   cd Portfolio_Website
   git init -b main
   git add .
   git commit -m "Add portfolio"
   git remote add origin https://github.com/Sadbin47/Sadbin47.github.io.git
   git push -u origin main
   ```

3. In the repository, open **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, the branch to `main` and the folder to `/ (root)`. Save.
4. Wait a minute or two, then open https://sadbin47.github.io.

**Using another repository name** (for example `portfolio`) puts the site at `https://sadbin47.github.io/portfolio/`. In that case:

- change `https://sadbin47.github.io/` in `index.html` (canonical and social tags), `robots.txt` and `sitemap.xml`;
- in `404.html`, change every root path (`/assets/…`, `href="/"`, `/#projects`) to start with `/portfolio/`.

## Preview locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Open the site through a local server like this, not by double-clicking `index.html`, so the paths resolve the same way they do on GitHub Pages.

## Edit the content

All content is in `index.html`, one commented block per section.

| What | Where |
| --- | --- |
| Name, tagline, fastfetch lines | `1 · Home` |
| Bio, education, `now.log`, interests | `2 · About` |
| Papers, status and pipeline | `3 · Research` |
| ResQRoute, the s4d toolkit, research code, coursework | `4 · Projects` |
| Skills, milestones, workshops and hackathons | `5 · Stack` |
| Email and links | `6 · Contact` |
| CV | Replace `CV.pdf` and keep the file name |

**When a paper changes stage:**

1. Update its status text and `data-status` (`review`, `internal` or `draft`).
2. Move `aria-current="step"` to the new step, and give every earlier step `class="is-done"`.
3. Update the hidden “Progress: stage N of 4” line above the pipeline.
4. Update the numbers in the stats row, the `now.log` window and the “Status as of” date.
5. Update the terminal’s `research` command in `assets/js/main.js`.

**Colours, fonts and spacing** are tokens at the top of `assets/css/style.css`.

**Star counts** in the HTML are fallbacks. When the page loads, it fetches the current counts from the GitHub API once per visit.

## Project structure

```
index.html            the page
404.html              “No such file or directory” page
CV.pdf                downloadable CV
assets/css/style.css  all styles
assets/js/main.js     theme, terminal, scroll-spy, ResQRoute demo (progressive enhancement)
assets/img/           favicon, touch icon, social card (og.png)
robots.txt  sitemap.xml  .nojekyll
```

## Credits

- Colour palette: [Catppuccin](https://github.com/catppuccin/catppuccin) (MIT)
- Fonts: [Geist](https://fonts.google.com/specimen/Geist) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (SIL Open Font License), served by Google Fonts
- Icons: [Lucide](https://lucide.dev) (ISC); GitHub and LinkedIn marks from [Simple Icons](https://simpleicons.org) (CC0)
