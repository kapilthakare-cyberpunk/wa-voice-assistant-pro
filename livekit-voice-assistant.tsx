'use client';

import React from 'react';
import { useVoiceAssistant, useSession } from '@livekit/components-react';
import {
  AgentSessionProvider,
  AgentControlBar,
  AgentChatTranscript,
  AgentAudioVisualizerBar,
} from '@/components/agents-ui';
import { UnifiedLLMClient, type LLMConfig } from './unified-llm';
import { useEffect, useState } from 'react';

interface VoiceAssistantProps {
  llmConfig: LLMConfig;
  agentName: string;
  tokenSource: string;
}

export function LiveKitVoiceAssistant({ llmConfig, agentName, tokenSource }: VoiceAssistantProps) {
  const session = useSession(tokenSource, { agentName });
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const [llmClient] = useState(() => new UnifiedLLMClient(llmConfig));
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);

  // Process agent transcriptions through LLM
  useEffect(() => {
    const processTranscriptions = async () => {
      if (agentTranscriptions.length === 0) return;

      const lastTranscription = agentTranscriptions[agentTranscriptions.length - 1];
      const userText = lastTranscription.text;

      // Check if this message is already processed
      if (conversationHistory.some((msg) => msg.content === userText && msg.role === 'user')) {
        return;
      }

      try {
        // Add user transcription
        const updatedHistory = [
          ...conversationHistory,
          { role: 'user', content: userText },
        ];

        // Get LLM response
        const aiResponse = await llmClient.chat(updatedHistory as any);

        // Update history with AI response
        setConversationHistory([
          ...updatedHistory,
          { role: 'assistant', content: aiResponse },
        ]);

        // In a real implementation, you'd send aiResponse to LiveKit agent
        // via data channel or API call
        console.log('AI Response:', aiResponse);
      } catch (error) {
        console.error('Error processing transcription:', error);
      }
    };

    processTranscriptions();
  }, [agentTranscriptions, conversationHistory, llmClient]);

  const handleToggleSession = () => {
    if (session.connectionState === 'disconnected') {
      session.start();
    } else {
      session.end();
    }
  };

  return (
    <AgentSessionProvider session={session}>
      <div className="flex flex-col gap-4 p-4 w-full max-w-2xl">
        {/* Agent Status */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Voice Assistant</h1>
          <div className="text-sm text-gray-600">
            Status: <span className="font-semibold">{state}</span>
          </div>
        </div>

        {/* Audio Visualizer */}
        {audioTrack && (
          <div className="flex justify-center p-4 bg-gray-100 rounded-lg">
            <AgentAudioVisualizerBar />
          </div>
        )}

        {/* Conversation Transcript */}
        <div className="flex-1 overflow-y-auto max-h-96 p-3 border rounded-lg bg-gray-50">
          {conversationHistory.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Start speaking to begin...</p>
          ) : (
            conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 p-2 rounded ${
                  msg.role === 'user'
                    ? 'bg-blue-100 text-blue-900 ml-8'
                    : 'bg-green-100 text-green-900 mr-8'
                }`}
              >
                <strong>{msg.role === 'user' ? 'You' : 'Agent'}:</strong> {msg.content}
              </div>
            ))
          )}
        </div>

        {/* Control Bar */}
        <AgentControlBar variant="livekit" isConnected={session.isConnected} />

        {/* Session Toggle */}
        <button
          onClick={handleToggleSession}
          className={`px-4 py-2 rounded font-semibold text-white ${
            session.connectionState === 'connected' ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {session.connectionState === 'connected' ? 'End Session' : 'Start Session'}
        </button>
      </div>
    </AgentSessionProvider>
  );
}