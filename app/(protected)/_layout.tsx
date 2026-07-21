import React from 'react';
import { Stack } from 'expo-router';

export default function ProtectedLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="holerite" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="notificacoes" options={{ headerShown: false }} />
      <Stack.Screen name="perfil" options={{ headerShown: false }} />
    </Stack>
  );
}
