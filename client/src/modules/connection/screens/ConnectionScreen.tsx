import React from 'react';
import { SafeAreaView, StatusBar, Text, StyleSheet } from 'react-native';
import { StatusBadge } from '../components/StatusBadge';
import { ConnectionForm } from '../components/ConnectionForm';
import { ReconnectBanner } from '../components/ReconnectBanner';
import { useConnection } from '../hooks/useConnection';

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Nexus</Text>
      <StatusBadge status={status} />

      {status === 'reconnecting' ? (
        <ReconnectBanner
          attempt={reconnectAttempt}
          maxAttempts={reconnectMaxAttempts}
          onCancel={handleDisconnect}
        />
      ) : null}

      {status === 'error' ? (
        <Text style={styles.errorText}>
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

      <Text style={styles.hint}>Phase 1 — Connection Manager</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
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
    color: '#ff3b30',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 8,
  },
});
