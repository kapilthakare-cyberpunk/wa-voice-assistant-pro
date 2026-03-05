"""
LiveKit Voice Agent for WhatsApp Voice Assistant Pro

This agent:
1. Listens for voice input from the user
2. Sends the transcribed text to your backend API
3. Gets AI responses from your Groq-powered backend
4. Converts responses to speech and plays back to user
"""

import os
import asyncio
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import openai, deepgram, silero

# Your backend API URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")


async def get_ai_response(user_message: str, user_id: str = "voice-user") -> str:
    """Call your backend API for AI responses"""
    import aiohttp

    url = f"{BACKEND_URL}/api/chat"
    payload = {"userId": user_id, "message": user_message}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url, json=payload, timeout=aiohttp.ClientTimeout(total=30)
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get("response", "Sorry, I couldn't get a response.")
                else:
                    return f"Error: API returned status {resp.status}"
    except Exception as e:
        return f"Error connecting to backend: {str(e)}"


async def entrypoint(ctx: JobContext):
    """Main agent entrypoint"""
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Wait for participant to join
    participant = await ctx.wait_for_participant()

    # Create the voice agent with:
    # - Deepgram for STT (speech-to-text)
    # - Silero for VAD (voice activity detection)
    # - OpenAI-compatible LLM (connecting to your Groq backend)
    # - LiveKit's built-in TTS

    # Note: Using OpenAI plugin but pointing to your Groq backend
    # You may need to adjust based on your LLM setup

    initial_ctx = llm.ChatContext()
    initial_ctx.messages.append(
        llm.ChatMessage(
            role=llm.ChatRole.SYSTEM,
            content="""You are a helpful voice assistant for WhatsApp. 
You are friendly, concise, and helpful.
Respond to user questions and commands.
Keep responses short and conversational for voice.""",
        )
    )

    # Create the voice agent
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=openai.LLM(
            model="groq/llama-3.3-70b-versatile",
            api_key=os.getenv("GROQ_API_KEY", ""),
            base_url=f"{BACKEND_URL}/api/llm",  # You'll need to add this endpoint
        ),
        tts=rtc.TTS(),
        chat_ctx=initial_ctx,
    )

    @agent.on("user_speech_committed")
    def on_speech(user_message: rtc.Transcription):
        """Handle user voice input"""
        print(f"User said: {user_message.text}")

    # Start the agent with the participant's microphone
    agent.start(
        room=ctx.room,
        participant=participant,
        # Use a custom reply function that calls your backend
        fnc_ctx=llm.ChatContext(),
    )

    # Override the default reply to use your backend
    await agent.say(
        "Hello! I'm your WhatsApp voice assistant. How can I help you today?",
        allow_interruptions=True,
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=None,
        )
    )
