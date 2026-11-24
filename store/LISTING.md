# Store listing: App Store and Google Play

One copy for both stores. Images are in `store/app-store/` (iPhone 6.9", 1320 × 2868) and `store/google-play/` (phone 1080 × 2160, feature graphic 1024 × 500, icon 512 × 512).
To remake them after the app changes: serve the repo (`python3 -m http.server 8767`), then `node scripts/store/shots.mjs` and `node scripts/store/frame.mjs`.

## Names and short text

| Field | Text | Limit |
| --- | --- | --- |
| App name (both) | Project Fitness | 30 |
| App Store subtitle | Train, eat, recover, coach | 30 |
| App Store promotional text | New: cardio focus mode with live heart rate, recovery and strain from your watch, and 350+ exercises with animated demos. | 170 |
| App Store keywords | workout,gym,personal trainer,coach,calorie,macro,protein,strength,recovery,hrv,cardio,habit,weight | 100 |
| Google Play short description | Workouts, food, watch recovery and coaching from a UK personal trainer. | 80 |

## Description (both stores)

Project Fitness puts your training, food, recovery and coaching in one place, built by a UK personal trainer for real clients.

TRAIN WITH A PLAN
• Today shows the session that's next, with every exercise, set, rep and weight ready to go
• Step-by-step workout mode with your last weights for every lift and a rest timer that rings a boxing bell on time
• Your music pauses as rest ends, so you're ready for the next set (or keep it playing, your choice)
• 350+ exercises with clear animated demos, plus easy swaps for a variation when the gym is busy
• Programmes that run for weeks, with flexible days: pick when you can train and your sessions stay in order
• Warm-ups and cool-downs that run themselves, one stretch and one side at a time

CARDIO, PROPERLY TRACKED
• Focus mode: a big timer, live heart rate and zone coaching ("pick it up", "ease off", "in zone")
• Average and max heart rate and time in each zone saved with every session
• Works with chest straps and watches that broadcast heart rate, or your watch through Apple Health or Health Connect

RECOVER LIKE AN ATHLETE
• Connect Apple Health (iPhone) or Health Connect (Android) to bring in sleep, heart rate, HRV and steps from your watch
• A daily recovery score, training strain and a clear call for the day: push, train, go easy or rest
• Sleep stages, sleep need and a bedtime reminder that helps you keep a steady routine

EAT TO YOUR GOAL
• Quick food logging with a UK food list, restaurant menus and barcode lookup
• Calories and protein at a glance, with targets set for your goal
• Daily habits like water, steps and sleep

SEE YOUR PROGRESS
• Goals that fill in as you log: a lift, a bodyweight, sessions a week
• Weigh-in trends, personal bests and a weekly progress card to share
• A morning check-in that adjusts the day's session when you're run down

COACH YOUR CLIENTS
• Assign multi-week programmes with the right weights for each week
• Log a client's session as you train them, with their heart rate if they wear a strap
• See who's on track at a glance. Clients choose what to share, and individual meals are never shared

Use it without an account and everything stays on your phone, or sign up to sync and link with your coach.

Project Fitness gives coaching and general fitness guidance, not medical advice. Check with your GP before starting a new exercise programme if you have a health condition.

## Screenshot captions (already on the images)

1. Your day, planned
2. 350+ exercises, animated
3. A rest timer that rings
4. Cardio focus mode
5. Recovery from your watch
6. Goals that track themselves

## Links

- Privacy policy: https://rizjr.github.io/Project-Fitness/privacy.html
- Support: https://rizjr.github.io/Project-Fitness/support.html
- Delete your account (Google Play asks for this): https://rizjr.github.io/Project-Fitness/delete-account.html
- Terms of use: https://rizjr.github.io/Project-Fitness/terms.html
- Marketing / website: https://rizjr.github.io/Project-Fitness/
- Contact email: the one on the support page
- Category: Health & Fitness. Price: free.

## Google Play: Data safety answers

- Does the app collect or share user data? **Yes, collects.** Shared with third parties: **No** (Supabase, our database, and Anthropic, for Pulse replies, process data on our behalf as service providers, which Google doesn't count as sharing).
- Encrypted in transit: **Yes**. Users can ask for their data to be deleted: **Yes** (in the app, and the delete-account link above).
- Data types, all **collected, not shared, optional** (the app works without an account), purpose **App functionality** (plus **Account management** for name and email):
  - Personal info: Name, Email address, Phone number (optional, in the profile), User IDs
  - Health and fitness: Health info, Fitness info
  - Messages: Other in-app messages (notes with a coach, Pulse chats)
  - App activity: Other user-generated content (check-in notes)
- Not collected: location, photos and videos (progress photos stay on the phone), contacts, financial info, web browsing, device IDs, crash logs and diagnostics.

## Age rating

- If **Pulse** (the AI chat) is switched on at launch, choose an age rating of **18+** on both stores (Pulse asks people to confirm they're 18 or over). Apple: App Information › Age Rating › answer the questions, then **Override to a higher age rating** › 18+. Google: Target audience › **18 and over**.
- If Pulse isn't live yet, the answers in APP-STORE.md (Step 6) give 9+ on Apple; Google: Target audience **18 and over** anyway, as the app is made for adults.
