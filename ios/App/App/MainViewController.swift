import UIKit
import Capacitor

// The app's web view. Registers the app's own native code (PFWorkoutPlugin, PFAudioPlugin) alongside the npm plugins.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(PFWorkoutPlugin())
        bridge?.registerPluginInstance(PFAudioPlugin())
    }
}
