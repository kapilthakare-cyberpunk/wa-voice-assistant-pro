#!/usr/bin/env python3
"""
Deploy agent to LiveKit Cloud using Python SDK
"""

import os
import asyncio
from livekit import api

# Your credentials
URL = "wss://wa-voice-assistant-pro-6xt2mjb9.livekit.cloud"
API_KEY = "APIRSqMApQuHPwS"
API_SECRET = "wE4UWRUaRN0aSUTkal3Ms7njLvRosKCwJFT7rLg4aQK"


async def deploy():
    # Create LiveKit API client
    livekit_api = api.LiveKitAPI(
        url=URL,
        api_key=API_KEY,
        api_secret=API_SECRET,
    )

    print("Connected to LiveKit API")

    # Get project info
    projects = await livekit_api.project.list()
    print(f"Projects: {projects}")

    await livekit_api.aclose()


if __name__ == "__main__":
    asyncio.run(deploy())
