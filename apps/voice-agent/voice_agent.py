"""
LiveKit Voice Agent - Using livekit-agents 1.x AgentSession API
Uses Deepgram STT, Silero VAD, and Groq LLM with AgentSession.
"""

import os
import asyncio
import logging
from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli, AgentSession
from livekit.plugins import deepgram, silero
import livekit.plugins.groq as groq

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")

# Configuration from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")


async def entrypoint(ctx: JobContext):
    """Main agent entrypoint"""
    logger.info(f"Starting agent in room: {ctx.room.name}")

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    logger.info("Connected to room")

    # Wait for participant
    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")

    # Create the session with pipeline
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STM(model="nova-2"),
        llm=groq.LLM(model="llama-3.3-70b-versatile"),
    )

    # Start the session
    await session.start(room=ctx.room, participant=participant)
    logger.info("Session started")

    # Send initial greeting
    await session.say(
        "Hello! I'm your voice assistant. How can I help you today?",
        allow_interruptions=True,
    )
    logger.info("Greeting sent")

    # Keep running
    await asyncio.Future()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="voice-assistant",
        )
    )
