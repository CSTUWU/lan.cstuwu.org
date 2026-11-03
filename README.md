# CST LAN Challenge 2026 – Frontend Application

Official Next.js esports tournament web platform for **CST LAN Challenge 2026 (Counter-Strike 2)**, hosted by the Computer Science and Technology Degree Programme, Faculty of Applied Sciences, Uva Wellassa University of Sri Lanka (UWU).

---

## 1. Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: GSAP, GSAP ScrollTrigger
- **Smooth Scroll**: Lenis
- **Icons**: Lucide React
- **Real-Time Projection**: Web Audio API Sound Cues, BroadcastChannel (<10ms sync), REST polling

---

## 2. Directory Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Cinematic Hero with Vector & Reaper, Countdown, Rules
│   ├── about/                      # CST UWU collegiate mission, venue, rules
│   ├── teams/                      # Participating squads & 5-man rosters
│   ├── register/                   # 4-step tactical registration wizard with Cloudinary logo upload
│   ├── schedule/                   # Tournament fixtures & CS2 map pool lineup
│   ├── scoreboard/
│   │   ├── page.tsx                # Audience scoreboard & standings matrix
│   │   └── live/page.tsx           # Stage projector HUD with C4 strobe & sound cues
│   ├── admin/
│   │   ├── page.tsx                # Secured manual entry admin access gate
│   │   ├── dashboard/              # Command telemetry & overview KPI
│   │   ├── registrations/          # 5-man roster review, approve & reject controls
│   │   ├── teams/                  # Team-wise squad & athlete dossier
│   │   ├── matches/                # CS2 fixture scheduling desk
│   │   ├── scoreboard/             # 1-click referee scoring desk & side switch
│   │   └── countdown/              # Tournament target date chronometer
│   └── layout.tsx                  # Root layout & navbar
├── components/
│   ├── admin/                      # AdminLayout, AdminNav, AdminLoginView
│   ├── home/                       # HeroSection, CountdownSection, FormatSection, Commanders
│   ├── layout/                     # Navbar, Footer
│   └── ui/                         # Buttons, Badges, Glass Panels
├── lib/
│   ├── api.ts                      # Backend API client with HTTP-only credentials
│   ├── storage.ts                  # Local fallback & cross-tab BroadcastChannel
│   ├── transformers.ts             # Backend data payload normalizers
│   └── types.ts                    # TypeScript domain definitions
├── public/
│   └── images/
│       └── commanders/
│           ├── vector.jpeg         # Commander Vector (CT)
│           └── reaper.jpeg         # Commander Reaper (T)
├── .env.local
└── package.json
```

---

## 3. Environment Variables

Create `.env.local` inside `frontend/`:

```env
# URL pointing to your backend API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production deployment (e.g., Vercel):
Set `NEXT_PUBLIC_API_URL` to your production backend endpoint (e.g., `https://cst-lan-backend.onrender.com/api`).

---

## 4. Scripts

Inside `frontend/`:

```bash
# Install dependencies
npm install

# Start Next.js development server on port 3000
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

---

## 5. Production Deployment (Vercel)

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** setting in Vercel to `frontend`.
3. Add the environment variable:
   - `NEXT_PUBLIC_API_URL`: Your live backend API URL (e.g. `https://your-backend.onrender.com/api`).
4. Click **Deploy**.

