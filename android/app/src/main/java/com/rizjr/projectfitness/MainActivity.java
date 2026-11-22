package com.rizjr.projectfitness;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // the app's own small Android helpers (keep the screen on during workouts and cardio)
        registerPlugin(PFAndroidPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
