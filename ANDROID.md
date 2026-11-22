# Project Fitness on Android (Google Play)

The Android app is the same app as the iPhone one (Capacitor, folder `android/`), built in the cloud by Codemagic.
Watch data comes in through **Health Connect** (Android's version of Apple Health) instead of Apple Health.

What you do once, in order:

1. Google Play developer account
2. Upload key in Codemagic
3. Create the app in Play Console
4. First build and first upload (by hand, once)
5. Add testers (internal testing)
6. Let Codemagic upload every build after that
7. Later: closed test (12 testers, 14 days), then production

---

## 1. Google Play developer account

1. Go to **play.google.com/console/signup** and sign in with the Google account you want to own the app.
2. Choose **Personal** account (unless you have a registered company with a D-U-N-S number).
3. Pay the one-off **US$25** fee and complete identity verification (photo ID). Google can take a few days to verify.
4. Google also asks you to verify a phone number and that you own an Android phone (it uses the Play Console app on it).

## 2. Upload key in Codemagic

Claude made an upload key for you: `pf-upload.jks` plus a text file with its password. Keep both safe (password manager); every Android build must be signed with this key.

1. Codemagic › **Team settings** › **codemagic.yaml settings** › **Code signing identities** › **Android keystores**.
2. Upload `pf-upload.jks`, enter the keystore password, key alias `pf-upload` and the key password (same as the keystore password).
3. Reference name: **PF upload key** (exactly this; `codemagic.yaml` uses it).

Google Play keeps the real app signing key ("Play App Signing"). If you ever lose the upload key, you can ask Google to reset it in Play Console › Setup › App signing.

## 3. Create the app in Play Console

1. Play Console › **Create app**. Name: Project Fitness. Language: English (United Kingdom). App, Free.
2. Tick the declarations and **Create app**.
3. In the dashboard, **Set up your app** lists the forms. Fill them in as you go (they're needed before any review):
   - **Privacy policy**: `https://rizjr.github.io/Project-Fitness/privacy.html`
   - **App access**: some features need an account. Give Google a test login if they ask (an email + password you create for them; don't use your own).
   - **Ads**: No ads.
   - **Content rating**: questionnaire, category Health & Fitness / utility, no violence etc.
   - **Target audience**: 18 and over (Pulse is 18+).
   - **Data safety**: collects health and fitness info (sleep, heart rate, weight, workouts), personal info (name, email), app activity. Encrypted in transit; users can request deletion; not shared with third parties except Anthropic for Pulse replies when the user turns Pulse on; not used for advertising.
   - **Health apps** / **Health Connect permissions** declaration: say which Health Connect data you read and why (below).
   - **Category**: Health & Fitness. Contact email: your support email.

Health Connect reasons (one line each is enough):

| Permission | Why Project Fitness needs it |
| --- | --- |
| Read steps | Ticks off the daily steps habit and shows activity for the day |
| Read heart rate | Shows average and peak heart rate for each workout and works out daily training strain |
| Read resting heart rate | Part of the daily recovery score and the health monitor (compared with the person's own normal) |
| Read heart rate variability | Main input to the daily recovery score and training call |
| Read respiratory rate | Health monitor: flags breathing rate above the person's normal (possible illness sign) |
| Read oxygen saturation | Health monitor: flags low overnight blood oxygen |
| Read VO₂ max | Shows fitness trend to the user and their coach |
| Read sleep | Fills in the morning check-in, sleep need and bedtime reminder |
| Read weight / Write weight | Adds weigh-ins from smart scales; saves weigh-ins logged in the app |

The app only asks for these; the unused ones the health plugin declares are removed in `android/app/src/main/AndroidManifest.xml`.

## 4. First build and first upload (once)

Google only accepts the very first upload by hand.

1. Codemagic › Project Fitness › **Start new build** › workflow **Android app bundle (first upload)** › branch `main`.
2. When it finishes, download the `.aab` file from the build's **Artifacts**.
3. Play Console › **Test and release** › **Testing** › **Internal testing** › **Create new release**.
4. If asked about app signing, choose **Use Google-generated key** (recommended).
5. Upload the `.aab`, release name e.g. `1 (first)`, **Next** › **Save and publish**.

## 5. Add testers (internal testing, up to 100 people)

1. Play Console › **Internal testing** › **Testers** tab › **Create email list**, e.g. "Clients", add each tester's Google account email (the one on their Android phone). Save.
2. Tick the list, **Save**.
3. Copy the **opt-in link** (Testers tab, "How testers join your test") and send it to them.
4. Each tester opens the link on their Android phone, taps **Accept invite** / **Become a tester**, then **Download it on Google Play**. Updates come through the Play Store like any app.

Internal testing has no Google review, so new builds reach testers within minutes.

## 6. Let Codemagic upload every build

Codemagic needs a Google service account to upload for you.

1. **Google Cloud Console** (console.cloud.google.com) › create a project, e.g. "Project Fitness CI".
2. **APIs & Services** › **Library** › search **Google Play Android Developer API** › **Enable**.
3. **IAM & Admin** › **Service accounts** › **Create service account**, name `codemagic`. Skip the roles. **Done**.
4. Open it › **Keys** › **Add key** › **Create new key** › **JSON**. A file downloads. Keep it private.
5. **Play Console** › **Users and permissions** › **Invite new users** › paste the service account's email (ends in `iam.gserviceaccount.com`) › **App permissions** › Project Fitness › tick **Release to testing tracks** (and **Release to production** if you want that later) › **Invite user**.
6. **Codemagic** › Project Fitness › **Environment variables** › add:
   - Name `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`, value: paste the whole JSON file's contents, group `google_play`, **Secret** ticked.
7. From now on: **Start new build** › **Android to Google Play**. It builds, signs and uploads to Internal testing.
   While the app has never been reviewed, uploads arrive as **draft** releases: open Internal testing and press **Review release › Start rollout**. Once Google has approved the app, change `submit_as_draft: true` to `false` in `codemagic.yaml` so builds go straight to testers.

## 7. Later: going public

New personal accounts must run a **closed test with at least 12 testers, opted in for 14 days in a row**, before Google lets you apply for production.
Closed testing › create a track › add the same email list (or a Google Group) › send the opt-in link › after 14 days, **Apply for production** in the dashboard.

---

## What's different on Android

- **Health Connect** instead of Apple Health: Settings › Health Connect. Needs Health Connect (built in on Android 14+, from Google Play on older phones; the app sends people there).
  Watch guide in Settings › Connect your watch has Android steps (Samsung, Pixel/Fitbit, Garmin (Android 14+), WHOOP, Oura, Polar).
- Workouts aren't saved back into Health Connect yet (the iPhone app saves them to Apple Health). Weigh-ins are.
- Wrist temperature isn't read (Health Connect has no equivalent the plugin reads).
- Live heart rate from a chest strap or a broadcasting watch works the same (Bluetooth). Android 12+ asks for "Nearby devices".
- Rest-over alerts have their own notification channel ("Rest timer") with the boxing bell. Reminders use the "Reminders" channel.
- The back button/gesture closes what's on top (sheet, focus mode, settings page), then goes to Today, then leaves the app running.
- The screen stays on during workouts and cardio focus mode (small native helper `PFAndroidPlugin.java`).
