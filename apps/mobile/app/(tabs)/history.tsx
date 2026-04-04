import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import useApi from '@/hooks/useApi';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const [captures, setCaptures] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { listCaptures, loading } = useApi();
  const router = useRouter();

  const loadCaptures = useCallback(async () => {
    setRefreshing(true);
    const data = await listCaptures(50, 0) as { captures: any[] } | null;
    if (data?.captures) {
      setCaptures(data.captures);
    }
    setRefreshing(false);
  }, [listCaptures]);

  useEffect(() => {
    loadCaptures();
  }, [loadCaptures]);

  const renderItem = ({ item }: { item: any }) => {
    const isVerified = item.status === 'ATTESTED';
    const isPending = item.status.includes('PENDING');
    
    let statusColor = '#888888';
    let statusBg = 'rgba(42,42,42,0.3)';
    let displayStatus = item.status;
    
    if (isVerified) {
      statusColor = '#00E676';
      statusBg = 'rgba(0,230,118,0.08)';
      displayStatus = 'VERIFIED';
    } else if (isPending) {
      statusColor = '#4FC3F7';
      statusBg = 'rgba(79,195,247,0.08)';
      displayStatus = 'PENDING';
    } else if (item.status === 'FAILED' || item.status === 'REVOKED') {
      statusColor = '#FF3D3D';
      statusBg = 'rgba(255,61,61,0.08)';
    } else if (item.anomalyStatus !== 'CLEAN' && item.anomalyStatus !== 'PENDING') {
      statusColor = '#FFAA00';
      statusBg = 'rgba(255,170,0,0.08)';
      displayStatus = 'SUSPICIOUS';
    }

    const dateStr = new Date(item.capturedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <TouchableOpacity
        onPress={() => router.push(`/verify/${item.id}`)}
        style={s.captureCard}
        activeOpacity={0.7}
      >
        {/* Top Row: Status + Cert Code + Date */}
        <View style={s.cardTopRow}>
          <View style={[s.statusBadge, { backgroundColor: statusBg }]}>
            {isVerified && <Ionicons name="checkmark" size={10} color={statusColor} />}
            {isPending && <View style={[s.statusDot, { backgroundColor: statusColor }]} />}
            <Text style={[s.statusText, { color: statusColor }]}>{displayStatus}</Text>
          </View>
          <Text style={s.certCode}>#{item.shortCode}</Text>
          <Text style={s.dateText}>{dateStr}</Text>
        </View>

        {/* Bottom Row: Thumbnail + Details + Arrow */}
        <View style={s.cardBottomRow}>
          <View style={s.thumbnail}>
            <Ionicons
              name={item.mediaType === 'VIDEO' ? 'videocam' : 'image'}
              size={18}
              color="#353534"
            />
          </View>
          <View style={s.cardDetails}>
            <Text style={s.hashLine} numberOfLines={1}>
              {item.latitude ? `${item.latitude.toFixed(4)}°N` : 'NO GPS'} · {item.imageHash.slice(0, 8)}...{item.imageHash.slice(-4)}
            </Text>
            {item.txHash ? (
              <Text style={s.txLine}>TX: {item.txHash.slice(0, 10)}...</Text>
            ) : (
              <Text style={s.awaitingLine}>Awaiting chain...</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color="#353534" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>MY CERTIFICATES</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/camera')}>
          <Text style={s.newCaptureText}>[+ NEW]</Text>
        </TouchableOpacity>
      </View>
      
      {/* Filter Bar */}
      <View style={s.filterBar}>
        <Text style={s.filterLabel}>FILTER:</Text>
        <TouchableOpacity style={s.filterChip}>
          <Text style={s.filterChipText}>ALL ▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.filterChip}>
          <Text style={s.filterChipText}>VERIFIED ▼</Text>
        </TouchableOpacity>
      </View>

      <View style={s.listContainer}>
        {loading && captures.length === 0 ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={s.loadingText}>FETCHING RECORDS...</Text>
          </View>
        ) : (
          <FlatList
            data={captures}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={loadCaptures} 
                tintColor="#FF6B00" 
                colors={['#FF6B00']} 
              />
            }
            ListEmptyComponent={
              <View style={s.emptyContainer}>
                <View style={s.emptyIconBox}>
                  <Ionicons name="scan-outline" size={40} color="#2a2a2a" />
                </View>
                <Text style={s.emptyTitle}>NO CAPTURES YET</Text>
                <Text style={s.emptyBody}>
                  Go to the Capture tab to create your first verified proof of reality.
                </Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(tabs)/camera')}
                  style={s.emptyButton}
                >
                  <Text style={s.emptyButtonText}>START CAPTURING</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 18,
    letterSpacing: 3,
  },
  newCaptureText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FF6B00',
    fontSize: 11,
    letterSpacing: 1.5,
  },

  // Filter
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
    gap: 12,
    alignItems: 'center',
  },
  filterLabel: {
    fontFamily: 'Inter_500Medium',
    color: '#4a4949',
    fontSize: 10,
    letterSpacing: 2,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    color: '#e5e2e1',
    fontSize: 10,
    letterSpacing: 1.5,
  },

  // List
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Card
  captureCard: {
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 14,
    marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  certCode: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 15,
    letterSpacing: 1,
  },
  dateText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 10,
  },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 40,
    height: 40,
    backgroundColor: '#201f1f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  hashLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#c8c6c5',
    fontSize: 11,
  },
  txLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#FF8C33',
    fontSize: 9,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  awaitingLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 9,
    marginTop: 3,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#888888',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 14,
  },

  // Empty
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 18,
    letterSpacing: 2,
  },
  emptyBody: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 260,
    lineHeight: 19,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#351000',
    fontSize: 13,
    letterSpacing: 2,
  },
});
