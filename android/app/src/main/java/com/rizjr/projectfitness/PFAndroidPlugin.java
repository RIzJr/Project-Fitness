package com.rizjr.projectfitness;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.view.WindowManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Small Android-only helpers for Project Fitness. JS: Capacitor.Plugins.PFAndroid (index.html wakeOn/wakeOff). */
@CapacitorPlugin(name = "PFAndroid")
public class PFAndroidPlugin extends Plugin {
    /** Keeps the screen on while a workout or cardio session is open (Android's web view has no Wake Lock API). */
    @PluginMethod
    public void keepAwake(PluginCall call) {
        final boolean on = Boolean.TRUE.equals(call.getBoolean("on", true));
        getActivity().runOnUiThread(() -> {
            if (on) getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            call.resolve();
        });
    }

    private AudioFocusRequest focus;

    /**
     * Other apps' music when a rest ends: "pause" takes audio focus for good (music apps pause and stay paused),
     * "duck" asks them to lower their volume while the bell rings, "mix" gives focus back.
     */
    @PluginMethod
    public void music(PluginCall call) {
        String mode = call.getString("mode", "mix");
        AudioManager am = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        if (am == null) { call.resolve(); return; }
        if (focus != null) { am.abandonAudioFocusRequest(focus); focus = null; }
        if ("pause".equals(mode) || "duck".equals(mode)) {
            int gain = "pause".equals(mode) ? AudioManager.AUDIOFOCUS_GAIN : AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK;
            AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build();
            focus = new AudioFocusRequest.Builder(gain).setAudioAttributes(attrs).setOnAudioFocusChangeListener(c -> {}).build();
            am.requestAudioFocus(focus);
            // "pause": the other app has lost focus for good and stays paused; we don't need to keep holding it
            if ("pause".equals(mode)) { am.abandonAudioFocusRequest(focus); focus = null; }
        }
        call.resolve();
    }
}
