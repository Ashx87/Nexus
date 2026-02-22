import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ConnectionStatus } from '@nexus/shared';

interface ConnectionFormProps {
  readonly host: string;
  readonly port: string;
  readonly status: ConnectionStatus;
  readonly serverName: string | null;
  readonly serverVersion: string | null;
  readonly onHostChange: (value: string) => void;
  readonly onPortChange: (value: string) => void;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
}

export function ConnectionForm({
  host,
  port,
  status,
  serverName,
  serverVersion,
  onHostChange,
  onPortChange,
  onConnect,
  onDisconnect,
}: ConnectionFormProps): React.JSX.Element {
  const isConnected = status === 'connected';
  const isBusy = status === 'connecting' || status === 'reconnecting';
  const inputDisabled = isConnected || isBusy;

  return (
    <View style={styles.form}>
      {isConnected && serverName ? (
        <View style={styles.serverInfo}>
          <Text style={styles.serverName}>{serverName}</Text>
          {serverVersion ? (
            <Text style={styles.serverVersion}>v{serverVersion}</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.label}>Server IP</Text>
      <TextInput
        style={[styles.input, inputDisabled && styles.inputDisabled]}
        value={host}
        onChangeText={onHostChange}
        placeholder="192.168.1.100"
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!inputDisabled}
      />

      <Text style={styles.label}>Port</Text>
      <TextInput
        style={[styles.input, inputDisabled && styles.inputDisabled]}
        value={port}
        onChangeText={onPortChange}
        placeholder="9001"
        keyboardType="number-pad"
        editable={!inputDisabled}
      />

      <TouchableOpacity
        style={[
          styles.button,
          isConnected || isBusy
            ? styles.buttonDisconnect
            : styles.buttonConnect,
        ]}
        onPress={isConnected || isBusy ? onDisconnect : onConnect}
        disabled={status === 'connecting'}>
        <Text style={styles.buttonText}>
          {isConnected
            ? 'Disconnect'
            : isBusy
              ? 'Connecting\u2026'
              : 'Connect'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  serverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  serverVersion: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  button: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonConnect: {
    backgroundColor: '#007AFF',
  },
  buttonDisconnect: {
    backgroundColor: '#ff3b30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
