import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export function HashDisplay({ hash }: { hash: string }) {
  return (
    <TouchableOpacity className="bg-surface border border-border flex-row justify-between items-center px-[14px] py-[10px] border-l-2 border-l-amber">
      <Text className="font-mono text-amber-glow text-[12px] flex-1 mr-4" numberOfLines={1}>
        {hash}
      </Text>
      <FontAwesome name="clipboard" size={14} color="#888888" />
    </TouchableOpacity>
  );
}
