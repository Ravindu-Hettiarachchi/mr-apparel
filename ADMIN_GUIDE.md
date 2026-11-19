# MR Apparel — Admin guide

Everything on the site is edited at **`/admin`** (e.g. https://mrapparel.pixbeelabs.com/admin). There is no server: your edits are saved to the GitHub repo and Vercel rebuilds the site in about a minute.

## One-time setup
1. Sign in with the admin password (the eye icon on any password box shows or hides what you type) (first password is in `ADMIN_CREDENTIALS.local.md` on the computer that built the site). Change it under **Business → Settings & publish**.
2. Create a GitHub token: GitHub → Settings → Developer settings → Fine-grained tokens → repository `mr-apparel` only → permission **Contents: Read and write**.
3. Paste it into **Settings & publish → GitHub token**, click **Test connection**. The token stays in your browser only.

## Daily use
1. Pick a section on the left, edit text, prices or images.
2. **Preview on** shows your draft on the real site in this browser only (open the site in another tab). Nobody else sees it.
3. Click **Publish** (top right). Images are uploaded and the content is saved; the live site updates in ~1 minute.

Drafts auto-save in your browser. **Discard draft** resets to the live version.

## What you can change

| Section | What it controls |
|---|---|
| **Hero & moving photos** | Headline, highlighted words, intro text, button labels, and every photo/product picture in the moving gallery (add, remove, reorder) |
| **Category tiles** | The four tiles under the hero: title, subtitle, picture, where they link |
| **Scrolling ticker** | The black strip of words |
| **Headings & intro text** | Heading, small label and intro line of every section |
| **Products, prices & colours** | Product name, category, fabric, **price**, tag, main picture, and each **colour with its own picture** |
| **Materials / Finishes** | Fabric weights, scores, finish descriptions and pictures |
| **Our work (portfolio)** | Real jobs: title, client, quantity, year, description, photo |
| **Testimonials, FAQ, Who we serve, Quality points, Numbers, Process** | Their text |
| **Brand & logo** | Business name, description, **logo image** |
| **Contact details / Social media** | WhatsApp number, phone, email, address, hours, social links (empty = hidden) |

## Pictures: exact sizes
Every upload button in the admin shows the exact size for that picture, the format, where it appears, and a live check of the current picture (green = perfect, amber = will be cropped or slightly small, red = too small). **Image size guide** in the sidebar (Business) lists them all in one table.

| Picture | Size (px) | Shape | Format |
|---|---|---|---|
| Hero gallery: photo | 1000 × 1250 | 4:5 portrait, edges may be cropped | JPG / WebP, under 300 KB |
| Hero gallery: product cut-out | 1000 × 1250 | 4:5, fits inside | PNG / WebP, transparent background |
| Category tile: photo | 900 × 1200 | 3:4 portrait, edges may be cropped | JPG / WebP, under 300 KB |
| Category tile: product cut-out | 900 × 1200 | 3:4, fits inside | PNG / WebP, transparent background |
| Product: main picture | 900 × 1125 | 4:5, fits inside | PNG / WebP, transparent background |
| Product: colour picture | 900 × 1125 | 4:5, same angle as the main picture | PNG / WebP, transparent background |
| Our work: portfolio photo | 1200 × 1500 | 4:5 portrait (square also fine), any height | JPG / WebP, under 400 KB |
| Finish: card picture | 1600 × 1000 | 16:10 landscape, edges may be cropped | JPG / WebP, under 350 KB |
| Logo | 240 × 127 | wide, about 1.9:1 | PNG, transparent background |

- Pictures bigger than the size are shrunk automatically on upload. Smaller ones are never stretched, but can look soft.
- Set a tile's **Image style** to *Photo* (fills the tile, centre kept) or *Product cut-out* (fits inside, needs a transparent background). The size shown switches with it.
- For product colours, use the same angle, size and position for every colour so the swap looks smooth.
- The opening logo animation uses its own four logo pieces and does not change when you replace the logo.

## Not editable here (needs a developer)
Page layout and animations, the intro logo animation (uses the logo's four pieces), and the 3D model files.

## If something goes wrong
- *Publish says "Bad credentials"*: the token expired. Create a new one.
- *Changes don't appear*: wait a minute and hard-refresh. Check the deployment in Vercel.
- *Mistake published*: edit and publish again, or revert the "admin: update site content" commit on GitHub.
