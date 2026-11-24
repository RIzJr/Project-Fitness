# Project Fitness on the App Store

Everything here can be done from a Windows PC in a web browser. The cloud Mac (Codemagic) builds the app.

**Already done in this repo**
- The iPhone app wrapper: Capacitor, with the files in `ios/`, `package.json` and `capacitor.config.json`.
- The cloud build file: `codemagic.yaml`.
- Native vibration, plus on-phone notifications for rest-over, "still training?" and the daily reminders. Apple's review needs these, and web push doesn't work inside an App Store app.
- The app is set to iPhone only, so no iPad screenshots are needed. It's portrait only, and the export-compliance question is answered in the app's settings file.
- A 1024 × 1024 app icon, plus support and privacy pages:
  - https://rizjr.github.io/Project-Fitness/support.html
  - https://rizjr.github.io/Project-Fitness/privacy.html
- Six 6.9-inch screenshots in `store/app-store/`, and all the listing text in `store/LISTING.md`.

**App details used everywhere**
- Bundle ID: `com.rizjr.projectfitness`. It must match exactly in every step below.
- App name: Project Fitness. If the name is taken, use "Project Fitness Coach". Changing the app name later doesn't change the bundle ID.

---

## Step 1. Register the bundle ID (5 min)

Do this once Apple confirms your membership by email.

1. Go to developer.apple.com/account, then **Certificates, IDs & Profiles**, then **Identifiers**, then **+**.
2. Choose **App IDs**, then **App**, then Continue.
3. Fill in:
   - Description: `Project Fitness`
   - Bundle ID: choose **Explicit** and enter `com.rizjr.projectfitness`
4. Leave the capabilities as they are. The on-phone notifications don't need Push Notifications turned on.
5. Click Continue, then Register.

## Step 2. Create the app in App Store Connect (5 min)

1. Go to appstoreconnect.apple.com, then **Apps**, then **+**, then **New App**.
2. Fill in:
   - Platform: **iOS**
   - Name: `Project Fitness`
   - Primary language: **English (U.K.)**
   - Bundle ID: pick `com.rizjr.projectfitness`
   - SKU: `projectfitness1`
   - User access: Full access
3. Click Create.

## Step 3. Create the API key that lets the cloud build upload (5 min)

1. In App Store Connect, go to **Users and Access**, then **Integrations**, then **App Store Connect API**.
2. If asked, click **Request Access** first.
3. Under Team Keys, click **+**:
   - Name: `Codemagic`
   - Access: **App Manager**
4. Write down the **Issuer ID** (at the top) and the **Key ID**.
5. Click **Download API Key** to get the `.p8` file. You can only download it once, so keep it safe and never put it in the repo.

## Step 4. Set up Codemagic (10 min)

1. Go to codemagic.io and sign up with your **GitHub** account.
2. Add the `RIzJr/Project-Fitness` repository. When asked about the project type, choose **codemagic.yaml**.
3. Click your name, then **Team settings** (or Personal account), then **Team integrations**, then **Developer Portal**, then **Manage keys**, then **Add key**.
   - Name: `PF ASC key`. It must match the name in `codemagic.yaml`.
   - Fill in the Issuer ID and Key ID, and upload the `.p8` file.
4. Go to **codemagic.yaml settings**, then **Code signing identities**.
   - Under **iOS certificates**, click **Generate certificate**:
     - Type: Apple Distribution
     - Key: PF ASC key
     - Reference name: `pf_dist`
     - Download the certificate and its password when shown, and keep them safe.
5. Create the provisioning profile on Apple's site:
   - Go to developer.apple.com/account, then **Certificates, IDs & Profiles**, then **Profiles**, then **+**.
   - Under Distribution, choose **App Store Connect**, then Continue.
   - App ID: `com.rizjr.projectfitness`
   - Certificate: the one Codemagic just made (it shows today's date)
   - Profile name: `Project Fitness App Store`
   - Click Generate. There's no need to download it.
6. Back in Codemagic, under **iOS provisioning profiles**, click **Fetch profiles**. Tick `Project Fitness App Store`, give it the reference name `pf_appstore`, and click **Download selected**.

## Step 5. First build to TestFlight (15 min, mostly waiting)

1. In Codemagic, open the app, click **Start new build**, pick the branch `main` and the workflow **iOS to TestFlight**, then click Start.
2. When it finishes (about 10 to 15 minutes), the build appears in App Store Connect under **TestFlight**. Apple then processes it for another 5 to 30 minutes.
3. Install the **TestFlight** app on your iPhone. In App Store Connect, go to TestFlight and add yourself under **Internal Testing**. Then install from the TestFlight app.
4. To test with clients, go to TestFlight, then **External Testing**, then **+** to add a group, add the build, and turn on the **public link**. Send the link to Siham and the others. The first external build gets a short beta review, usually within a day.

**If a build fails**, open the failed step's log in Codemagic and send it to Claude.

## Step 6. Store listing (copy and paste)

In App Store Connect, open the app and go to **Distribution**, then **iOS App 1.0**.

**Screenshots (iPhone 6.9")**: upload the six images in `store/app-store/` in order (1-today … 6-goals). They're also on GitHub: github.com/RIzJr/Project-Fitness/tree/main/store/app-store.

**Subtitle, promotional text, description, keywords**: copy them from `store/LISTING.md` (the same text is used on Google Play).

**Other fields**
- Support URL: `https://rizjr.github.io/Project-Fitness/support.html`
- Marketing URL: leave blank, or use `https://rizjr.github.io/Project-Fitness/`
- Copyright: `2026 Rizalito Jr Mangilit`
- Category: **Health & Fitness**
- Price: **Free**, in all countries or just the UK, as you prefer
- Age rating: if Pulse (the AI chat) is live when you submit, choose **18+** (see `store/LISTING.md`). Otherwise (Apple's questionnaire changed in 2025): answer **Health or Wellness Topics: Frequent** (training, nutrition, sleep and recovery are the whole app) and **Medical or Treatment Information: Infrequent** (the health check and "see your GP" notes, no treatment advice). **Messaging**: Yes (coach notes) and **User-Generated Content**: Yes (check-in notes). Everything else **None/No**, including Unrestricted Web Access (outside links open Safari). This should give **9+**. Because the app is designed for adults, you can choose a higher rating if you prefer; it doesn't change anything else.

**App Review Information**
- Sign-in required: **No**. Reviewers can use the app without an account.
- Contact: your name, phone number and email
- Notes:
  > Project Fitness can be used without an account: on the first screen tap "Continue without an account", then "Skip setup". To try a programme, open Train › Programmes, add a ready-made programme and assign it to "Myself" (choose Flexible order). Tap Start to open the workout player. Optional sign-up uses email and password and enables syncing and linking with a personal trainer. Account deletion is in Settings › Cloud account › Delete my account. Notifications are local (reminders and rest timer) and are only requested when the user turns them on. Cardio (Train › Cardio › Start) opens a full-screen focus mode with a timer and heart rate. When a rest timer ends while the app is open, the app briefly takes the audio session so the person's music pauses for their next set; this is a setting (Settings › Rest timer › Your music) and the app has no background audio.

## Step 7. App Privacy questions

Go to **App Privacy**, then **Get Started**. Answer **Yes, we collect data**, then tick:

| Data type | Linked to the user? | Used for tracking? | Purpose |
|---|---|---|---|
| Contact Info › Email Address | Yes | No | App Functionality |
| Contact Info › Name | Yes | No | App Functionality |
| Contact Info › Phone Number (optional, in the profile) | Yes | No | App Functionality |
| Health & Fitness › Health | Yes | No | App Functionality |
| Health & Fitness › Fitness | Yes | No | App Functionality |
| User Content › Other User Content (check-in notes, messages with a coach) | Yes | No | App Functionality |
| Identifiers › User ID | Yes | No | App Functionality |

Leave everything else unticked. That covers location, contacts, browsing history, purchases, ads and analytics. Progress photos stay on the phone, so they aren't "collected".

Privacy Policy URL: `https://rizjr.github.io/Project-Fitness/privacy.html`

Terms of use: leave Apple's standard licence agreement selected (App Store Connect › App Information › License Agreement). Our own plain-English terms are at `https://rizjr.github.io/Project-Fitness/terms.html` and linked in Settings › About; you can add that link to the app description if you like.

## Step 8. Submit

1. Under **Build**, click **+** and pick the build you tested in TestFlight.
2. Click **Add for Review**, then **Submit to App Review**. A first review usually takes 1 to 3 days.
3. If Apple asks a question or rejects the app, paste their message to Claude.

---

## Apple Health (HealthKit)

The app code is already done. Before the next build, turn HealthKit on for the app with Apple, or the build will fail at code signing.

1. Go to developer.apple.com/account, then **Certificates, IDs & Profiles**, then **Identifiers**, and click `com.rizjr.projectfitness`.
2. In the Capabilities list, tick **HealthKit**. Leave "Clinical Health Records" and "Background Delivery" unticked. Click **Save**, then **Confirm**. Apple warns that profiles will need regenerating; that's expected.
3. Go to **Profiles** and click `Project Fitness App Store` (it now says Invalid). Click **Edit**, check the certificate is still ticked, then **Save**. It's valid again.
4. In Codemagic, open **Team settings** (or Personal account), then **codemagic.yaml settings**, then **Code signing identities**, then **iOS provisioning profiles**. Delete the old `pf_appstore`, click **Fetch profiles**, tick `Project Fitness App Store`, give it the reference name `pf_appstore` again, and click **Download selected**.
5. Start a new build (Step 5). When it's in TestFlight, update the app, open **Settings › Apple Health › Connect Apple Health** and allow access on Apple's screen.

**For App Review**, add this to the review notes:
> Apple Health is optional (Settings › Apple Health). It saves finished workouts and weigh-ins to Health. It reads steps (to tick the steps habit), sleep with stages (sleep card, bedtime reminder, morning check-in), weight (smart-scale weigh-ins), heart rate (heart rate in workouts and daily training load), resting heart rate, heart rate variability, breathing rate, blood oxygen, wrist temperature and VO2 max (a daily recovery score, a "health monitor" comparing each reading with the person's own 30-day normal, and a daily training suggestion). Readings come from the user's watch via Apple Health, not the phone's sensors, and the app labels them as coaching guidance, not medical advice. If the user turns on "Share my watch data with my coach", a 30-day daily summary goes to the personal trainer they linked with. Health data isn't used for advertising or stored in iCloud. Bluetooth is used only to connect a heart-rate monitor (chest strap, or a watch broadcasting heart rate) during a workout; the reviewer can see the search screen from a workout via the heart icon.

**App Privacy**: nothing new to tick. Health & Fitness › Health and Fitness are already declared.

## Pulse, the AI motivator (version 1.1)

Pulse is a text chat that helps clients stay consistent. The app code is done; it needs three things on the server before it works, and the App Store notes below when you submit it.

1. **API key.** Go to console.anthropic.com, create an account (add a payment card; usage is pennies per conversation), then **API Keys › Create key**. Copy it. Don't paste it anywhere else.
2. **Database.** Supabase dashboard › SQL Editor › New query › paste all of `supabase-update-5.sql` › Run.
3. **Server function.** Supabase › Edge Functions › **Deploy a new function** › name it `companion` › paste `supabase/functions/companion/index.ts` › Deploy. Turn **Verify JWT off**, like reminders (the code checks who is signed in itself). Pulse stays hidden in the app until this step is done. Then Project Settings › Edge Functions › **Secrets** › add `ANTHROPIC_API_KEY` with the key from step 1. Optional: `COMPANION_DAILY_LIMIT` (default 40 messages a person a day).

**App Privacy:** nothing new to tick (Health & Fitness and Other User Content are already declared). Apple's rule 5.1.2(i) needs a clear permission before data goes to a third-party AI: the app shows a consent screen naming Anthropic before the first chat.

**For App Review**, add to the review notes:
> Pulse (Today › Talk to Pulse) is an optional AI motivator for adults. Before the first chat it explains that messages, and optionally a short training summary, are sent to Anthropic to write replies, and asks the user to agree and confirm they're 18 or over. It needs a free account: use the demo account below. Replies are coaching only; messages about self-harm, chest pain or eating-disorder signs get fixed answers with UK helplines (Samaritans, 999/111, Beat) and never go to the AI. Users can delete their chats in Settings › Pulse.

## Updating the app later

- Edit the app as usual and push to GitHub. The website updates straight away.
- For the App Store version, start a new Codemagic build, test it in TestFlight, and in App Store Connect click **+ Version**, pick the new build and submit.
- To build automatically on every push, remove the `#` from the `triggering` lines in `codemagic.yaml`. This uses more of the 500 free minutes a month.
- To change the version number shown in the store (1.0, then 1.1 and so on), change `MARKETING_VERSION` in `ios/App/App.xcodeproj/project.pbxproj`, or ask Claude.
