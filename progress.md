# Himanshu Beads -- Project Progress

> **NOTE: This is the ONLY .md file in the project.**
> Do NOT create any other markdown files (no README.md, no CHANGELOG.md, no other docs).
> All progress, notes, and task tracking goes here and ONLY here.

---

## Project Overview

**Path:** `C:\Users\phani\Work\Office\himanshu-beads`
**Stack:** Next.js 15 (App Router), React, CSS Modules
**Backend:** Shopify Storefront API + Customer Account API (NO Admin API)
**Fonts:** Cormorant Garamond (serif display), Manrope (sans body)
**Brand colors:** Maroon `#800000`, Gold `#c5a028`, Warm cream `#fffcf8`

---

## Shopify Store Details

| Key | Value |
|-----|-------|
| Store domain | `himanshu-beadss.myshopify.com` (hyphen between himanshu and beadss) |
| Numeric shop ID | `80793764077` |
| Custom storefront | `server.himanshubeads.com` |
| Store status | Password-protected (development) |

**CRITICAL -- Domain note:**
The correct domain is `himanshu-beadss.myshopify.com` (WITH hyphen).
`himanshubeadss.myshopify.com` (no hyphen) returns 404 on all API calls -- wrong domain.
Custom domain `server.himanshubeads.com` cannot be used for API calls (Shopify limitation).

---

## ENV Variables (.env.local) -- Current Working State

| Variable | Value | Purpose |
|----------|-------|---------|
| `SHOPIFY_STORE_DOMAIN` | `himanshu-beadss.myshopify.com` | .myshopify.com domain for API calls |
| `SHOPIFY_SHOP_ID` | `80793764077` | Shop numeric ID for Customer Account API OAuth |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | `shpat_de5d...` | Private Storefront token (server-side) |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | `a89a96e6...` | Public Storefront token (client-side cart) |
| `SHOPIFY_CLIENT_ID` | `0a367a65...` | Customer Account API OAuth2 app client ID |
| `SHOPIFY_STOREFRONT_API_VERSION` | `2026-04` | Storefront API version |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | OAuth2 redirect base URL |

---

## API Architecture -- Storefront Only (no Admin API)

| Feature | API Used | Token |
|---------|----------|-------|
| Products / Collections | Storefront API | Private (`shpat_`, server-side) |
| Customer auth / login | Customer Account API (OAuth2) | OAuth2 PKCE flow |
| Cart / Checkout | Storefront API | Public or Private |

**Token type detection (auto in config.js):**
- `shpat_` or `shpss_` prefix = private token -> `Shopify-Storefront-Private-Token` header
- Any other format = public token -> `X-Shopify-Storefront-Access-Token` header

---

## Auth System -- Customer Account API (OAuth2 + OTP)

**State: WIRED -- Storefront API confirmed working, auth flow ready to test**

OpenID discovery URL (confirmed working):
`https://shopify.com/authentication/80793764077/.well-known/openid-configuration`

### Auth Flow
1. User clicks User icon -> AuthModal opens
2. Click "Continue with Email" -> GET /api/auth/shopify/login
3. Server generates PKCE + state, redirects to Shopify hosted OTP login page
4. Shopify sends 6-digit OTP to customer email, customer enters code
5. Shopify redirects to GET /api/auth/shopify/callback
6. Server exchanges code for access + refresh tokens, stores in httpOnly cookies
7. Header shows "Hi, {name}" + sign out dropdown

### REQUIRED -- Register redirect URI
Go to: Shopify Admin -> Settings -> Customer accounts -> Headless app settings
Add allowed redirect URI: `http://localhost:3000/api/auth/shopify/callback`
Production: `https://yourdomain.com/api/auth/shopify/callback`

---

## Files

### Auth API Routes
- `src/app/api/auth/shopify/login/route.js`
- `src/app/api/auth/shopify/callback/route.js`
- `src/app/api/auth/shopify/logout/route.js`
- `src/app/api/auth/shopify/me/route.js`

### Shopify Lib
- `src/lib/shopify/config.js` -- env config, auto-detects token type + header
- `src/lib/shopify/storefront.js` -- Storefront API GraphQL client
- `src/lib/shopify/products.js` -- Storefront API product queries (priceRange not priceRangeV2)
- `src/lib/shopify/customerAuth.js` -- PKCE helpers, OpenID via shop ID, token exchange
- `src/app/api/shopify/collections/route.js` -- Storefront API collections query
- `src/app/api/shopify/products/route.js` -- Storefront API products query

### React Auth Layer
- `src/components/auth/AuthContext.jsx` -- AuthProvider + useAuth hook
- `src/app/layout.js` -- wrapped with AuthProvider

---

## Completed Tasks

### [2026-04-12] Auth Modal -- Email/Password Only (initial build)
- Removed old Shopify redirect dropdown, created AuthModal component

### [2026-04-12] Auth Modal -- Logo + remove confirm password
- Replaced SVG emblem with real logo, removed confirm password field

### [2026-04-12] Research -- Shopify Auth APIs 2026
- Confirmed Storefront API customer mutations deprecated Feb 2026
- Confirmed Customer Account API is OTP + OAuth2, free on all plans

### [2026-04-12] Real Auth -- Shopify Customer Account API (OAuth2 + PKCE)
- Wired full OAuth2 PKCE flow, server-side, tokens in httpOnly cookies

### [2026-04-12] Migrate to Storefront API only + fix all env/domain issues
- Removed Admin API dependency, migrated products.js and collections/route.js to Storefront API
- Fixed priceRangeV2 -> priceRange (Storefront API field name)
- Fixed config.js to auto-detect token type (shpat_/shpss_ = private header)
- Fixed customerAuth.js OpenID URL to use shopify.com/authentication/{shopId}
- Added customer-account-api:full scope to OAuth (was missing, caused auth failures)
- **Root cause of all 500s found and fixed: domain was himanshubeadss (no hyphen)**
  Correct domain: `himanshu-beadss.myshopify.com` (WITH hyphen) -- verified working
- Both Storefront tokens confirmed working on correct domain
- Added SHOPIFY_SHOP_ID=80793764077 to env

---

## Completed Tasks (continued)

### [2026-04-13] Consolidate HomeComponents from 6 files to 3
- Merged CategoriesSection + ProductScrollSection -> ContentSection.jsx + ContentSection.module.css
- Merged TestimonialsSection + FaqSection + TrustSection -> TrustSection.jsx + TrustSection.module.css
- HeroSection.jsx kept as-is (already a clean single file)
- Deleted: CategoriesSection, FaqSection, ProductScrollSection, TestimonialsSection (8 files removed)
- Updated HomePage.jsx imports to use 3 new components
- HomeComponents folder now: HeroSection, ContentSection, TrustSection (6 files total)

---

## Completed Tasks (continued)

### [2026-04-13] Fix mobile header + hero carousel
**Header:**
- Bug 1 (sticky broken): globals.css had overflow-x:hidden on BOTH html+body which breaks
  position:sticky. Fixed to only set it on body.
- Bug 2 (hamburger does nothing): mobile drawer was inside <header> which creates its own
  CSS stacking context (z-index:100). Drawer z-index:200 was trapped inside header's context,
  effectively invisible. Fixed by moving drawer + backdrop OUTSIDE <header> into root stacking context.
- Bug 3 (white gap on mobile): .navBar had background:#fff + border on mobile even when nav
  was hidden. Fixed by replacing navBar with separate .desktopNav (display:none on mobile).
- Added slide-in transition to mobile drawer (translateX -110% -> 0).
- Logo shown inside drawer header for context.

**HeroSection:**
- Bug 4 (carousel not moving): .track had no display:contents on desktop, so tiles were
  NOT direct grid children -- grid-area declarations had no effect. Added display:contents
  for desktop (transparent wrapper, transform ignored). Mobile: display:flex (carousel works).
- Removed isMobile state check -- always auto-advance (display:contents ignores transform on desktop).
- Dots now hidden on desktop via CSS, shown only on mobile.
- Touch swipe retained.

---

## Pending / Next Up

- [ ] Test full auth login flow end-to-end in browser
- [ ] Register `http://localhost:3000/api/auth/shopify/callback` as allowed redirect URI
      in Shopify Admin -> Settings -> Customer accounts -> Headless app settings
- [ ] Add account page (/account) showing orders + profile
- [ ] Add toast notification on successful login (currently uses ?auth_error= query param)
- [ ] Configure allowedDevOrigins in next.config.js for mobile testing on LAN (192.168.0.102)

---

## Research Notes

### Shopify Token Types
- `shpat_` = Private Storefront token (new format from Headless channel/Partner Dashboard)
- `shpss_` = Private Storefront token (older format)
- Both use `Shopify-Storefront-Private-Token` header
- Public tokens (32 char hex) use `X-Shopify-Storefront-Access-Token` header

### Customer Account API
- OpenID URL: `https://shopify.com/authentication/{shopId}/.well-known/openid-configuration`
- Required scope: `openid email customer-account-api:full`
- Customer token format after login: `shcat_*`
- GraphQL endpoint: `https://{store.myshopify.com}/account/customer/api/{version}/graphql`

---

### [2026-04-13] Homepage -- Full Responsive Rewrite + Carousels

**Changes:**

**Hero section (mobile):**
- All 5 tiles now render at the same height (`min(62vw, 280px)`) and full width
- Sliding carousel via `translateX` on the track (already existed, now consistent)
- Touch swipe left/right to navigate (already existed)
- Auto-advances every 3.2s on mobile
- Replaced small circle dots with **line/dash indicators** (white dashes, active = wider + brighter)
- `heroIndicators` only shown on mobile via CSS

**Scroll indicators (line/dash carousel UI):**
- New `ScrollIndicators` reusable component renders horizontal dashes
- Inactive dash: 18px wide, gray (#dfd0c4)
- Active dash: 30px wide, brand maroon (#800000), animated with CSS transition
- Clicking a dash scrolls the container proportionally via `scrollTo`
- Added to: Featured Products, Popular Products, Testimonials
- Scroll tracking via `onScroll` handler + `getScrollDotIndex()` util function

**Categories:**
- On mobile: `scroll-snap-type: x mandatory`, no wrapping, horizontal scroll
- Category circles now `scroll-snap-align: start`

**Product cards:**
- `scroll-snap-align: start` added to `.card`
- Mobile width: `min(200px, 78vw)` (up from 178px) for better readability

**Testimonials:**
- Cards get `scroll-snap-align: start` and wider mobile basis (`min(80vw, 260px)`)
- Line indicators tracked live as user scrolls

**Trust cards:**
- Added border + border-radius + hover lift effect on all viewports
- 2x2 grid on mobile (was already, now with card styling)

**CSS class naming:**
- Entire `HomePage.module.css` rewritten with camelCase class names to match JSX
- All legacy kebab-case class names migrated

**Files:** `home/HomePage.jsx` (rewritten), `home/HomePage.module.css` (rewritten), `product/ProductCard.module.css` (updated)

---

### [2026-04-13] Homepage -- Full responsive rework + component split

**Problems fixed:**
- Hero had `padding-inline: 0.9rem` on mobile causing left/right white margins -- removed, now full-bleed
- "Menu" text replaced with Lucide `<Menu>` hamburger icon (X when open)
- Category links (Necklaces, Earrings, etc.) removed from nav -- they are shown on homepage already
- Nav on mobile is now a side-drawer (slides in from left, backdrop overlay, body scroll locked)
- Trust cards had no real card structure -- now proper bordered rounded cards, 4-col desktop, 2x2 mobile
- Testimonials cards were too narrow on mobile -- now 82vw per card with snap
- ProductCard had inconsistent width -- now `flex: 0 0 210px` on desktop, `72vw` on mobile with snap

**Homepage split into HomeComponents:**
Created `src/components/home/HomeComponents/`:
- `HeroSection.jsx` + `HeroSection.module.css` -- full-bleed carousel on mobile, grid on desktop
- `CategoriesSection.jsx` + `CategoriesSection.module.css` -- horizontal snap scroll
- `ProductScrollSection.jsx` + `ProductScrollSection.module.css` -- reusable for featured + popular, dash indicators
- `TestimonialsSection.jsx` + `TestimonialsSection.module.css` -- snap scroll cards + dash indicators
- `TrustSection.jsx` + `TrustSection.module.css` -- 4-col -> 2x2 responsive grid
- `FaqSection.jsx` + `FaqSection.module.css` -- accordion with open/close state

`HomePage.jsx` is now a thin data-fetching orchestrator only.
`HomePage.module.css` reduced to minimal shell (layout + CSS vars).

**Header rewrite:**
- Hamburger icon (Lucide Menu / X toggle) instead of text button
- Side-drawer nav on mobile/tablet with backdrop
- Nav items trimmed to: Home, About Us, New Arrivals, Sale, Return & Exchange
- `Header.module.css` fully rewritten

**Files changed:**
- `layout/Header.jsx` (rewritten)
- `layout/Header.module.css` (rewritten)
- `home/HomePage.jsx` (rewritten, thin orchestrator)
- `home/HomePage.module.css` (minimized)
- `home/HomeComponents/*.jsx` + `*.module.css` (6 new component files, 12 files total)
- `product/ProductCard.module.css` (width fix)