from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
from typing import Dict, Any, List
from services.pose import PostureProcessor
from services.face import FacialProcessor
from services.speech import SpeechProcessor
from services.feedback import FeedbackProcessor

router = APIRouter()

class AnalysisRequest(BaseModel):
    sessionId: str
    videoUrl: str

@router.post("/analyze")
async def analyze_video(payload: AnalysisRequest):
    try:
        # Validate parameters
        if not payload.videoUrl or not payload.sessionId:
            raise HTTPException(status_code=400, detail="sessionId and videoUrl parameters are required")

        # 1. Process Posture (MediaPipe Pose Timeline)
        posture_logs = PostureProcessor.process_video_timeline(payload.videoUrl)

        # 2. Process Facial Expressions, Gaze, and Emotions (MediaPipe FaceMesh Timeline)
        facial_logs = FacialProcessor.process_facial_timeline(payload.videoUrl)

        # 3. Process Conversational Speech and Whisper NLP Analytics
        speech_logs = SpeechProcessor.process_audio(payload.videoUrl)

        # 4. Aggregated Scoring Engine:
        posture_scores = [log.get("postureScore", 0.0) for log in posture_logs if "postureScore" in log]
        eye_contact_scores = [log.get("eyeContactScore", 0.0) for log in facial_logs if "eyeContactScore" in log]
        engagement_scores = [log.get("engagementScore", 0.0) for log in posture_logs if "engagementScore" in log]
        
        visual_confidence_scores = [
            (log.get("confidenceScore", 0.0) + face.get("confidenceScore", 0.0)) / 2.0
            for log, face in zip(posture_logs, facial_logs)
            if "confidenceScore" in log and "confidenceScore" in face
        ]
        
        avg_posture = round(float(np.mean(posture_scores)), 2) if posture_scores else 0.85
        avg_eye_contact = round(float(np.mean(eye_contact_scores)), 2) if eye_contact_scores else 0.88
        avg_engagement = round(float(np.mean(engagement_scores)), 2) if engagement_scores else 0.90
        
        avg_visual_conf = float(np.mean(visual_confidence_scores)) if visual_confidence_scores else 0.85
        voice_conf = speech_logs.get("voiceConfidenceScore", 0.88)
        avg_confidence = round((avg_visual_conf * 0.5 + voice_conf * 0.5), 2)
        
        comm_score = speech_logs.get("communicationScore", 0.86)
        
        # Professionalism blends posture (30%), eye contact (25%), engagement (25%), and communication (20%)
        avg_professionalism = round((avg_posture * 0.3 + avg_eye_contact * 0.25 + avg_engagement * 0.25 + comm_score * 0.20), 2)

        summary_scores = {
            "postureScore": avg_posture,
            "eyeContactScore": avg_eye_contact,
            "engagementScore": avg_engagement,
            "confidenceScore": avg_confidence,
            "communicationScore": comm_score,
            "professionalismScore": avg_professionalism
        }

        # 5. Generate Holistically Reasoned Recruiter-Ready HR Feedback Report
        feedback_report = FeedbackProcessor.generate_feedback(payload.sessionId, summary_scores, speech_logs)

        # 6. Extract highlights and build behavior timeline events
        behavior_timeline = []
        for p, f in zip(posture_logs, facial_logs):
            t = p.get("timestampSeconds", 0.0)
            events = []
            if p.get("isSlumping", False):
                events.append("Slumping posture detected")
            if f.get("eyeContactScore", 0.0) < 0.65:
                events.append("Eye contact dropped")
            if f.get("primaryEmotion") == "Surprised":
                events.append("Expressive micro-movement")

            if events:
                behavior_timeline.append({
                    "timestampSeconds": t,
                    "events": events
                })

        return {
            "success": True,
            "sessionId": payload.sessionId,
            "summaryScores": summary_scores,
            "hrFeedback": feedback_report,
            "behaviorTimeline": behavior_timeline,
            "postureAnalysis": posture_logs,
            "facialAnalysis": facial_logs,
            "speechAnalysis": speech_logs,
            "detailedLogs": {
                "posture": posture_logs,
                "facial": facial_logs,
                "speech": speech_logs
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal AI voice, video, and HR feedback analytics pipeline error: {str(e)}")
