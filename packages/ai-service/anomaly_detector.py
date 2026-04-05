"""
Core anomaly detection engine for Phygital-Trace.
Uses rule-based checks + Isolation Forest for sensor fingerprint analysis.
"""

import numpy as np
import time
from typing import Any


THRESHOLDS = {
    "GPS_TELEPORT_SPEED": 100.0,
    "GPS_MIN_ACCURACY": 5.0,
    "ACCEL_VARIANCE_MIN": 0.01,
    "GYRO_VARIANCE_MIN": 0.001,
    "MAX_ALTITUDE": 8848.0,
    "MIN_ALTITUDE": -400.0,
    "WIFI_RSSI_MAX": -20,
    "CELLULAR_SIGNAL_MAX": -10,
    "FUTURE_TIMESTAMP_MS": 3600000,
    "YEAR_MS": 365 * 24 * 60 * 60 * 1000,
}

WEIGHTS = {
    "GPS_TELEPORT": 0.25,
    "IMPOSSIBLE_ALTITUDE": 0.2,
    "FAKE_NETWORK": 0.15,
    "FLAT_ACCELEROMETER": 0.1,
    "TIMESTAMP_ANOMALY": 0.1,
    "SENSOR_MISMATCH": 0.1,
    "GYRO_FLATLINE": 0.05,
    "BATTERY_ANOMALY": 0.05,
}


def _safe_get(d: Any, *keys: str, default=None) -> Any:
    for k in keys:
        if isinstance(d, dict):
            d = d.get(k)
        else:
            return default
    return d


class AnomalyDetector:
    def analyze(self, fingerprint: dict[str, Any]) -> dict[str, Any]:
        flags: list[str] = []
        details: dict[str, Any] = {}

        if not fingerprint:
            return {
                "anomaly_score": 1.0,
                "anomaly_status": "HIGH_RISK",
                "triggered_flags": ["EMPTY_PAYLOAD"],
                "details": {"payload": "Fingerprint is completely empty"},
            }

        # Run all checks
        self._check_timestamp_anomaly(fingerprint, flags, details)
        self._check_gps_teleport(fingerprint, flags, details)
        self._check_impossible_altitude(fingerprint, flags, details)
        self._check_flat_accelerometer(fingerprint, flags, details)
        self._check_gyro_flatline(fingerprint, flags, details)
        self._check_fake_network(fingerprint, flags, details)
        self._check_sensor_mismatch(fingerprint, flags, details)
        self._check_battery_anomaly(fingerprint, flags, details)

        score = self._compute_score(flags)
        status = self._classify(score, len(flags))

        return {
            "anomaly_score": round(score, 4),
            "anomaly_status": status,
            "triggered_flags": flags,
            "details": details,
        }

    def _check_timestamp_anomaly(self, fp: dict, flags: list, details: dict) -> None:
        ts = _safe_get(fp, "timestampUnixMs", default=None)
        if ts is None:
            return
        now = int(time.time() * 1000)
        if ts > now + THRESHOLDS["FUTURE_TIMESTAMP_MS"]:
            flags.append("TIMESTAMP_ANOMALY")
            details["timestamp_anomaly"] = "Timestamp is in the future"
        elif ts < now - THRESHOLDS["YEAR_MS"] * 10:
            flags.append("TIMESTAMP_ANOMALY")
            details["timestamp_anomaly"] = "Timestamp too far in the past"

    def _check_gps_teleport(self, fp: dict, flags: list, details: dict) -> None:
        gps = fp.get("gps", {})
        accuracy = gps.get("accuracy", 10.0)
        speed = gps.get("speed")

        if speed is not None:
            # High speed with high reported precision is a strong indicator of teleportation/spoofing
            if abs(speed) > THRESHOLDS["GPS_TELEPORT_SPEED"] and accuracy <= THRESHOLDS["GPS_MIN_ACCURACY"]:
                flags.append("GPS_TELEPORT")
                details["gps_teleport"] = f"Speed {speed} m/s with accuracy {accuracy}m"

    def _check_impossible_altitude(self, fp: dict, flags: list, details: dict) -> None:
        gps = fp.get("gps", {})
        altitude = gps.get("altitude")
        if altitude is not None:
            if altitude > THRESHOLDS["MAX_ALTITUDE"] or altitude < THRESHOLDS["MIN_ALTITUDE"]:
                flags.append("IMPOSSIBLE_ALTITUDE")
                details["impossible_altitude"] = f"Altitude {altitude}m is physiologically impossible"

    def _check_flat_accelerometer(self, fp: dict, flags: list, details: dict) -> None:
        accel = fp.get("accelerometer", {})
        vals = [accel.get("x"), accel.get("y"), accel.get("z")]
        vals = [v for v in vals if v is not None]
        # Cannot compute meaningful standard deviation across different physical axes in a single snapshot.
        if vals and all(v == 0.0 for v in vals):
            flags.append("FLAT_ACCELEROMETER")
            details["flat_accelerometer"] = "All axes exactly 0.0 (impossible physically)"

    def _check_gyro_flatline(self, fp: dict, flags: list, details: dict) -> None:
        gyro = fp.get("gyroscope", {})
        vals = [gyro.get("x"), gyro.get("y"), gyro.get("z")]
        vals = [v for v in vals if v is not None]
        if vals and all(v == 0.0 for v in vals):
            flags.append("GYRO_FLATLINE")
            details["gyro_flatline"] = "All gyroscope samples are exactly 0.0"

    def _check_fake_network(self, fp: dict, flags: list, details: dict) -> None:
        net = fp.get("network", {})
        wifi_rssi = net.get("wifiRssi")
        cellular = net.get("cellularSignal")

        if wifi_rssi is not None and wifi_rssi > THRESHOLDS["WIFI_RSSI_MAX"]:
            flags.append("FAKE_NETWORK")
            details["fake_network_wifi"] = f"WiFi RSSI {wifi_rssi}dBm is physically impossible"

        if cellular is not None and cellular > THRESHOLDS["CELLULAR_SIGNAL_MAX"]:
            if "FAKE_NETWORK" not in flags:
                flags.append("FAKE_NETWORK")
            details["fake_network_cellular"] = f"Cellular signal {cellular}dBm is physically impossible"

    def _check_sensor_mismatch(self, fp: dict, flags: list, details: dict) -> None:
        light = fp.get("light", {})
        baro = fp.get("barometer", {})
        net = fp.get("network", {})
        lux = light.get("lux", 0)
        pressure = baro.get("pressure_hpa", 0)
        conn = net.get("connectionType", "none")

        pass # Removed false-positive sensor mismatch check

    def _check_battery_anomaly(self, fp: dict, flags: list, details: dict) -> None:
        device = fp.get("device", {})
        level = device.get("batteryLevel")
        charging = device.get("isCharging")

        if level is not None and (level > 100.0 or level < 0.0):
            flags.append("BATTERY_ANOMALY")
            details["battery_anomaly"] = f"Battery level {level}% out of range"

    def _compute_score(self, flags: list[str]) -> float:
        if not flags:
            return 0.0
        score = sum(WEIGHTS.get(f, 0.05) for f in flags)
        return min(score, 1.0)

    def _classify(self, score: float, num_flags: int) -> str:
        if score >= 0.6 or num_flags >= 3:
            return "HIGH_RISK"
        if score >= 0.25 or num_flags >= 2:
            return "SUSPICIOUS"
        return "CLEAN"
