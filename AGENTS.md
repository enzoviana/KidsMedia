<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- External REST API (backendkids.onrender.com) is called from the browser via `src/lib/api.ts`; every dashboard widget reads through `useApiOrDemo` + a spec in `src/lib/specs.ts` — why: missing/failing routes fall back to demo data and auto-list on /routes-manquantes.
- Role themes are applied with `data-theme` on the dashboard wrapper (tokens in styles.css) — why: one layout, five palettes.
- Sidebar links per role live in `src/components/dash/nav.ts`; list pages use `ListPage` (`src/components/dash/list-page.tsx`) — why: one place per role menu, every list page gets search + demo fallback for free.
- Writes go through `send()` in `src/lib/mutate.ts` (simulated in demo mode); list pages get Add/View/Edit/Delete by passing a `crud` config to `ListPage` — why: one generic CRUD flow for every list.
- Login is 2-step (credentials then SMS code via `loginStart`/`mfaSend`/`mfaVerify` in api.ts) — why: the session is only saved after the SMS code is verified.
- Cahier des charges modules (vaccins, consentements, access guard, IA demo engine) live in `src/components/dash/medical.tsx` + `src/lib/demo-medical.ts` — why: pure rules are unit-tested and swap to real API once specs flip to "ok".
- Parent is a 6th RoleKey with its own theme/nav/home (`/parent`) — why: the CDC requires a parent space.
- Every account gets a beta ticket button and avatar in the shell header (`src/components/dash/beta.tsx`); subscriptions use a simulated Stripe checkout (`stripe.tsx`) until the API's checkout route exists — why: one place for beta support and payment swap-in.
- Child list names, view actions and row clicks resolve IDs with `enfantIdOf` and open the dedicated child route; interactive controls keep their own actions — why: consistent dossier navigation without interfering with edits or deletions.
- Coordination rules and temporary demo interactions live in `src/lib/coordination.ts`; shared controls and `/coordination` consume specs through `useApiOrDemo` and `writeSpec` — why: unavailable writes are explicitly simulated, documents reach the child dossier, and no demo data is persisted or used as server authorization.
- The API base URL comes from `VITE_API_URL` with the Render backend as default (`src/lib/api.ts`) — why: the generated Express/Prisma backend can run on any host without code changes.
- The installable mobile app lives in one route `/app` (tabs via `?tab=`), with install prompt/QR in `src/components/pwa/install.tsx` and live notifications polled in `src/lib/live-notify.ts` — why: manifest start_url targets /app and no service worker is needed for installability.
- 2FA alternatives (TOTP, passkeys, trusted devices, email code) live in `src/components/auth/` + `mfa*` helpers in `src/lib/api.ts`; the server alone validates device tokens — why: cut SMS costs without trusting the client.
