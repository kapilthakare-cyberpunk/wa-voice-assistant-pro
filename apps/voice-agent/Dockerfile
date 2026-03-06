FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy agent code
COPY voice_agent.py .

# Set environment variables - should be provided at runtime
# ENV LIVEKIT_URL=
# ENV LIVEKIT_API_KEY=
# ENV LIVEKIT_API_SECRET=
# ENV GROQ_API_KEY=

# Run the agent
CMD ["python", "voice_agent.py"]
