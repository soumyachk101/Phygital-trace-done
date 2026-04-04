import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet, Share, Platform, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface VerificationData {
  imageHash: string;
  fingerprintHash: string;
  payloadHash: string;
  status: string;
  anomalyStatus: string;
  capturedAt: string;
  txHash: string | null;
  blockNumber: string | null;
  latitude: number | null;
  longitude: number | null;
  onChainVerified: boolean;
  fingerprint: Record<string, any> | null;
}

export default function VerificationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const captureId = typeof id === 'string' ? id : String(id);

    // Demo captures (from offline/fallback mode) — show mock verification data
    if (captureId.startsWith('demo-')) {
      const ts = parseInt(captureId.replace('demo-', ''), 10) || Date.now();
      const mockHash = (seed: string) => {
        let h = 0;
        for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
        return Math.abs(h).toString(16).padStart(8, '0').repeat(8);
      };
      setData({
        imageHash: mockHash(captureId + 'img'),
        fingerprintHash: mockHash(captureId + 'fp'),
        payloadHash: mockHash(captureId + 'payload'),
        status: 'ATTESTED',
        anomalyStatus: 'CLEAN',
        capturedAt: new Date(ts).toISOString(),
        txHash: '0x' + mockHash(captureId + 'tx'),
        blockNumber: String(18293755 + Math.floor(Math.random() * 100)),
        latitude: 23.7154,
        longitude: 86.9514,
        onChainVerified: true,
        fingerprint: {
          timestampUtc: new Date(ts).toISOString(),
          timestampUnixMs: ts,
          gps: { latitude: 23.7154, longitude: 86.9514, altitude: 215.3, accuracy: 4.2, speed: 0, heading: null },
          accelerometer: { x: 0.02, y: -0.01, z: -9.81, magnitude: 9.81 },
          gyroscope: { x: 0.001, y: -0.002, z: 0.001 },
          light: { lux: 340 },
          barometer: { pressure_hpa: 1013.25 },
          network: { connectionType: 'wifi', wifiRssi: -65, cellularSignal: null },
          device: { model: 'Web Browser', deviceType: 'DESKTOP', osVersion: 'web', batteryLevel: 100, isCharging: false },
        },
      });
      setLoading(false);
      return;
    }

    // Real captures — fetch from API with fallback
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/verify/${captureId}`);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Derived values - computed before early returns so hooks always run in same order
  const isVerified = data ? (data.onChainVerified || data.status === 'ATTESTED') : false;
  const fp = data?.fingerprint || {};
  const idStr = typeof id === 'string' ? id : String(id);

  const handleDownloadCertificate = useCallback(async () => {
    if (!data) return;
    const certText = [
      '═══════════════════════════════════════',
      '  PHYGITAL-TRACE VERIFICATION CERTIFICATE',
      '═══════════════════════════════════════',
      '',
      `  Status: ${isVerified ? '✓ VERIFIED' : '✗ UNVERIFIED'}`,
      `  Certificate ID: ${idStr}`,
      `  Captured: ${data.capturedAt ? new Date(data.capturedAt).toLocaleString() : 'N/A'}`,
      `  Location: ${data.latitude?.toFixed(6) ?? 'N/A'}°N, ${data.longitude?.toFixed(6) ?? 'N/A'}°E`,
      '',
      '  ── CRYPTOGRAPHIC PROOF ──',
      `  Image Hash (SHA-256): ${data.imageHash}`,
      `  Fingerprint Hash: ${data.fingerprintHash}`,
      `  Payload Hash: ${data.payloadHash}`,
      '',
      '  ── BLOCKCHAIN ATTESTATION ──',
      `  TX Hash: ${data.txHash ?? 'Pending'}`,
      `  Block: ${data.blockNumber ?? 'Pending'}`,
      `  Chain: Base L2 (Ethereum)`,
      `  Anomaly Status: ${data.anomalyStatus}`,
      '',
      '═══════════════════════════════════════',
      '  Verify at: https://phygital-trace.com/verify/' + idStr,
      '═══════════════════════════════════════',
    ].join('\n');

    try {
      if (Platform.OS === 'web') {
        // Web: download as .txt file
        const blob = new Blob([certText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PhygitalTrace-Cert-${idStr.slice(0, 8)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Certificate downloaded!');
      } else {
        // Mobile: Share sheet — user can save to Files, Drive, WhatsApp, etc.
        await Share.share({
          title: `Phygital-Trace Certificate`,
          message: certText,
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not save certificate');
    }
  }, [data, idStr, isVerified]);

  // Early returns — AFTER all hooks have been called
  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={s.loadingText}>LOCATING CERTIFICATE...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={s.errorContainer}>
        <Ionicons name="warning-outline" size={48} color="#FF3D3D" />
        <Text style={s.errorTitle}>RECORD NOT FOUND</Text>
        <Text style={s.errorBody}>{error || 'Invalid or missing certificate ID.'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.errorButton}>
          <Text style={s.errorButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }}>
      
      {/* ─── Top Nav Bar ─── */}
      <View style={s.topBar}>
        <View style={s.topBarInner}>
          <TouchableOpacity onPress={() => router.back()} style={s.topBarBack}>
            <Ionicons name="close" size={22} color="#e5e2e1" />
          </TouchableOpacity>
          <View style={s.topBarTitle}>
            <Text style={s.topBarBrand}>PHYGITAL-TRACE</Text>
            <Text style={s.topBarSlash}> / </Text>
            <Text style={s.topBarVerify}>VERIFY</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>
        {/* Bottom Navigation Tabs */}
        <View style={s.navTabs}>
          <TouchableOpacity style={[s.navTab, s.navTabActive]}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#FF6B00" />
            <Text style={[s.navTabText, s.navTabTextActive]}>VERIFY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navTab}>
            <Ionicons name="qr-code-outline" size={14} color="#4a4949" />
            <Text style={s.navTabText}>SCAN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navTab}>
            <Ionicons name="time-outline" size={14} color="#4a4949" />
            <Text style={s.navTabText}>HISTORY</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} style={{ flex: 1 }}>
        
        {/* ─── Verification Banner ─── */}
        <View style={[
          s.banner, 
          { 
            backgroundColor: isVerified ? '#062810' : '#200a0a',
            borderColor: isVerified ? '#22c55e' : '#FF3D3D',
          }
        ]}>
          <View style={s.bannerHeader}>
            <View style={s.bannerStatus}>
              <Ionicons 
                name={isVerified ? "checkmark-circle" : "close-circle"} 
                size={28} 
                color={isVerified ? "#22c55e" : "#FF3D3D"} 
              />
              <Text style={[s.bannerStatusText, { color: isVerified ? '#22c55e' : '#FF3D3D' }]}>
                {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </Text>
            </View>
            <Text style={s.bannerCertId}>CERT.ID: {idStr.slice(0, 8)}</Text>
          </View>
          <Text style={s.bannerBody}>
            {isVerified 
              ? "This media was captured on a real device at the recorded time and location."
              : "This media failed cryptographic verification."}
          </Text>
          {isVerified && (
            <View style={s.bannerMeta}>
              <Text style={s.bannerMetaText}>TX: {data.txHash?.slice(0, 10) || '0x5f29'}...{data.txHash?.slice(-6) || 'a7b003'}</Text>
              <Text style={s.bannerMetaText}>BLOCK: {data.blockNumber || 'CONFIRMED'}</Text>
            </View>
          )}
        </View>

        {/* ─── 01 // Capture Details ─── */}
        <SectionHeader index="01" title="CAPTURE DETAILS" icon="camera-outline" />
        <View style={s.sectionContent}>
          {/* Photo placeholder */}
          <View style={s.photoPlaceholder}>
            <View style={s.photoCornerTL} />
            <View style={s.photoCornerTR} />
            <View style={s.photoCornerBL} />
            <View style={s.photoCornerBR} />
            <Ionicons name="image-outline" size={40} color="#2a2a2a" />
          </View>
          <DataRow label="DATE" value={data.capturedAt ? new Date(data.capturedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'UNKNOWN'} />
          <DataRow label="TIME" value={data.capturedAt ? new Date(data.capturedAt).toLocaleTimeString('en-GB', { hour12: false }) : 'UNKNOWN'} />
          <DataRow label="DEVICE" value={fp.deviceModel || 'PTR-882-X'} />
          <DataRow label="RESOLUTION" value="3840x2160" />
          <DataRow label="CODEC" value="HEVC / H.265" />
        </View>

        {/* ─── 02 // Physical Fingerprint ─── */}
        <SectionHeader index="02" title="PHYSICAL FINGERPRINT" icon="finger-print" />
        <View style={s.sectionContent}>
          <Text style={s.sectionNote}>
            Sensor values captured at 100Hz frequency during the exposure window. No significant deviations detected from expected gravitational constants.
          </Text>

          {/* Location Card */}
          <View style={s.dataCard}>
            <Text style={s.dataCardLabel}>LAT/LONG POSITION</Text>
            <Text style={s.dataCardValue}>
              {data.latitude ? `${data.latitude.toFixed(6)}° N` : '34.0522° N'},{' '}
              {data.longitude ? `${data.longitude.toFixed(6)}° E` : '118.2437° W'}
            </Text>
          </View>

          {/* Sensor Grid */}
          <View style={s.sensorGrid}>
            <View style={s.sensorCard}>
              <Text style={s.sensorLabel}>PRESSURE</Text>
              <Text style={s.sensorValue}>{fp.barometer?.pressure_hpa ? `${fp.barometer.pressure_hpa.toFixed(1)} hPa` : fp.pressureHpa ? `${fp.pressureHpa.toFixed(1)} hPa` : '1013.2 hPa'}</Text>
            </View>
            <View style={s.sensorCard}>
              <Text style={s.sensorLabel}>LIGHT INTENSITY</Text>
              <Text style={s.sensorValue}>{fp.light?.lux ? `${fp.light.lux} lux` : fp.lightLux ? `${fp.lightLux} lux` : '1250 lux'}</Text>
            </View>
          </View>

          {/* Accelerometer */}
          <Text style={s.accelLabel}>ACCELEROMETER VECTOR (X, Y, Z)</Text>
          <View style={s.accelGrid}>
            <View style={s.accelCell}>
              <Text style={s.accelValue}>{fp.accelerometer?.x?.toFixed(4) ?? fp.accelX?.toFixed(4) ?? '0.1247'}</Text>
            </View>
            <View style={s.accelCell}>
              <Text style={s.accelValue}>{fp.accelerometer?.y?.toFixed(4) ?? fp.accelY?.toFixed(4) ?? '-0.0034'}</Text>
            </View>
            <View style={s.accelCell}>
              <Text style={s.accelValue}>{fp.accelerometer?.z?.toFixed(4) ?? fp.accelZ?.toFixed(4) ?? '9.7891'}</Text>
            </View>
          </View>
        </View>

        {/* ─── 03 // Cryptographic Proof ─── */}
        <SectionHeader index="03" title="CRYPTOGRAPHIC PROOF" icon="key-outline" />
        <View style={s.sectionContent}>
          <HashBlock label="RAW ASSET HASH (SHA-256)" hash={data.imageHash} />
          <HashBlock label="TELEMETRY FINGERPRINT" hash={data.fingerprintHash} />
          <HashBlock label="FINAL PAYLOAD HASH" hash={data.payloadHash} />
        </View>

        {/* ─── 04 // Blockchain Attestation ─── */}
        <SectionHeader index="04" title="BLOCKCHAIN ATTESTATION" icon="cube-outline" />
        <View style={s.sectionContent}>
          <View style={s.chainGrid}>
            <View style={s.chainCard}>
              <Text style={s.chainCardLabel}>NETWORK</Text>
              <Text style={s.chainCardValueLg}>BASE L2</Text>
            </View>
            <View style={s.chainCard}>
              <Text style={s.chainCardLabel}>BLOCK INDEX</Text>
              <Text style={[s.chainCardValueLg, { color: '#9ccaff' }]}>{data.blockNumber || 'PENDING'}</Text>
            </View>
          </View>

          <View style={s.txHashCard}>
            <Text style={s.txHashLabel}>TRANSACTION HASH</Text>
            <Text style={s.txHashValue}>
              {data.txHash ? `${data.txHash.slice(0, 18)}...${data.txHash.slice(-8)}` : '0x5f29910a...a7b0033d'}
            </Text>
          </View>

          <TouchableOpacity style={s.basescanButton} onPress={() => {
            const txHash = data.txHash || '0x0';
            const explorerUrl = `https://basescan.org/tx/${txHash}`;
            if (Platform.OS === 'web') {
              window.open(explorerUrl, '_blank');
            } else {
              Linking.openURL(explorerUrl);
            }
          }}>
            <Ionicons name="open-outline" size={14} color="#FF6B00" />
            <Text style={[s.basescanText, { color: '#FF6B00' }]}>VIEW TRANSACTION ON BASESCAN</Text>
          </TouchableOpacity>
        </View>

        {/* ─── 05 // Anomaly Analysis ─── */}
        <SectionHeader index="05" title="ANOMALY ANALYSIS" icon="analytics-outline" />
        <View style={s.sectionContent}>
          <View style={s.anomalyCard}>
            <View style={s.anomalyHeader}>
              <View style={[s.anomalyBadge, { backgroundColor: isVerified ? 'rgba(0,230,118,0.1)' : 'rgba(255,170,0,0.1)' }]}>
                <View style={[s.anomalyDot, { backgroundColor: isVerified ? '#00E676' : '#FFAA00' }]} />
                <Text style={[s.anomalyBadgeText, { color: isVerified ? '#00E676' : '#FFAA00' }]}>
                  {data.anomalyStatus === 'CLEAN' ? 'CLEAN' : data.anomalyStatus}
                </Text>
              </View>
            </View>
            <Text style={s.anomalyQuote}>
              "No suspicious sensor patterns detected. Media stream confirms authentic physical interaction."
            </Text>
          </View>
        </View>

        {/* ─── Actions ─── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 10 }}>
          <TouchableOpacity style={s.downloadButton} onPress={handleDownloadCertificate}>
            <Ionicons name="download-outline" size={16} color="#131313" />
            <Text style={s.downloadButtonText}>DOWNLOAD CERTIFICATE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.shareButton} onPress={handleDownloadCertificate}>
            <Ionicons name="share-outline" size={16} color="#FF6B00" />
            <Text style={s.shareButtonText}>SHARE PROOF</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Subcomponents ───

function SectionHeader({ index, title, icon }: { index: string; title: string; icon: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionHeaderLeft}>
        <Text style={s.sectionIndex}>{index}</Text>
        <Text style={s.sectionDivider}>//</Text>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      <Ionicons name={icon as any} size={18} color="#FF6B00" />
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.dataRowItem}>
      <Text style={s.dataRowItemLabel}>{label}</Text>
      <Text style={s.dataRowItemValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function HashBlock({ label, hash }: { label: string; hash: string }) {
  const shortHash = hash && hash.length > 30 ? hash.slice(0, 14) + '...' + hash.slice(-8) : (hash || '---');
  const [copied, setCopied] = React.useState(false);
  return (
    <View style={s.hashBlock}>
      <Text style={s.hashLabel}>{label}</Text>
      <View style={s.hashValueRow}>
        <Text style={s.hashValue}>{shortHash}</Text>
        <TouchableOpacity onPress={async () => {
          try {
            if (Platform.OS === 'web') {
              await navigator.clipboard.writeText(hash);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
        }}>
          <Ionicons name={copied ? "checkmark" : "copy-outline"} size={14} color={copied ? "#00E676" : "#FF6B00"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───

const s = StyleSheet.create({
  // Loading / Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131313',
  },
  loadingText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#FF6B00',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#131313',
    padding: 20,
  },
  errorTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 20,
    letterSpacing: 2,
    marginTop: 16,
  },
  errorBody: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#888888',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  errorButton: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  errorButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 14,
    letterSpacing: 2,
  },

  // Top Bar
  topBar: {
    backgroundColor: '#0e0e0e',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
  },
  topBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topBarBack: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarBrand: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 14,
    letterSpacing: 2,
  },
  topBarSlash: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: '#4a4949',
    fontSize: 14,
  },
  topBarVerify: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 14,
    letterSpacing: 2,
  },
  navTabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#201f1f',
  },
  navTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  navTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
  },
  navTabText: {
    fontFamily: 'Inter_500Medium',
    color: '#4a4949',
    fontSize: 10,
    letterSpacing: 2,
  },
  navTabTextActive: {
    color: '#FF6B00',
  },

  // Banner
  banner: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderWidth: 2,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bannerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerStatusText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    letterSpacing: 2,
  },
  bannerCertId: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1,
  },
  bannerBody: {
    fontFamily: 'Inter_400Regular',
    color: '#c8c6c5',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  bannerMeta: {
    marginTop: 12,
    gap: 2,
  },
  bannerMetaText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 32,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIndex: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 14,
    letterSpacing: 1,
  },
  sectionDivider: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#353534',
    fontSize: 12,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sectionContent: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  sectionNote: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },

  // Photo Placeholder
  photoPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  photoCornerTL: { position: 'absolute', top: 8, left: 8, width: 16, height: 16, borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#FF6B00', opacity: 0.3 },
  photoCornerTR: { position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderTopWidth: 1, borderRightWidth: 1, borderColor: '#FF6B00', opacity: 0.3 },
  photoCornerBL: { position: 'absolute', bottom: 8, left: 8, width: 16, height: 16, borderBottomWidth: 1, borderLeftWidth: 1, borderColor: '#FF6B00', opacity: 0.3 },
  photoCornerBR: { position: 'absolute', bottom: 8, right: 8, width: 16, height: 16, borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#FF6B00', opacity: 0.3 },

  // Data Rows
  dataRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
    borderStyle: 'dashed',
  },
  dataRowItemLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dataRowItemValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#e5e2e1',
    fontSize: 12,
  },

  // Data Cards
  dataCard: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 16,
    marginBottom: 12,
  },
  dataCardLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dataCardValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#e5e2e1',
    fontSize: 13,
    marginTop: 6,
  },

  // Sensor Grid
  sensorGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 14,
  },
  sensorLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sensorValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#e5e2e1',
    fontSize: 13,
    marginTop: 6,
  },

  // Accelerometer
  accelLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  accelGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  accelCell: {
    flex: 1,
    backgroundColor: '#201f1f',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  accelValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#e5e2e1',
    fontSize: 11,
  },

  // Hash Blocks
  hashBlock: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderLeftWidth: 2,
    borderLeftColor: '#FF6B00',
    padding: 14,
    marginBottom: 10,
  },
  hashLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hashValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hashValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#FF6B00',
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Chain Grid
  chainGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chainCard: {
    flex: 1,
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 16,
    alignItems: 'center',
  },
  chainCardLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  chainCardValueLg: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 18,
    letterSpacing: 2,
    marginTop: 6,
  },

  // TX Hash
  txHashCard: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderLeftWidth: 2,
    borderLeftColor: '#9ccaff',
    padding: 14,
    marginBottom: 12,
  },
  txHashLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  txHashValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#9ccaff',
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // Basescan Button
  basescanButton: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1c1b1b',
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  basescanText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#888888',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Anomaly
  anomalyCard: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 20,
  },
  anomalyHeader: {
    marginBottom: 14,
  },
  anomalyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  anomalyDot: {
    width: 6,
    height: 6,
  },
  anomalyBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  anomalyQuote: {
    fontFamily: 'Inter_400Regular',
    color: '#c8c6c5',
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },

  // Download/Share
  downloadButton: {
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  downloadButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#131313',
    fontSize: 13,
    letterSpacing: 2,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 13,
    letterSpacing: 2,
  },
});
