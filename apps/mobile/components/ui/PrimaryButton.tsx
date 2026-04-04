import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
}

export function PrimaryButton({ title, onPress, loading }: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      className={`bg-amber items-center justify-center py-[14px] px-[28px] ${loading ? 'opacity-80' : ''}`}
      style={{ borderRadius: 0 }}
    >
      {loading ? (
        <ActivityIndicator color="#080808" />
      ) : (
        <Text className="font-body text-ink uppercase tracking-[1px] font-semibold text-[14px]">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
