import React from 'react';
import { View, Text } from 'react-native';

interface SensorRowProps {
  label: string;
  value: string;
}

export function SensorRow({ label, value }: SensorRowProps) {
  return (
    <View className="flex-row items-center border-[0.5px] border-transparent border-b-border py-2">
      <Text className="font-body text-text-secondary text-[12px] uppercase w-[100px]">
        {label}
      </Text>
      <View className="flex-1 border-t border-dotted border-border-light mx-2" />
      <Text className="font-mono text-text-primary text-[13px] font-medium">
        {value}
      </Text>
    </View>
  );
}
