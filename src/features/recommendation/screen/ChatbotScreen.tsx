import { THEMES } from '@/src/constants/themes';
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  RotateCcw,
  Send,
  Sparkles,
  Zap
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SKIN_THEME = THEMES.DERMA_AI;
const { COLORS, RADIUS, SHADOWS } = SKIN_THEME;

interface Message {
  id: string;
  text: string;
  sender: "ai" | "user";
  timestamp: Date;
}

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Derma AI Assistant. How can I help you understand your skin analysis results today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    
    // Call the real AI API
    await handleAiResponse(userText);
  };

const handleAiResponse = async (userText: string) => {
    setIsTyping(true);
    try {
      // Replace YOUR_IP with your local machine IP (e.g., 192.168.1.5 or 10.0.2.2 for Android Emulator)
      const response = await fetch('http://192.168.8.35:5001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: Date.now().toString(),
        text: data.reply || "I'm having trouble connecting to my clinical database. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: "Connection error. Please check if the AI server is running.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "reset-1",
        text: "Chat cleared. How else can I assist with your dermatological data?",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isAi = item.sender === "ai";
    return (
      <View style={[styles.messageRow, isAi ? styles.aiRow : styles.userRow]}>
        {isAi && (
          <View style={styles.avatarCircle}>
            <Sparkles size={12} color="#FFF" fill="#FFF" />
          </View>
        )}
        <View style={[
          styles.bubble, 
          isAi ? styles.aiBubble : styles.userBubble,
          isAi ? SHADOWS.SOFT : null
        ]}>
          <Text style={[styles.messageText, isAi ? styles.aiText : styles.userText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.titleRow}>
            <Zap size={14} color={COLORS.PRIMARY} fill={COLORS.PRIMARY} />
            <Text style={styles.headerTitle}>DERMA AI</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>CLINICAL MODE ACTIVE</Text>
          </View>
        </View>

        <TouchableOpacity onPress={resetChat} style={styles.headerBtn}>
          <RotateCcw size={20} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.typingText}>AI is analyzing data...</Text>
            </View>
          ) : null
        }
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about your results..."
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
              onPress={sendMessage}
              disabled={!input.trim()}
              activeOpacity={0.8}
            >
              <Send size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    ...SHADOWS.SOFT
  },
  headerBtn: { padding: 4 },
  headerTitleContainer: { alignItems: "center" },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 14, fontWeight: "900", color: COLORS.TEXT_PRIMARY, letterSpacing: 1 },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.SUCCESS, marginRight: 6 },
  statusText: { fontSize: 9, color: COLORS.TEXT_SECONDARY, fontWeight: "800", letterSpacing: 0.5 },

  // Chat
  chatList: { padding: 20, paddingBottom: 30 },
  messageRow: { marginBottom: 20, flexDirection: "row", alignItems: "flex-end" },
  aiRow: { justifyContent: "flex-start" },
  userRow: { justifyContent: "flex-end" },
  
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 4,
  },

  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.M,
  },
  aiBubble: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  userBubble: {
    backgroundColor: COLORS.TEXT_PRIMARY,
    borderBottomRightRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  aiText: { color: COLORS.TEXT_PRIMARY },
  userText: { color: "#FFF" },

  typingContainer: { flexDirection: "row", alignItems: "center", marginLeft: 38, gap: 10, marginTop: -10, marginBottom: 20 },
  typingText: { fontSize: 11, color: COLORS.TEXT_SECONDARY, fontWeight: "700", textTransform: 'uppercase', letterSpacing: 0.5 },

  // Input
  inputWrapper: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 25 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    backgroundColor: COLORS.WHITE,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: RADIUS.L,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
    maxHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
    fontWeight: '500',
  },
  sendBtn: {
    backgroundColor: COLORS.PRIMARY,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    ...SHADOWS.GLOW,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.BORDER,
    shadowOpacity: 0,
    elevation: 0,
  },
});