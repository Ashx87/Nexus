import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ConnectionStatus } from '@nexus/shared';
import { useThemeColors } from '../../settings/hooks/useSettings';

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
  const c = useThemeColors();
  const isConnected = status === 'connected';
  const isBusy = status === 'connecting' || status === 'reconnecting';
  const inputDisabled = isConnected || isBusy;

  return (
    <View style={[styles.form, { backgroundColor: c.surface }]}>
      {isConnected && serverName ? (
        <View style={[styles.serverInfo, { borderBottomColor: c.border }]}>
          <Text style={[styles.serverName, { color: c.text }]}>{serverName}</Text>
          {serverVersion ? (
            <Text style={[styles.serverVersion, { color: c.textSecondary }]}>v{serverVersion}</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={[styles.label, { color: c.textSecondary }]}>Server IP</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: c.border, color: c.text },
          inputDisabled
            ? { backgroundColor: c.background, color: c.textSecondary }
            : { backgroundColor: c.background },
        ]}
        value={host}
        onChangeText={onHostChange}
        placeholder="192.168.1.100"
        placeholderTextColor={c.textSecondary}
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!inputDisabled}
      />

      <Text style={[styles.label, { color: c.textSecondary }]}>Port</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: c.border, color: c.text },
          inputDisabled
            ? { backgroundColor: c.background, color: c.textSecondary }
            : { backgroundColor: c.background },
        ]}
        value={port}
        onChangeText={onPortChange}
        placeholder="9001"
        placeholderTextColor={c.textSecondary}
        keyboardType="number-pad"
        editable={!inputDisabled}
      />

      <TouchableOpacity
        style={[
          styles.button,
          isConnected || isBusy
            ? { backgroundColor: c.destructive }
            : { backgroundColor: c.primary },
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
  },
  serverName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serverVersion: {
    fontSize: 13,
    marginLeft: 8,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
