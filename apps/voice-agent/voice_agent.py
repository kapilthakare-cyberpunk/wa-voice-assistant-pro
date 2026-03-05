"""
LiveKit Voice Agent - Simple Version

Uses your existing /api/chat endpoint.
Supports Deepgram STT and LiveKit TTS.
"""

import os
import asyncio
import aiohttp
from livekit import rtc
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, llm
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, silero, openai

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
AGENT_NAME = os.getenv("AGENT_NAME", "WhatsApp Assistant")


async def entrypoint(ctx: JobContext):
    """Main agent entrypoint"""
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for participant to join
    print(f"Waiting for participant in room: {ctx.room.name}")
    participant = await ctx.wait_for_participant()
    print(f"Participant joined: {participant.identity}")

    # Build chat context
    chat_ctx = llm.ChatContext()
    chat_ctx.messages.append(
        llm.ChatMessage(
            role=llm.ChatRole.SYSTEM,
            content="""You are a helpful voice assistant. 
Be friendly, concise, and helpful.
Keep responses short (1-2 sentences max) for voice.""",
        )
    )

    # Create the voice agent with Groq LLM
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=openai.LLM(
            model="groq/llama-3.3-70b-versatile",
            api_key=os.getenv("GROQ_API_KEY", ""),
        ),
        chat_ctx=chat_ctx,
    )

    @agent.on("user_speech_committed")
    def on_speech(transcription: rtc.Transcription):
        print(f"User said: {transcription.text}")

    # Start the agent
    agent.start(room=ctx.room, participant=participant)

    # Initial greeting
    await agent.say(
        "Hello! I'm your voice assistant. How can I help you today?",
        allow_interruptions=True,
    )

    # Keep the agent running
    await asyncio.Future()  # Run forever


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )
