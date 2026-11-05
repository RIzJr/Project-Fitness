import UIKit
import Capacitor

// The app's web view. Registers the app's own native code (PFWorkoutPlugin) alongside the npm plugins.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(PFWorkoutPlugin())
    }
}
