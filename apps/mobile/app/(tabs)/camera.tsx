import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Share, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCapture, CaptureStatus } from '@/hooks/useCapture';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_MESSAGES: Record<CaptureStatus, string> = {
  idle: 'Ready to capture',
  requesting_permission: 'Requesting permissions...',
  capturing: 'Capturing...',
  processing: 'Computing proof hash...',
  uploading: 'Uploading to IPFS...',
  attesting: 'Submitting to blockchain...',
  complete: 'Attestation submitted!',
  error: 'Capture failed',
};

const ACTIVE_STATUSES: CaptureStatus[] = ['requesting_permission', 'capturing', 'processing', 'uploading', 'attesting'];

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { status, lastResult, error, cameraRef, takeCapture, reset, sensors } = useCapture();

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#131313' }} />;
  }

  if (!permission.granted) {
    return (
      <View style={s.centered}>
        <View style={s.permissionIcon}>
          <Ionicons name="camera-outline" size={40} color="#FF6B00" />
        </View>
        <Text style={s.permissionTitle}>CAMERA ACCESS REQUIRED</Text>
        <Text style={s.permissionBody}>Grant camera access to capture and verify media with cryptographic proof.</Text>
        <TouchableOpacity style={s.primaryButton} onPress={requestPermission}>
          <Text style={s.primaryButtonText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'complete' && lastResult) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {/* Success Card */}
          <View style={s.successCard}>
            <View style={s.successHeader}>
              <View style={s.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#00E676" />
                <Text style={s.verifiedBadgeText}>VERIFIED</Text>
              </View>
              <Text style={s.successCert}>CERT #{lastResult.shortCode || '----'}</Text>
            </View>

            <Text style={s.successMeta}>Captured: {new Date().toISOString()}</Text>
            <Text style={s.successMeta}>
              Location: {sensors.location ? `${sensors.location.coords.latitude.toFixed(4)}N, ${sensors.location.coords.longitude.toFixed(4)}E` : 'Unknown'}
            </Text>
            <Text style={s.successMeta}>Chain: Base L2</Text>
            <Text style={s.successMeta}>TX: 0x3f9a...d42c</Text>

            <View style={s.successActions}>
              <TouchableOpacity style={s.ghostButton} onPress={async () => {
                const url = lastResult.verificationUrl || `https://phygital-trace.com/verify/${lastResult.captureId}`;
                if (Platform.OS === 'web') {
                  try { await navigator.clipboard.writeText(url); alert('Link copied!'); } catch { }
                } else {
                  await Share.share({ message: `Verify my capture: ${url}` });
                }
              }}>
                <Ionicons name="share-outline" size={14} color="#e5e2e1" />
                <Text style={s.ghostButtonText}>SHARE LINK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.ghostButton} onPress={() => {
                router.push(`/verify/${lastResult.captureId}`);
              }}>
                <Ionicons name="qr-code-outline" size={14} color="#e5e2e1" />
                <Text style={s.ghostButtonText}>QR CODE</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push(`/verify/${lastResult.captureId}`)}
            style={s.viewDocButton}
          >
            <Text style={s.viewDocButtonText}>VIEW FULL DOCUMENT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.primaryButton} onPress={reset}>
            <Text style={s.primaryButtonText}>CAPTURE ANOTHER</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }}>
        <View style={s.headerBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn}>
            <Ionicons name="arrow-back" size={18} color="#FF6B00" />
            <Text style={s.headerBackText}>BACK</Text>
          </TouchableOpacity>
        </View>
        <View style={[s.centered, { flex: 1 }]}>
          <Ionicons name="alert-circle" size={56} color="#FF3D3D" />
          <Text style={s.errorTitle}>CAPTURE FAILED</Text>
          <Text style={s.errorBody}>{error}</Text>
          <TouchableOpacity style={s.primaryButton} onPress={reset}>
            <Text style={s.primaryButtonText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isProcessing = ACTIVE_STATUSES.includes(status);
  const showPostCapture = ['processing', 'uploading', 'attesting', 'complete'].includes(status);

  // Stepper logic
  const getStepStatus = (stepIndex: number) => {
    const statuses = ['processing', 'uploading', 'attesting', 'complete'];
    const currentStatusIndex = statuses.indexOf(status);
    if (status === 'complete' || currentStatusIndex > stepIndex) return 'done';
    if (currentStatusIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }}>
      
      {/* Header */}
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => showPostCapture ? reset() : router.back()} style={s.headerBackBtn}>
          <Ionicons name="arrow-back" size={18} color="#FF6B00" />
          <Text style={s.headerBackText}>{showPostCapture ? 'RESTART' : 'BACK'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{showPostCapture ? 'VERIFYING' : 'CAPTURE'}</Text>
        <View style={{ width: 60 }}>
          <Ionicons name="ellipsis-vertical" size={18} color="#FF6B00" style={{ alignSelf: 'flex-end' }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} style={{ flex: 1 }}>
        
        {showPostCapture ? (
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            {/* Processing State */}
            <View style={s.capturedBanner}>
              <Ionicons name="checkmark" size={16} color="#00E676" />
              <Text style={s.capturedBannerText}>CAPTURED</Text>
            </View>
            
            <Text style={s.anchoringLabel}>──── ANCHORING TO BLOCKCHAIN ────</Text>

            {/* Stepper */}
            <View style={s.stepper}>
              {['Snap', 'Hash', 'IPFS', 'Chain'].map((step, idx) => {
                const stepState = idx === 0 ? 'done' : getStepStatus(idx - 1);
                const isDone = stepState === 'done';
                const isActive = stepState === 'active';
                return (
                  <React.Fragment key={step}>
                    <View style={s.stepItem}>
                      <View style={[
                        s.stepDot,
                        { backgroundColor: (isActive || isDone) ? '#FF6B00' : '#353534' }
                      ]} />
                      <Text style={[
                        s.stepLabel,
                        { color: (isActive || isDone) ? '#e5e2e1' : '#4a4949' }
                      ]}>{step}</Text>
                    </View>
                    {idx < 3 && <View style={s.stepLine} />}
                  </React.Fragment>
                );
              })}
            </View>
            
            {/* Hash displays */}
            <View style={{ gap: 12, marginTop: 8 }}>
              <View>
                <Text style={s.hashFieldLabel}>IMAGE HASH</Text>
                <View style={s.hashField}>
                  <Text style={s.hashFieldValue}>A3F9C2...7D41</Text>
                  <Ionicons name="copy-outline" size={14} color="#e5e2e1" />
                </View>
              </View>
              <View>
                <Text style={s.hashFieldLabel}>FINGERPRINT HASH</Text>
                <View style={s.hashField}>
                  <Text style={s.hashFieldValue}>9B2E44...F103</Text>
                  <Ionicons name="copy-outline" size={14} color="#e5e2e1" />
                </View>
              </View>
            </View>

            <View style={s.processingIndicator}>
              <ActivityIndicator size="small" color="#FF6B00" />
              <Text style={s.processingText}>
                {status === 'processing' ? 'Calculating cryptographic proofs...' : 
                 status === 'uploading' ? 'Publishing metadata to IPFS...' : 
                 'Negotiating Base L2 transaction...'}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            {/* Camera View */}
            <View style={s.cameraContainer}>
              <CameraView 
                style={{ width: '100%', height: '100%' }}
                ref={cameraRef}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: [] }}
              />
              {status === 'capturing' && (
                <View style={[s.capturingOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
                  <ActivityIndicator size="large" color="#FF6B00" />
                </View>
              )}

              {/* Corner brackets */}
              <View style={[s.corner, { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2 }]} />
              <View style={[s.corner, { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2 }]} />
              <View style={[s.corner, { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2 }]} />
              <View style={[s.corner, { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2 }]} />

              {/* Center crosshair */}
              <View style={s.centerCrosshair}>
                <Ionicons name="add" size={24} color="#FF6B00" style={{ opacity: 0.6 }} />
              </View>

              {/* Live indicator */}
              <View style={s.liveIndicator}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>LIVE</Text>
                <Text style={s.liveResolution}>4K_RAW_60FPS</Text>
              </View>
            </View>

            {/* Capture Button */}
            <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
              <TouchableOpacity 
                onPress={() => !isProcessing && takeCapture()}
                disabled={isProcessing}
                style={[s.captureButton, isProcessing && { opacity: 0.5 }]}
                activeOpacity={0.85}
              >
                <Text style={s.captureButtonText}>[● CAPTURE & SIGN]</Text>
              </TouchableOpacity>
            </View>

            {/* Sensor Feed */}
            <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
              <View style={s.sensorHeader}>
                <View style={s.sensorHeaderLine} />
                <Text style={s.sensorHeaderText}>SENSOR FEED</Text>
              </View>

              <SensorRow label="GPS" value={sensors.location ? `${sensors.location.coords.latitude.toFixed(2)} N, ${sensors.location.coords.longitude.toFixed(2)} E` : 'WAITING...'} />
              <SensorRow label="ACCEL" value={sensors.accelerometer ? `${sensors.accelerometer.magnitude.toFixed(2)} m/s²` : 'WAITING...'} />
              <SensorRow label="LIGHT" value="-- lux" />
              <SensorRow label="PRESSURE" value={sensors.barometer ? `${sensors.barometer.pressure_hpa.toFixed(1)} hPa` : '-- hPa'} />
              <SensorRow label="NETWORK" value="WiFi -65 dBm" />
            </View>

            {/* System Status */}
            <View style={{ paddingHorizontal: 20, marginTop: 28, marginBottom: 60 }}>
              <View style={s.systemCard}>
                <Text style={s.systemTitle}>SYSTEM_STATUS</Text>
                <SystemStatusRow label="SENSORS LIVE" status="ACTIVE" color="#00E676" />
                <SystemStatusRow label="GPS LOCKED" status="PRECISION" color="#00E676" />
                <SystemStatusRow label="SIGNING READY" status="ENCRYPTED" color="#FF6B00" />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SensorRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.sensorRow}>
      <Text style={s.sensorLabel}>{label}</Text>
      <Text style={s.sensorValue}>{value}</Text>
    </View>
  );
}

function SystemStatusRow({ label, status, color }: { label: string; status: string; color: string }) {
  return (
    <View style={s.systemRow}>
      <Text style={s.systemRowLabel}>{label}</Text>
      <View style={s.systemRowRight}>
        <View style={[s.systemDot, { backgroundColor: color }]} />
        <Text style={[s.systemStatusText, { color }]}>{status}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131313',
    padding: 20,
  },

  // Permission
  permissionIcon: {
    width: 72,
    height: 72,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 10,
  },
  permissionBody: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 19,
    marginBottom: 24,
  },

  // Buttons
  primaryButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#351000',
    fontSize: 13,
    letterSpacing: 2,
  },
  ghostButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ghostButtonText: {
    fontFamily: 'Inter_500Medium',
    color: '#e5e2e1',
    fontSize: 11,
    letterSpacing: 1,
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    gap: 6,
  },
  headerBackText: {
    fontFamily: 'Inter_500Medium',
    color: '#FF6B00',
    fontSize: 11,
    letterSpacing: 2,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 16,
    letterSpacing: 3,
  },

  // Success Card
  successCard: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderTopWidth: 3,
    borderTopColor: '#FF6B00',
    backgroundColor: '#1c1b1b',
    padding: 20,
  },
  successHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
    paddingBottom: 14,
    marginBottom: 14,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,230,118,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  verifiedBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#00E676',
    fontSize: 10,
    letterSpacing: 2,
  },
  successCert: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 18,
    letterSpacing: 1,
  },
  successMeta: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#c8c6c5',
    fontSize: 11,
    marginBottom: 3,
  },
  successActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  viewDocButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewDocButtonText: {
    fontFamily: 'Inter_500Medium',
    color: '#e5e2e1',
    fontSize: 12,
    letterSpacing: 2,
  },

  // Error
  errorTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 20,
    letterSpacing: 2,
    marginTop: 16,
  },
  errorBody: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },

  // Processing State
  capturedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#1c1b1b',
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
    gap: 10,
    marginBottom: 20,
  },
  capturedBannerText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 20,
    letterSpacing: 3,
  },
  anchoringLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 10,
    height: 10,
  },
  stepLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
  },
  stepLine: {
    width: 32,
    height: 1,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 6,
    marginBottom: 16, // offset for label below dot
  },
  hashFieldLabel: {
    fontFamily: 'Inter_500Medium',
    color: '#4a4949',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hashField: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#201f1f',
    borderLeftWidth: 2,
    borderLeftColor: '#FF6B00',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hashFieldValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#FF8C33',
    fontSize: 11,
    letterSpacing: 1,
  },
  processingIndicator: {
    alignItems: 'center',
    marginTop: 36,
    gap: 12,
  },
  processingText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#c8c6c5',
    fontSize: 11,
  },

  // Camera
  cameraContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: '#000',
  },
  capturingOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FF6B00',
    opacity: 0.5,
  },
  centerCrosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    backgroundColor: '#1c1b1b',
    paddingHorizontal: 14,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    opacity: 0.9,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
  },
  liveText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#00E676',
    fontSize: 9,
    letterSpacing: 2,
  },
  liveResolution: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1,
  },

  // Capture Button
  captureButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#351000',
    fontSize: 13,
    letterSpacing: 1.5,
  },

  // Sensor Feed
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sensorHeaderLine: {
    width: 3,
    height: 18,
    backgroundColor: '#FF6B00',
  },
  sensorHeaderText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#888888',
    fontSize: 12,
    letterSpacing: 2,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
  },
  sensorLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sensorValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#e5e2e1',
    fontSize: 11,
  },

  // System Status
  systemCard: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1c1b1b',
    padding: 20,
  },
  systemTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 16,
  },
  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  systemRowLabel: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 11,
    letterSpacing: 1,
  },
  systemRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  systemDot: {
    width: 5,
    height: 5,
  },
  systemStatusText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 8,
    letterSpacing: 2,
  },
});
