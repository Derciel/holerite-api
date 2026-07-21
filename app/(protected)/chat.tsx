import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { fetchChatMensagens, sendChatMensagem, markChatAsRead, ChatMensagem } from '../../src/services/holeriteService';

export default function ChatScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const loadMensagens = useCallback(async () => {
    const data = await fetchChatMensagens();
    setMensagens(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMensagens();
    markChatAsRead();

    pollRef.current = setInterval(() => {
      loadMensagens();
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadMensagens]);

  const handleEnviar = async () => {
    if (!novaMensagem.trim() || enviando) return;

    setEnviando(true);
    const msg = await sendChatMensagem(novaMensagem.trim());
    if (msg) {
      setMensagens(prev => [...prev, msg]);
      setNovaMensagem('');
    }
    setEnviando(false);
  };

  const formatHora = (data: string) => {
    try {
      const d = new Date(data);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (data: string) => {
    try {
      const d = new Date(data);
      const hoje = new Date();
      if (d.toDateString() === hoje.toDateString()) return 'Hoje';
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderItem = ({ item, index }: { item: ChatMensagem; index: number }) => {
    const isMe = item.remetente_id === Number(userId);
    const showDate = index === 0 || formatDate(item.data_criacao) !== formatDate(mensagens[index - 1]?.data_criacao);

    return (
      <View>
        {showDate && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateText}>{formatDate(item.data_criacao)}</Text>
          </View>
        )}
        <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
          {!isMe && (
            <Text style={[styles.senderName, item.remetente_role === 'ADMIN' && styles.senderAdmin]}>
              {item.remetente_nome}
            </Text>
          )}
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {item.mensagem}
            </Text>
            <Text style={[styles.timeText, isMe && styles.timeTextMe]}>
              {formatHora(item.data_criacao)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>RH - Dúvidas</Text>
          <Text style={styles.headerSubtitle}>Converse com o setor de RH</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando mensagens...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Nenhuma mensagem</Text>
              <Text style={styles.emptySubtitle}>
                Envie uma mensagem para o RH.
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#666"
          value={novaMensagem}
          onChangeText={setNovaMensagem}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!novaMensagem.trim() || enviando) && styles.sendBtnDisabled]}
          onPress={handleEnviar}
          disabled={!novaMensagem.trim() || enviando}
        >
          <Text style={styles.sendBtnText}>{enviando ? '...' : '→'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center',
  },
  backText: { color: '#FFF', fontSize: 18 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#888', fontSize: 14 },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  dateDivider: { alignItems: 'center', marginVertical: 16 },
  dateText: {
    fontSize: 12, fontWeight: '600', color: '#666', backgroundColor: '#1A1A1A',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, overflow: 'hidden',
  },
  messageRow: { marginBottom: 8, maxWidth: '80%' },
  messageRowMe: { alignSelf: 'flex-end' },
  messageRowOther: { alignSelf: 'flex-start' },
  senderName: { fontSize: 11, fontWeight: '700', color: '#00C19C', marginBottom: 4, paddingLeft: 4 },
  senderAdmin: { color: '#5A82FF' },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  bubbleMe: { backgroundColor: '#00C19C', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, color: '#FFF', lineHeight: 20 },
  messageTextMe: { color: '#000' },
  timeText: { fontSize: 10, color: '#666', marginTop: 4, alignSelf: 'flex-end' },
  timeTextMe: { color: 'rgba(0,0,0,0.5)' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#111',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, color: '#FFF', fontSize: 15, maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00C19C', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  sendBtnText: { color: '#000', fontSize: 20, fontWeight: '700' },
});
