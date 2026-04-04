import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface GhostButtonProps {
  title: string;
  onPress: () => void;
}

export function GhostButton({ title, onPress }: GhostButtonProps) {
  return (
    <TouchableOpacity
      className="bg-transparent border border-border-light items-center justify-center py-[14px] px-[28px]"
      style={{ borderRadius: 0 }}
      onPress={onPress}
    >
      <Text className="font-body text-text-primary text-[14px] font-medium">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
