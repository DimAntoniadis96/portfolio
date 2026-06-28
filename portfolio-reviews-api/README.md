# Portfolio Reviews API

A tiny serverless guestbook API for the portfolio's Reviews section.
Same stack as godkode: **Vercel serverless function + MongoDB Atlas + Mongoose**.

Endpoints (all under the deployed base URL):

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| `GET` | `/reviews` | — | List reviews → `{ reviews: [...] }` |
| `POST` | `/reviews` | `{ id, alias, authorId, body, replyTo }` | Add a comment/reply |
| `PATCH` | `/reviews/alias` | `{ authorId, alias }` | Rename all of one visitor's comments |

---

## Setup (one time, ~20 min)

### Step 1 — MongoDB Atlas (free database)

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up.
2. Create a **free M0 cluster** (any cloud/region near you — e.g. Frankfurt).
3. **Database Access** → Add New Database User → username + password (save these).
4. **Network Access** → Add IP Address → **Allow Access From Anywhere** (`0.0.0.0/0`).
   ⚠️ Required — Vercel's serverless IPs aren't fixed; without this every DB call times out.
5. **Database** → Connect → Drivers → copy the connection string. It looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   Replace `USER`/`PASSWORD` with the user from step 3, and add a db name before the query string:
   `...mongodb.net/portfolio?appName=Cluster0`

### Step 2 — Deploy to Vercel

From this folder:

```bash
npm i -g vercel        # if you don't have the CLI
vercel login           # run yourself (interactive)
vercel                 # first deploy → answer the prompts, link a new project
```

### Step 3 — Add environment variables

```bash
vercel env add MONGO_URI            # paste the Atlas string from Step 1
vercel env add ALLOWED_ORIGINS      # your portfolio domain(s), comma-separated
```

`ALLOWED_ORIGINS` example: `https://portfolio-sigma-seven-8hho4d2jsf.vercel.app,https://yourdomain.com`
(localhost:5173 and localhost:5174 are allowed for local dev.)

### Step 4 — Promote to production

```bash
vercel --prod
```

Copy the production URL it prints (e.g. `https://portfolio-reviews-api.vercel.app`).

### Step 5 — Point the portfolio at it

In the **Portfolio** project, set the env var:

```bash
# .env.local for local dev
VITE_REVIEWS_API_BASE_URL=https://portfolio-reviews-api.vercel.app
```

And add the same var in the Portfolio's Vercel project settings for production.
Redeploy the portfolio. Done — comments are live.

For this portfolio, the production origin already allowed in `api/reviews.js` is:
`https://portfolio-sigma-seven-8hho4d2jsf.vercel.app`

---

## Test it

```bash
# list (empty at first)
curl https://YOUR-API.vercel.app/reviews

# add one
curl -X POST https://YOUR-API.vercel.app/reviews \
  -H 'Content-Type: application/json' \
  -d '{"id":"test-1","alias":"Me","authorId":"abc","body":"first!","replyTo":null}'
```

## Moderating / deleting comments

Use the Atlas UI: **Browse Collections → portfolio_reviews → delete** any row.
(No admin auth is built in — same as godkode. Ask if you want a delete route + secret.)
