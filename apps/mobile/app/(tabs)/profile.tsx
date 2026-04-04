import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useSecureEnclave } from '@/hooks/useSecureEnclave';
import useApi from '@/hooks/useApi';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { deviceId, publicKey, isReady } = useSecureEnclave();
  const { request, loading } = useApi();
  const [stats, setStats] = useState<{ captureCount: number } | null>(null);

  useEffect(() => {
    if (isReady && deviceId) {
      request<{ _count: { captures: number } }>('/api/v1/auth/me')
        .then((data) => {
          if (data?._count) {
            setStats({ captureCount: data._count.captures });
          }
        })
        .catch(() => {});
    }
  }, [isReady, deviceId]);

  if (!isReady) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={s.loadingText}>INITIALIZING SECURE ENCLAVE...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        
        {/* ─── Header ─── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>DEVICE IDENTITY</Text>
          <View style={s.headerBadge}>
            <View style={s.headerDot} />
            <Text style={s.headerBadgeText}>SECURE</Text>
          </View>
        </View>

        {/* ─── Device Shield ─── */}
        <View style={s.shieldSection}>
          <View style={s.shieldIcon}>
            <Ionicons name="shield-checkmark" size={44} color="#FF6B00" />
          </View>
          <Text style={s.shieldTitle}>PHYGITAL-TRACE</Text>
          <Text style={s.shieldSubtitle}>PROOF OF REALITY ENGINE</Text>
          <View style={s.shieldStatusRow}>
            <View style={s.shieldStatusDot} />
            <Text style={s.shieldStatusText}>ENCLAVE ACTIVE</Text>
          </View>
        </View>

        {/* ─── Device Info Section ─── */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionIndex}>01</Text>
            <Text style={s.sectionDivider}>//</Text>
            <Text style={s.sectionTitle}>DEVICE CREDENTIALS</Text>
          </View>

          <View style={s.infoCard}>
            <InfoRow label="DEVICE ID" value={deviceId || 'NOT AVAILABLE'} isMono />
            <InfoRow label="PUBLIC KEY" value={publicKey ? `${publicKey.slice(0, 20)}...${publicKey.slice(-8)}` : 'NOT AVAILABLE'} isMono />
            <InfoRow label="ENCLAVE STATUS" value={isReady ? 'ACTIVE' : 'NOT READY'} valueColor={isReady ? '#00E676' : '#FF3D3D'} />
            <InfoRow label="SIGNING ALGO" value="ECDSA P-256" isMono />
          </View>
        </View>

        {/* ─── Statistics ─── */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionIndex}>02</Text>
            <Text style={s.sectionDivider}>//</Text>
            <Text style={s.sectionTitle}>CAPTURE STATISTICS</Text>
          </View>

          {loading ? (
            <View style={s.statsLoading}>
              <ActivityIndicator size="small" color="#FF6B00" />
              <Text style={s.statsLoadingText}>FETCHING RECORDS...</Text>
            </View>
          ) : (
            <View style={s.statsGrid}>
              <View style={s.statCard}>
                <Text style={s.statValue}>{stats?.captureCount ?? 0}</Text>
                <Text style={s.statLabel}>TOTAL CAPTURES</Text>
              </View>
              <View style={s.statCard}>
                <Text style={[s.statValue, { color: '#00E676' }]}>{stats?.captureCount ?? 0}</Text>
                <Text style={s.statLabel}>VERIFIED</Text>
              </View>
              <View style={s.statCard}>
                <Text style={[s.statValue, { color: '#9ccaff' }]}>0</Text>
                <Text style={s.statLabel}>ON-CHAIN</Text>
              </View>
            </View>
          )}
        </View>

        {/* ─── About ─── */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionIndex}>03</Text>
            <Text style={s.sectionDivider}>//</Text>
            <Text style={s.sectionTitle}>SYSTEM INFO</Text>
          </View>

          <View style={s.aboutCard}>
            <Text style={s.aboutBody}>
              Phygital Trace cryptographically proves that your photos and videos were captured at a real physical location and time. Each capture is secured with device-level signing, environmental sensor fingerprinting, and blockchain attestation.
            </Text>
            
            <View style={s.aboutMeta}>
              <Text style={s.aboutMetaText}>VERSION: 1.0.0-BETA</Text>
              <Text style={s.aboutMetaText}>CHAIN: BASE L2 (ETHEREUM)</Text>
              <Text style={s.aboutMetaText}>PROTOCOL: ATTESTATION V2</Text>
            </View>
          </View>
        </View>

        {/* ─── Actions ─── */}
        <View style={s.actionsSection}>
          <TouchableOpacity style={s.actionButton}>
            <Ionicons name="download-outline" size={16} color="#888888" />
            <Text style={s.actionButtonText}>EXPORT CERTIFICATES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionButton, { borderColor: '#FF3D3D' }]}>
            <Ionicons name="trash-outline" size={16} color="#FF3D3D" />
            <Text style={[s.actionButtonText, { color: '#FF3D3D' }]}>RESET SECURE ENCLAVE</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Footer ─── */}
        <View style={s.footer}>
          <Text style={s.footerText}>TRUST NOTHING BUT THE LEDGER</Text>
          <Text style={s.footerCopyright}>© 2024 PHYGITAL-TRACE</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, isMono, valueColor }: { 
  label: string; value: string; isMono?: boolean; valueColor?: string 
}) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text 
        style={[
          isMono ? s.infoValueMono : s.infoValue,
          valueColor ? { color: valueColor } : {},
        ]} 
        numberOfLines={1} 
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 18,
    letterSpacing: 3,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,230,118,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  headerDot: {
    width: 6,
    height: 6,
    backgroundColor: '#00E676',
  },
  headerBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#00E676',
    fontSize: 10,
    letterSpacing: 2,
  },

  // Shield
  shieldSection: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: '#0e0e0e',
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderTopWidth: 3,
    borderTopColor: '#FF6B00',
  },
  shieldIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 16,
  },
  shieldTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 20,
    letterSpacing: 4,
  },
  shieldSubtitle: {
    fontFamily: 'Inter_400Regular',
    color: '#4a4949',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 4,
  },
  shieldStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: 'rgba(255,107,0,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  shieldStatusDot: {
    width: 6,
    height: 6,
    backgroundColor: '#FF6B00',
  },
  shieldStatusText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#FF6B00',
    fontSize: 9,
    letterSpacing: 2,
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
    marginBottom: 14,
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
    fontSize: 12,
    letterSpacing: 2,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
  },
  infoLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: 'Inter_500Medium',
    color: '#e5e2e1',
    fontSize: 12,
    maxWidth: 180,
  },
  infoValueMono: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#c8c6c5',
    fontSize: 11,
    maxWidth: 180,
  },

  // Stats
  statsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  statsLoadingText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#888888',
    fontSize: 10,
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 28,
    letterSpacing: 1,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 6,
    textTransform: 'uppercase',
  },

  // About
  aboutCard: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 20,
  },
  aboutBody: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 13,
    lineHeight: 19,
  },
  aboutMeta: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#201f1f',
    gap: 4,
  },
  aboutMetaText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#353534',
    fontSize: 9,
    letterSpacing: 1,
  },

  // Actions
  actionsSection: {
    paddingHorizontal: 16,
    marginTop: 28,
    gap: 10,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1c1b1b',
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter_500Medium',
    color: '#888888',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Footer
  footer: {
    marginTop: 40,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  footerText: {
    fontFamily: 'Inter_500Medium',
    color: '#353534',
    fontSize: 10,
    letterSpacing: 3,
  },
  footerCopyright: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#201f1f',
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 6,
  },
});
