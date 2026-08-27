# TASK-004 — Side drawer, tickets, results back

**Repo:** `cric-lab-ai` (Expo)  
**Status:** Done (27 Aug 2026)

## Goal

Add a CricLab side drawer for workspace pages the tabs should not hold
(leaderboard, support tickets, notifications, coaching), and make Results
back work after processing `replace`s the job screen.

## Done when

- [x] Drawer wraps the lab tabs; hamburger on Action / Flight / History / Train / More
- [x] Drawer pages: Leaderboard, Tickets, Notifications, Coaching
- [x] Tickets talk to `/support/*` (list, create, thread, reply)
- [x] Notifications talk to `/notifications*`
- [x] Coaching lists bookings + coaches and can book / cancel a slot
- [x] Results header back pops if possible, otherwise returns to `/`
- [x] More tab has lab URL + health ping

## Out of scope

- Admin screens
- Ticket file attachments
- On-device pose
