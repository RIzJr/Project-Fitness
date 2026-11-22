package com.rizjr.projectfitness;

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
}
