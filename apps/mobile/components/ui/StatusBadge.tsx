import React from 'react';
import { View, Text } from 'react-native';

export type BadgeStatus = 'VERIFIED' | 'PENDING' | 'SUSPICIOUS' | 'REVOKED';

export function StatusBadge({ status }: { status: BadgeStatus }) {
  let badgeColor = '';
  switch (status) {
    case 'VERIFIED': badgeColor = 'text-verified'; break;
    case 'PENDING': badgeColor = 'text-pending'; break;
    case 'SUSPICIOUS': badgeColor = 'text-suspicious'; break;
    case 'REVOKED': badgeColor = 'text-revoked'; break;
  }

  const bgColorMap = {
    VERIFIED: 'rgba(0, 230, 118, 0.1)',
    PENDING: 'rgba(79, 195, 247, 0.1)',
    SUSPICIOUS: 'rgba(255, 170, 0, 0.1)',
    REVOKED: 'rgba(255, 61, 61, 0.1)',
  };

  const dotColorMap = {
    VERIFIED: '#00E676',
    PENDING: '#4FC3F7',
    SUSPICIOUS: '#FFAA00',
    REVOKED: '#FF3D3D',
  };

  return (
    <View
      className="border flex-row items-center px-[10px] py-[4px] self-start"
      style={{ 
        backgroundColor: bgColorMap[status], 
        borderColor: dotColorMap[status] + '4D',
        borderRadius: 2
      }}
    >
      <View
        className="w-[6px] h-[6px] rounded-full mr-[6px]"
        style={{ backgroundColor: dotColorMap[status] }}
      />
      <Text className={`font-body font-semibold text-[11px] uppercase tracking-[1.5px] ${badgeColor}`}>
        {status}
      </Text>
    </View>
  );
}
