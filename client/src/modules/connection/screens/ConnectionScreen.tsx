import React from 'react';
import { SafeAreaView, StatusBar, Text, StyleSheet } from 'react-native';
import { StatusBadge } from '../components/StatusBadge';
import { ConnectionForm } from '../components/ConnectionForm';
import { ReconnectBanner } from '../components/ReconnectBanner';
import { useConnection } from '../hooks/useConnection';
import { useThemeColors } from '../../settings/hooks/useSettings';

export function ConnectionScreen(): React.JSX.Element {
  const {
    host,
    port,
    setHost,
    setPort,
    status,
    serverName,
    serverVersion,
    reconnectAttempt,
    reconnectMaxAttempts,
    handleConnect,
    handleDisconnect,
  } = useConnection();
  const c = useThemeColors();
  const isDark = c.background === '#1c1c1e';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Text style={[styles.title, { color: c.text }]}>Nexus</Text>
      <StatusBadge status={status} />

      {status === 'reconnecting' ? (
        <ReconnectBanner
          attempt={reconnectAttempt}
          maxAttempts={reconnectMaxAttempts}
          onCancel={handleDisconnect}
        />
      ) : null}

      {status === 'error' ? (
        <Text style={[styles.errorText, { color: c.destructive }]}>
          Connection lost. Tap Connect to retry.
        </Text>
      ) : null}

      <ConnectionForm
        host={host}
        port={port}
        status={status}
        serverName={serverName}
        serverVersion={serverVersion}
        onHostChange={setHost}
        onPortChange={setPort}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
