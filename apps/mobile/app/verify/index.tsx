import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../constants/api';
import { decodeECC } from '../../utils/reedSolomon';

export default function VerifyIndexScreen() {
  const router = useRouter();
  const [certId, setCertId] = useState('');

  const handleVerify = () => {
    if (certId.trim().length > 0) {
      router.push(`/verify/${certId.trim()}`);
    }
  };

  const pickImageAndDecode = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      scanImageForWatermark(result.assets[0].base64);
    }
  };

  const scanImageForWatermark = async (base64Image: string) => {
    try {
      // We simulate hitting the robust Watermark Decoder backend.
      // This Vertex AI service looks into the frequency domain (or specific pixels)
      // and retrieves the encoded footprint (e.g. "a3f9c2d1-ECC9AB...")
      
      const response = await fetch(`${API_URL}/api/v1/decode`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ image: base64Image })
      });

      if (response.ok) {
         const data = await response.json();
         if (data.eccPayload) {
            // Apply Error Correction to fix flipped bits caused by compression
            const cleanId = decodeECC(data.eccPayload);
            if (cleanId) {
               router.push(`/verify/${cleanId}`);
            } else {
               alert('Watermark detected but too degraded to reconstruct via ECC.');
            }
         }
      } else {
         // Fallback/Demo: if backend is unavailable or not set up
         alert('Scanner Backend not reachable. Simulating recovery...');
         setTimeout(() => {
           // Demo ECC reconstruction
           const demoDecoded = decodeECC("demo-abc12345-ECC9AB4");
           if (demoDecoded) {
              router.push(`/verify/${demoDecoded}`);
           }
         }, 1000);
      }
    } catch (err) {
      console.warn("Decode failed:", err);
      // Fallback/Demo error catch
      alert('Could not decode robust watermark. Simulating recovery...');
      const demoDecoded = decodeECC("demo-timeout-1122-ECCX");
      if (demoDecoded) router.push(`/verify/${demoDecoded}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#131313' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.topBarBack}>
            <Ionicons name="arrow-back" size={22} color="#e5e2e1" />
          </TouchableOpacity>
          <View style={s.topBarTitle}>
            <Text style={s.topBarBrand}>PHYGITAL-TRACE</Text>
            <Text style={s.topBarSlash}> / </Text>
            <Text style={s.topBarVerify}>VERIFY</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        <View style={s.container}>
          <Ionicons name="shield-checkmark-outline" size={64} color="#FF6B00" style={{ marginBottom: 24 }} />
          <Text style={s.title}>VERIFY CERTIFICATE</Text>
          <Text style={s.bodyText}>
            Enter the certificate ID to verify authenticity on the blockchain.
          </Text>

          <View style={s.inputContainer}>
            <TextInput
              style={s.input}
              placeholder="Certificate ID (e.g., demo-... or hash)"
              placeholderTextColor="#4a4949"
              value={certId}
              onChangeText={setCertId}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleVerify}
            />
          </View>

          <TouchableOpacity 
            style={[s.verifyButton, certId.trim().length === 0 && { opacity: 0.5 }]}
            onPress={handleVerify}
            disabled={certId.trim().length === 0}
          >
            <Text style={s.verifyButtonText}>VERIFY NOW</Text>
            <Ionicons name="arrow-forward" size={18} color="#131313" />
          </TouchableOpacity>

          <View style={s.dividerContainer}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>OR</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity style={s.scanButton} onPress={pickImageAndDecode}>
            <Ionicons name="scan-outline" size={18} color="#e5e2e1" />
            <Text style={s.scanButtonText}>SCAN AI WATERMARKED IMAGE</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#201f1f',
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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 24,
    letterSpacing: 2,
    marginBottom: 12,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    maxWidth: '80%',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#e5e2e1',
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    padding: 16,
    borderRadius: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 4,
    gap: 8,
  },
  verifyButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#131313',
    fontSize: 16,
    letterSpacing: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  dividerText: {
    color: '#4a4949',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginHorizontal: 16,
    fontSize: 12,
    letterSpacing: 2,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1b1b',
    borderWidth: 1,
    borderColor: '#4a4949',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 4,
    gap: 8,
  },
  scanButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#e5e2e1',
    fontSize: 14,
    letterSpacing: 1,
  },
});
