// ============================================
// Sahaara — Care Section Layout
// ============================================

import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/colors';

export default function CareLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="appointment/new"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="appointment/[id]" />
      <Stack.Screen
        name="appointment/edit/[id]"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="medication/new"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="medication/edit/[id]"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
}
