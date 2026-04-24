import React from 'react';
import { Tabs } from 'expo-router';
import FloatingTabBar from '@/src/components/ui/FloatingTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="accounts" />
      <Tabs.Screen name="loans" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
