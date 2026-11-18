# MR Apparel — Admin guide

Everything on the site is edited at **`/admin`** (e.g. https://mrapparel.pixbeelabs.com/admin). There is no server: your edits are saved to the GitHub repo and Vercel rebuilds the site in about a minute.

## One-time setup
1. Sign in with the admin password (first password is in `ADMIN_CREDENTIALS.local.md` on the computer that built the site). Change it under **Business → Settings & publish**.
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

## Pictures
- **Upload** or paste a path. Photos are shrunk to 1600px; cut-out product pictures (PNG/WebP) keep their transparent background at 1100px.
- Set a tile's **Image style** to *Photo* (fills the tile) or *Product cut-out* (fits inside it).
- For product colours, upload one picture per colour, ideally the same angle and size.

## Not editable here (needs a developer)
Page layout and animations, the intro logo animation (uses the logo's four pieces), and the 3D model files.

## If something goes wrong
- *Publish says "Bad credentials"*: the token expired. Create a new one.
- *Changes don't appear*: wait a minute and hard-refresh. Check the deployment in Vercel.
- *Mistake published*: edit and publish again, or revert the "admin: update site content" commit on GitHub.
