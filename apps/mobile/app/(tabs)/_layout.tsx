import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#4a4949',
        tabBarStyle: {
          backgroundColor: '#0e0e0e',
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          // Ghost border at top — no hard lines per design system
          borderTopColor: 'rgba(90, 65, 54, 0.15)',
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="camera"
        options={{
          title: 'CAPTURE',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? { 
              borderBottomWidth: 2, 
              borderBottomColor: '#FF6B00', 
              paddingBottom: 2 
            } : { paddingBottom: 4 }}>
              <Ionicons name="scan" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'HISTORY',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? { 
              borderBottomWidth: 2, 
              borderBottomColor: '#FF6B00', 
              paddingBottom: 2 
            } : { paddingBottom: 4 }}>
              <Ionicons name="document-text-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'DEVICE',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? { 
              borderBottomWidth: 2, 
              borderBottomColor: '#FF6B00', 
              paddingBottom: 2 
            } : { paddingBottom: 4 }}>
              <Ionicons name="hardware-chip-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
