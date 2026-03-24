# Sterp v2

## What This Is
Personal product page platform — sterp.com/username. Real people sharing the stuff they actually own and use.

## Tech Stack
- Next.js (App Router) + TypeScript
- Supabase (Postgres, Auth, Storage)
- Tailwind CSS
- Vercel hosting

## Key Design Rules
- Mobile-first
- No fat colored CTA buttons — use subtle "View Product →" text links
- The page should feel personal, not like a storefront
- Real photos, not stock images
- Inter or system font stack
- Consistent 4:3 image aspect ratios

## Page Structure
- Profile header: avatar, name, location, bio
- Horizontal scrollable tab bar: Favorites (leftmost, default) → Collections → Archive (rightmost, clock icon, dark active state)
- Product cards: photo, name, one-liner, "View Product →" link
- Archive cards: photo, name, duration badge, memory note, former collection tag — NO buy link, NO one-liner

## Who Works on What
- **Cam:** Frontend/UI via Claude Code — styling, layout, components, mobile responsiveness
- **Tumay:** Backend — auth, database, API routes, affiliate logic, image upload

## Full spec available in the project's Claude.ai workspace