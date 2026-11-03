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
- Five 6.9-inch screenshots (in your Downloads, folder `app-store-screenshots`).

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

**Screenshots (iPhone 6.9")**: upload the five images from the `app-store-screenshots` folder in this order: 1-today, 2-plan, 3-workout, 4-rest, 5-clients.

**Subtitle** (30 characters max)
> Training, food & coaching

**Promotional text** (170 characters max)
> Your training plan, food log and coach in one app. Flexible plans for beginners: pick the days you can train and your sessions stay in order.

**Description**
> Project Fitness puts your training, food and coaching in one place, built by a UK personal trainer for real clients.
>
> TRAIN WITH A PLAN
> • Today shows the session that's next, with every exercise, set, rep and weight ready to go
> • Step-by-step workout mode with demos, a rest timer that buzzes when it's time, and your last weights shown for every lift
> • Flexible plans: pick the days you can make it each week and your sessions stay in order. No missed days, just a weekly target
> • Warm-ups and cool-downs that run themselves, one stretch and one side at a time
>
> EAT TO YOUR GOAL
> • Quick food logging with a UK food list and barcode lookup
> • Calories and protein at a glance, with targets set for your goal
> • Daily habits like water, steps and sleep
>
> SEE YOUR PROGRESS
> • Goals with progress bars: a bodyweight, a lift, or sessions a week
> • Weigh-in trends, personal bests and a weekly progress card to share
> • Morning readiness check that adjusts the day's session when you're run down
>
> COACH YOUR CLIENTS
> • Assign multi-week programmes with the right weights for each week
> • See who's on track and who needs a nudge at a glance
> • Clients choose what to share: weekly summaries, never individual meals
>
> Use it without an account and everything stays on your phone, or sign up to sync and link with your coach.
>
> Project Fitness isn't medical advice. Check with your GP before starting a new exercise programme if you have a health condition.

**Keywords** (100 characters max)
> workout,gym,personal trainer,coach,calorie,macro,protein,strength,programme,tracker,habit,weight

**Other fields**
- Support URL: `https://rizjr.github.io/Project-Fitness/support.html`
- Marketing URL: leave blank, or use `https://rizjr.github.io/Project-Fitness/`
- Copyright: `2026 Rizalito Jr Mangilit`
- Category: **Health & Fitness**
- Price: **Free**, in all countries or just the UK, as you prefer
- Age rating: answer **None/No** to everything. This gives a 4+ rating.

**App Review Information**
- Sign-in required: **No**. Reviewers can use the app without an account.
- Contact: your name, phone number and email
- Notes:
  > Project Fitness can be used without an account: on the first screen tap "Continue without an account", then "Skip setup". To try a programme, open Train › Programmes, add a ready-made programme and assign it to "Myself" (choose Flexible order). Tap Start to open the workout player. Optional sign-up uses email and password and enables syncing and linking with a personal trainer. Account deletion is in Settings › Cloud account › Delete my account. Notifications are local (reminders and rest timer) and are only requested when the user turns them on.

## Step 7. App Privacy questions

Go to **App Privacy**, then **Get Started**. Answer **Yes, we collect data**, then tick:

| Data type | Linked to the user? | Used for tracking? | Purpose |
|---|---|---|---|
| Contact Info › Email Address | Yes | No | App Functionality |
| Contact Info › Name | Yes | No | App Functionality |
| Health & Fitness › Health | Yes | No | App Functionality |
| Health & Fitness › Fitness | Yes | No | App Functionality |
| User Content › Other User Content (check-in notes, messages with a coach) | Yes | No | App Functionality |
| Identifiers › User ID | Yes | No | App Functionality |

Leave everything else unticked. That covers location, contacts, browsing history, purchases, ads and analytics. Progress photos stay on the phone, so they aren't "collected".

Privacy Policy URL: `https://rizjr.github.io/Project-Fitness/privacy.html`

## Step 8. Submit

1. Under **Build**, click **+** and pick the build you tested in TestFlight.
2. Click **Add for Review**, then **Submit to App Review**. A first review usually takes 1 to 3 days.
3. If Apple asks a question or rejects the app, paste their message to Claude.

---

## Updating the app later

- Edit the app as usual and push to GitHub. The website updates straight away.
- For the App Store version, start a new Codemagic build, test it in TestFlight, and in App Store Connect click **+ Version**, pick the new build and submit.
- To build automatically on every push, remove the `#` from the `triggering` lines in `codemagic.yaml`. This uses more of the 500 free minutes a month.
- To change the version number shown in the store (1.0, then 1.1 and so on), change `MARKETING_VERSION` in `ios/App/App.xcodeproj/project.pbxproj`, or ask Claude.
