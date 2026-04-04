import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CaptureData {
  id: string;
  shortCode: string;
  imageHash: string;
  fingerprintHash: string;
  payloadHash: string;
  status: string;
  anomalyStatus: string;
  anomalyScore: number | null;
  anomalyFlags: string[];
  capturedAt: string;
  ipfsCid: string | null;
  txHash: string | null;
  blockNumber: string | null;
  attestedAt: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  mediaType: string;
  createdAt: string;
  updatedAt: string;
}

export default function CaptureDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<CaptureData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/captures/${id}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const json = await res.json();
        setData(json.data);
      } catch (err: unknown) {
        console.error(err instanceof Error ? err.message : 'Failed to fetch capture');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={s.loadingText}>LOADING CAPTURE...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={s.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3D3D" />
        <Text style={s.errorTitle}>CAPTURE NOT FOUND</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backButton}>
          <Text style={s.backButtonText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const shareLink = `https://phygital-trace.com/verify/${data.shortCode}`;
  const handleShare = async () => {
    await Share.share({ message: `Verify this capture: ${shareLink}`, url: shareLink });
  };

  const isAttested = data.status === 'ATTESTED';
  const isPending = data.status.includes('PENDING');

  const statusConfig = {
    color: isAttested ? '#00E676' : isPending ? '#4FC3F7' : '#FF3D3D',
    label: isAttested ? 'VERIFIED' : isPending ? 'PENDING' : data.status,
    bg: isAttested ? 'rgba(0,230,118,0.08)' : isPending ? 'rgba(79,195,247,0.08)' : 'rgba(255,61,61,0.08)',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBack}>
          <Ionicons name="arrow-back" size={20} color="#FF6B00" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>CAPTURE DETAIL</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Status Card */}
        <View style={s.statusCard}>
          <View style={s.statusHeader}>
            <View style={[s.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <View style={[s.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[s.statusBadgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
            <Text style={s.certCode}>CERT #{data.shortCode}</Text>
          </View>
          
          {data.ipfsCid && (
            <TouchableOpacity onPress={handleShare} style={s.shareRow}>
              <Ionicons name="link-outline" size={14} color="#9ccaff" />
              <Text style={s.shareRowText}>SHARE VERIFICATION LINK</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Details Section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>DETAILS</Text>
          <View style={s.detailCard}>
            <DetailRow label="SHORT CODE" value={data.shortCode} />
            <DetailRow label="MEDIA TYPE" value={data.mediaType} />
            {data.capturedAt && <DetailRow label="CAPTURED" value={new Date(data.capturedAt).toLocaleString()} />}
            <DetailRow label="ANOMALY" value={`${data.anomalyStatus} (${(data.anomalyScore ?? 0).toFixed(2)})`} />
            {data.latitude != null && data.longitude != null && (
              <DetailRow label="LOCATION" value={`${data.latitude.toFixed(4)}°N, ${data.longitude.toFixed(4)}°E`} />
            )}
          </View>
        </View>

        {/* Hashes Section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>CRYPTOGRAPHIC HASHES</Text>
          <HashBlock label="IMAGE HASH" hash={data.imageHash} />
          <HashBlock label="FINGERPRINT HASH" hash={data.fingerprintHash} />
          <HashBlock label="PAYLOAD HASH" hash={data.payloadHash} />
        </View>

        {/* Blockchain Section */}
        {data.txHash && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>BLOCKCHAIN</Text>
            <View style={s.detailCard}>
              <DetailRow label="TX HASH" value={`${data.txHash.slice(0, 14)}...${data.txHash.slice(-4)}`} highlight />
              {data.blockNumber && <DetailRow label="BLOCK" value={`#${data.blockNumber}`} />}
              {data.attestedAt && <DetailRow label="ATTESTED" value={new Date(data.attestedAt).toLocaleString()} />}
            </View>
            <TouchableOpacity style={s.viewTxButton}>
              <Ionicons name="open-outline" size={14} color="#888888" />
              <Text style={s.viewTxText}>VIEW ON BASESCAN</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={[s.detailValue, highlight && { color: '#9ccaff' }]} numberOfLines={1} ellipsizeMode="middle">
        {value}
      </Text>
    </View>
  );
}

function HashBlock({ label, hash }: { label: string; hash: string }) {
  const shortHash = hash && hash.length > 30 ? `${hash.slice(0, 16)}...${hash.slice(-8)}` : (hash || '---');
  return (
    <View style={s.hashBlock}>
      <Text style={s.hashLabel}>{label}</Text>
      <View style={s.hashValueRow}>
        <Text style={s.hashValue}>{shortHash}</Text>
        <Ionicons name="copy-outline" size={14} color="#4a4949" />
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
  },
  loadingText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#FF6B00',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 16,
  },
  errorTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 18,
    letterSpacing: 2,
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 13,
    letterSpacing: 2,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
    backgroundColor: '#0e0e0e',
  },
  headerBack: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 15,
    letterSpacing: 3,
  },

  // Status Card
  statusCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1c1b1b',
    borderTopWidth: 3,
    borderTopColor: '#FF6B00',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
  },
  statusBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 2,
  },
  certCode: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 16,
    letterSpacing: 1,
  },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#201f1f',
  },
  shareRowText: {
    fontFamily: 'Inter_500Medium',
    color: '#9ccaff',
    fontSize: 11,
    letterSpacing: 1.5,
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
    paddingBottom: 8,
  },

  // Detail Card
  detailCard: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 16,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
  },
  detailLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 10,
    letterSpacing: 1.5,
    width: 100,
  },
  detailValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#e5e2e1',
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },

  // Hash Blocks
  hashBlock: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderLeftWidth: 2,
    borderLeftColor: '#FF6B00',
    padding: 14,
    marginBottom: 8,
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

  // View TX Button
  viewTxButton: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1c1b1b',
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  viewTxText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#888888',
    fontSize: 10,
    letterSpacing: 2,
  },
});
