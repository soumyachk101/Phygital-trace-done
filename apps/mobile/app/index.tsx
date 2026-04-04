import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        style={{ backgroundColor: '#131313' }}
      >
        
        {/* ─── Header Bar ─── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoDot} />
            <Text style={styles.logoText}>PHYGITAL-TRACE</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>[VERIFY]</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Hero Section ─── */}
        <View style={styles.heroSection}>
          <Text style={styles.statusLine}>
            STATUS: SYSTEM OPERATIONAL // BLOCK 18293755
          </Text>
          
          <Text style={styles.heroTitle}>
            PROOF OF{'\n'}REALITY
          </Text>
          
          <Text style={styles.heroBody}>
            Camera-to-Blockchain verification for citizen journalism. Secure every pixel from lens to ledger.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/camera')}
              style={styles.primaryButton}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>CAPTURE NOW</Text>
              <Ionicons name="scan-outline" size={18} color="#351000" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>VERIFY A CERTIFICATE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Viewfinder Preview ─── */}
        <View style={styles.previewContainer}>
          <View style={styles.previewBox}>
            {/* Corner brackets */}
            <View style={[styles.cornerBracket, styles.cornerTL]} />
            <View style={[styles.cornerBracket, styles.cornerTR]} />
            <View style={[styles.cornerBracket, styles.cornerBL]} />
            <View style={[styles.cornerBracket, styles.cornerBR]} />
            
            {/* Center crosshair */}
            <View style={styles.crosshairCenter}>
              <View style={styles.crosshairH} />
              <View style={styles.crosshairV} />
            </View>
            
            <Text style={styles.scanningLabel}>SCANNING METADATA...</Text>
          </View>
        </View>

        {/* ─── Features List ─── */}
        <View style={styles.featuresSection}>
          
          <FeatureRow 
            index="01"
            icon="location-outline"
            title="GPS + SENSORS"
            body="Hard-coded environmental verification. Cryptographic binding of location, altitude, and luminosity data at the moment of capture."
          />
          
          <FeatureRow 
            index="02"
            icon="shield-checkmark-outline"
            title="SECURE ENCLAVE"
            body="Pixels never touch unencrypted memory. Data is signed within the hardware's secure processing unit before hitting storage."
          />
          
          <FeatureRow 
            index="03"
            icon="cube-outline"
            title="BASE L2 ON-CHAIN"
            body="Immutable hashing to Ethereum Layer 2. Proof of existence established within seconds of the shutter click."
          />
        </View>

        {/* ─── Forensic Integrity Section ─── */}
        <View style={styles.forensicSection}>
          <Text style={styles.forensicTitle}>
            FORENSIC INTEGRITY{'\n'}BY DEFAULT
          </Text>

          {/* Data rows */}
          <View style={styles.dataRows}>
            <View style={styles.dataRow}>
              <View style={[styles.dataRowLine, { borderLeftColor: '#2a2a2a' }]} />
              <View style={styles.dataRowContent}>
                <Text style={styles.dataRowLabel}>VERIFICATION HASH</Text>
                <Text style={styles.dataRowValueMono}>0x71C4...B632</Text>
              </View>
            </View>
            <View style={styles.dataRow}>
              <View style={[styles.dataRowLine, { borderLeftColor: '#FF6B00' }]} />
              <View style={styles.dataRowContent}>
                <Text style={styles.dataRowLabel}>TIMESTAMP</Text>
                <Text style={[styles.dataRowValueMono, { color: '#e5e2e1' }]}>2024.05.12 14:02:33 UTC</Text>
              </View>
            </View>
          </View>

          <Text style={styles.forensicBody}>
            PHYGITAL-TRACE utilizes a proprietary Attestation Protocol. Unlike standard digital signatures, our system generates a unique 'Digital DNA' for every asset, rendering manipulation impossible without breaking the cryptographic seal.
          </Text>

          {/* Device Info Card */}
          <View style={styles.deviceCard}>
            <View style={styles.deviceCardHeader}>
              <View>
                <Text style={styles.deviceMeta}>DEVICE_ID: PTR-882-X</Text>
                <Text style={styles.deviceMeta}>LENS_CERT: ZEISS_T_82</Text>
              </View>
              <Ionicons name="checkmark-circle" size={22} color="#9ccaff" />
            </View>
            <View style={styles.deviceCardData}>
              <View>
                <Text style={styles.deviceDataLabel}>LAT/LNG</Text>
                <Text style={styles.deviceDataValue}>34.0522° N,{'\n'}118.2437° W</Text>
              </View>
              <View>
                <Text style={styles.deviceDataLabel}>ENTROPY_POOL</Text>
                <Text style={styles.deviceDataValue}>0.999281</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTagline}>TRUST NOTHING BUT THE LEDGER</Text>
            <Text style={styles.footerCopyright}>© 2024 PHYGITAL-TRACE / SECURE CAPTURE SYSTEMS</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({ index, icon, title, body }: { 
  index: string; icon: string; title: string; body: string 
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={22} color="#FF6B00" />
      </View>
      <View style={styles.featureContent}>
        <View style={styles.featureTitleRow}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureIndex}>{index}</Text>
        </View>
        <Text style={styles.featureBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FF6B00',
    marginRight: 10,
  },
  logoText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#FF6B00',
    fontSize: 15,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerButton: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1c1b1b',
  },
  headerButtonText: {
    fontFamily: 'Inter_500Medium',
    color: '#888888',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Hero
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statusLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#FF6B00',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 52,
    lineHeight: 52,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  heroBody: {
    fontFamily: 'Inter_400Regular',
    color: '#c8c6c5',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 20,
    paddingRight: 32,
  },
  actionButtons: {
    marginTop: 28,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#351000',
    fontSize: 15,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1c1b1b',
  },
  secondaryButtonText: {
    fontFamily: 'Inter_500Medium',
    color: '#e5e2e1',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Preview
  previewContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  previewBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerBracket: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  cornerTL: {
    top: 12,
    left: 12,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FF6B00',
    opacity: 0.5,
  },
  cornerTR: {
    top: 12,
    right: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FF6B00',
    opacity: 0.5,
  },
  cornerBL: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FF6B00',
    opacity: 0.5,
  },
  cornerBR: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FF6B00',
    opacity: 0.5,
  },
  crosshairCenter: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairH: {
    position: 'absolute',
    width: 24,
    height: 1,
    backgroundColor: '#FF6B00',
    opacity: 0.4,
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: 24,
    backgroundColor: '#FF6B00',
    opacity: 0.4,
  },
  scanningLabel: {
    position: 'absolute',
    bottom: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#FF6B00',
    fontSize: 9,
    letterSpacing: 2,
    opacity: 0.7,
  },

  // Features
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 36,
    gap: 0,
  },
  featureRow: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#201f1f',
    borderStyle: 'dashed',
  },
  featureIcon: {
    width: 36,
    paddingTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 15,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  featureIndex: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#353534',
    fontSize: 11,
  },
  featureBody: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  // Forensic Section
  forensicSection: {
    paddingHorizontal: 20,
    marginTop: 48,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  forensicTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dataRows: {
    marginTop: 24,
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataRowLine: {
    width: 0,
    height: 28,
    borderLeftWidth: 2,
    marginRight: 12,
  },
  dataRowContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataRowLabel: {
    fontFamily: 'Inter_500Medium',
    color: '#FF6B00',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dataRowValueMono: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#888888',
    fontSize: 10,
  },
  forensicBody: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 20,
  },

  // Device Card
  deviceCard: {
    marginTop: 24,
    backgroundColor: '#1c1b1b',
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceMeta: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#4a4949',
    fontSize: 10,
    textTransform: 'uppercase',
    lineHeight: 18,
  },
  deviceCardData: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceDataLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#353534',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deviceDataValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#c8c6c5',
    fontSize: 12,
    marginTop: 4,
  },

  // Footer
  footer: {
    marginTop: 56,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  footerTagline: {
    fontFamily: 'Inter_500Medium',
    color: '#4a4949',
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  footerCopyright: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#2a2a2a',
    fontSize: 8,
    textTransform: 'uppercase',
    marginTop: 8,
    letterSpacing: 1,
  },
});
