# Tabeebi (طبيبي)

Arabic-first doctor booking platform with doctor subscription plans.

- Live: https://tabeebi.mahmodsalah.workers.dev
- Stack: Cloudflare Worker + SQLite Durable Object (transactional slot booking), vanilla ES-module SPA.
- Roles: patient, doctor (admin-approved), admin. Plans: Basic, Plus, Premium (payments not connected yet; admin activates).
- Demo data: all seeded doctors are fictional.

Deploy: `npx wrangler deploy` (secret `ADMIN_PASSWORD` seeds the admin account).

By Mahmoud Salah.
