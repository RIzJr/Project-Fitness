import Foundation
import Capacitor
import HealthKit

// Saves finished sessions to Apple Health as workouts (the Health plugin reads data and saves weight,
// but it can't save workouts). Called from index.html as Capacitor.Plugins.PFWorkout.
@objc(PFWorkoutPlugin)
public class PFWorkoutPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PFWorkoutPlugin"
    public let jsName = "PFWorkout"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveWorkout", returnType: CAPPluginReturnPromise)
    ]

    private let store = HKHealthStore()

    private var shareTypes: Set<HKSampleType> {
        var types: Set<HKSampleType> = [HKObjectType.workoutType()]
        if let energy = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned) {
            types.insert(energy)
        }
        return types
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("Apple Health isn't available on this device")
            return
        }
        store.requestAuthorization(toShare: shareTypes, read: nil) { granted, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            let status = self.store.authorizationStatus(for: HKObjectType.workoutType())
            call.resolve(["granted": granted, "workouts": status == .sharingAuthorized])
        }
    }

    @objc func saveWorkout(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("Apple Health isn't available on this device")
            return
        }
        guard let startText = call.getString("start"), let endText = call.getString("end"),
              let start = PFWorkoutPlugin.parseDate(startText), let end = PFWorkoutPlugin.parseDate(endText),
              end > start else {
            call.reject("The workout needs a start and an end time")
            return
        }
        guard store.authorizationStatus(for: HKObjectType.workoutType()) == .sharingAuthorized else {
            call.reject("Saving workouts to Apple Health isn't allowed")
            return
        }
        let kcal = call.getDouble("kcal") ?? 0
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = PFWorkoutPlugin.activityType(call.getString("type") ?? "")
        configuration.locationType = .indoor
        let builder = HKWorkoutBuilder(healthStore: store, configuration: configuration, device: .local())

        builder.beginCollection(withStart: start) { began, error in
            guard began else {
                call.reject(error?.localizedDescription ?? "Couldn't start the workout")
                return
            }
            let finish: () -> Void = {
                builder.endCollection(withEnd: end) { ended, endError in
                    guard ended else {
                        call.reject(endError?.localizedDescription ?? "Couldn't end the workout")
                        return
                    }
                    builder.finishWorkout { workout, finishError in
                        if let finishError = finishError {
                            call.reject(finishError.localizedDescription)
                            return
                        }
                        call.resolve(["id": workout?.uuid.uuidString ?? ""])
                    }
                }
            }
            if kcal > 0, let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned),
               self.store.authorizationStatus(for: energyType) == .sharingAuthorized {
                let energy = HKQuantitySample(type: energyType,
                                              quantity: HKQuantity(unit: .kilocalorie(), doubleValue: kcal),
                                              start: start, end: end)
                builder.add([energy]) { _, _ in finish() }
            } else {
                finish()
            }
        }
    }

    static func parseDate(_ text: String) -> Date? {
        let withFraction = ISO8601DateFormatter()
        withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = withFraction.date(from: text) { return date }
        return ISO8601DateFormatter().date(from: text)
    }

    static func activityType(_ type: String) -> HKWorkoutActivityType {
        switch type {
        case "functional": return .functionalStrengthTraining
        case "hiit": return .highIntensityIntervalTraining
        case "run": return .running
        case "walk": return .walking
        case "cycle": return .cycling
        case "row": return .rowing
        case "swim": return .swimming
        case "elliptical": return .elliptical
        case "stairs": return .stairClimbing
        case "flex": return .flexibility
        case "cardio": return .mixedCardio
        case "other": return .other
        default: return .traditionalStrengthTraining
        }
    }
}
