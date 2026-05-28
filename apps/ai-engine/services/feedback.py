import numpy as np
import time
import os
import json
import requests
from typing import Dict, Any, List

# Gracefully import OpenAI for LLM integrations
try:
    import openai
except Exception:
    openai = None

def _load_settings_from_json():
    # Attempt to load from absolute path first, then relative paths
    paths = [
        "/Users/srikartest/Desktop/InterviewMirror AI/setting.json",
        "setting.json",
        "../setting.json",
        "../../setting.json",
    ]
    for path in paths:
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    data = json.load(f)
                    env_data = data.get("env", {})
                    for k, v in env_data.items():
                        # Set in env if not already set, or override empty values
                        if v and (not os.getenv(k) or os.getenv(k) == ""):
                            os.environ[k] = str(v)
                print(f"[FeedbackProcessor] Loaded settings from {path}")
                break
            except Exception as e:
                print(f"[FeedbackProcessor] Error loading setting.json from {path}: {e}")

class FeedbackProcessor:
    @classmethod
    def _get_openrouter_feedback(
        cls,
        session_id: str,
        summary_scores: Dict[str, float],
        speech_logs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Attempts to query OpenRouter to generate deep dynamic recruiter insights.
        Falls back to rule-based evaluation if keys are missing or API fails.
        """
        _load_settings_from_json()

        api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("ANTHROPIC_AUTH_TOKEN") or os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("No OPENROUTER_API_KEY or ANTHROPIC_AUTH_TOKEN found in environment or setting.json.")

        base_url = os.getenv("ANTHROPIC_BASE_URL") or "https://openrouter.ai/api/v1"
        model = os.getenv("ANTHROPIC_MODEL") or "nvidia/nemotron-3-super-120b-a12b:free"

        # Prepare payload variables
        posture = summary_scores.get("postureScore", 0.85)
        eye_contact = summary_scores.get("eyeContactScore", 0.88)
        engagement = summary_scores.get("engagementScore", 0.90)
        confidence = summary_scores.get("confidenceScore", 0.86)
        communication = summary_scores.get("communicationScore", 0.85)
        professionalism = summary_scores.get("professionalismScore", 0.87)

        fillers = speech_logs.get("fillerWords", {})
        filler_density = speech_logs.get("fillerDensity", 0.04)
        speech_rate = speech_logs.get("speechRateWPM", 130.0)
        transcription = speech_logs.get("transcription", "")
        keywords = speech_logs.get("keywords", [])

        # Construct prompt
        system_prompt = (
            "You are an elite, highly professional Technical Recruiter and Career Coach. "
            "Your task is to analyze candidate session data and construct a recruiter-ready HR feedback report. "
            "Respond ONLY with a valid raw JSON object matching the exact schema below. Do not wrap it in markdown code blocks or add any other text."
        )

        user_content = f"""
Candidate Session: {session_id}
Discipline / Focus: Software Engineering & System Architecture
Speech Rate: {speech_rate} words per minute (WPM)
Filler word density: {round(filler_density * 100, 1)}%
Filler word counts: {json.dumps(fillers)}
Terminology Keywords matched: {json.dumps(keywords)}

Performance Analytics Scores (out of 100):
- Upright Posture: {round(posture * 100, 1)}%
- Steady Eye Contact: {round(eye_contact * 100, 1)}%
- Camera Engagement: {round(engagement * 100, 1)}%
- Visual Confidence: {round(confidence * 100, 1)}%
- Verbal Communication: {round(communication * 100, 1)}%
- Overall Professionalism Score: {round(professionalism * 100, 1)}%

Candidate spoken transcript:
\"\"\"
{transcription}
\"\"\"

Please generate a professional evaluation. The response must be a single JSON object with the following fields:
1. "hiringRecommendation": string (Must be one of "Strong Hire", "Hire", "Needs Practice", "Strong Practice" matching overall professionalism score)
2. "recruiterNote": string (A highly personalized, sophisticated 2-3 sentence recruiter note about the candidate's soft and hard skills vibes and technical performance)
3. "executiveSummary": string (A comprehensive 3-4 sentence professional executive summary summarizing the session and body/speaking traits)
4. "strengths": list of 3 strings (Distinct, highly specific professional strengths observed or computed from the transcript/scores)
5. "weaknesses": list of 2 strings (Distinct, constructive professional weaknesses/improvement areas computed from the transcript/scores)
6. "roadmap": list of 3 objects, each representing a structured phase/step to improve:
   - "phase": string (e.g. "Step 1: Pacing & Fluency", "Step 2: Eye Contact & Gaze Anchoring", "Step 3: Posture Calibration")
   - "exercise": string (Highly actionable, practical exercises designed to correct their visual/vocal deficiencies)
   - "timeframe": string (e.g. "1-3 Days", "4-7 Days", "8-10 Days")

JSON Output Schema:
{{
  "hiringRecommendation": "string",
  "recruiterNote": "string",
  "executiveSummary": "string",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string"],
  "roadmap": [
    {{
      "phase": "string",
      "exercise": "string",
      "timeframe": "string"
    }},
    ...
  ]
}}
"""

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://interviewmirror.ai",
            "X-Title": "InterviewMirror AI",
        }

        req_payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "temperature": 0.3,
        }

        response = requests.post(f"{base_url}/chat/completions", headers=headers, json=req_payload, timeout=15)
        response.raise_for_status()

        res_data = response.json()
        content = res_data["choices"][0]["message"]["content"].strip()

        # Handle potential markdown code fencing wrapper (```json ... ```)
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].strip() == "```":
                lines = lines[:-1]
            content = "\n".join(lines).strip()

        parsed = json.loads(content)

        # Validate structure to avoid empty or corrupted outputs
        required_keys = ["hiringRecommendation", "recruiterNote", "executiveSummary", "strengths", "weaknesses", "roadmap"]
        for key in required_keys:
            if key not in parsed:
                raise ValueError(f"OpenRouter response missing required field: {key}")

        return parsed

    @classmethod
    def generate_feedback(
        cls, 
        session_id: str, 
        summary_scores: Dict[str, float], 
        speech_logs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates a comprehensive, recruiter-style AI evaluation report.
        Integrates visual, vocal, and conversational NLP metrics into a holistic summary.
        """
        posture = summary_scores.get("postureScore", 0.85)
        eye_contact = summary_scores.get("eyeContactScore", 0.88)
        engagement = summary_scores.get("engagementScore", 0.90)
        confidence = summary_scores.get("confidenceScore", 0.86)
        communication = summary_scores.get("communicationScore", 0.85)
        professionalism = summary_scores.get("professionalismScore", 0.87)

        # Attempt to get OpenRouter generation first
        try:
            openrouter_res = cls._get_openrouter_feedback(session_id, summary_scores, speech_logs)
            
            # Benchmark evaluation comparing against top 10% candidates
            benchmark_comparison = {
                "candidateScore": round(professionalism * 100, 1),
                "globalBenchmarkAverage": 78.5,
                "percentile": round(80 + (professionalism - 0.78) * 100, 1)
            }
            if benchmark_comparison["percentile"] > 99.0:
                benchmark_comparison["percentile"] = 99.0
            elif benchmark_comparison["percentile"] < 1.0:
                benchmark_comparison["percentile"] = 1.0

            return {
                "sessionId": session_id,
                "overallScore": round(professionalism * 100, 1),
                "hiringRecommendation": openrouter_res["hiringRecommendation"],
                "recruiterNote": openrouter_res["recruiterNote"],
                "executiveSummary": openrouter_res["executiveSummary"],
                "strengths": openrouter_res["strengths"],
                "weaknesses": openrouter_res["weaknesses"],
                "benchmark": benchmark_comparison,
                "roadmap": openrouter_res["roadmap"],
                "scoringBreakdown": {
                    "postureScore": round(posture * 100, 1),
                    "eyeContactScore": round(eye_contact * 100, 1),
                    "engagementScore": round(engagement * 100, 1),
                    "confidenceScore": round(confidence * 100, 1),
                    "communicationScore": round(communication * 100, 1),
                    "professionalismScore": round(professionalism * 100, 1)
                },
                "generatedAt": float(time.time()),
                "openrouterActive": True
            }
        except Exception as e:
            print(f"[FeedbackProcessor] OpenRouter feedback failed, falling back to heuristics: {e}")

        # Retrieve filler details
        fillers = speech_logs.get("fillerWords", {})
        filler_density = speech_logs.get("fillerDensity", 0.04)
        speech_rate = speech_logs.get("speechRateWPM", 130.0)

        # 1. Multi-Stage Recruiter Reasoning & Strengths / Weaknesses Engine
        strengths = []
        weaknesses = []
        roadmap = {}

        # Evaluate Posture & Body Language
        if posture >= 0.85:
            strengths.append("Maintains highly disciplined, upright presentation posture, projecting strong executive presence.")
        else:
            weaknesses.append("Shows slight posture slumping and shoulder tilt shifts during long explanations.")
            roadmap["Body Language Drill"] = "Practice sitting upright with shoulders aligned. Perform 2-minute posture resets before starting your camera sessions."

        # Evaluate Gaze & Eye Contact
        if eye_contact >= 0.85:
            strengths.append("Demonstrates exceptional eye contact consistency, maintaining steady connection with the camera.")
        else:
            weaknesses.append("Displays frequent gaze shifts and brief drops in eye contact when concentrating on technical replies.")
            roadmap["Focus Alignment exercise"] = "Place a small visual marker (like a sticker) right next to your camera lens to practice anchoring your gaze when discussing complex details."

        # Evaluate Speaking Fluency & Fillers
        if communication >= 0.85:
            strengths.append("Demonstrates outstanding verbal fluency with natural transitions and highly clean sentence phrasing.")
        else:
            weaknesses.append(f"Elevated density of vocal pauses and filler terms (uses 'like', 'um', or 'actually' {sum(fillers.values())} times).")
            roadmap["Pacing Exercise"] = "Practice the 'Silent Pause' technique: when you feel a filler word coming, pause for exactly 1 second, take a silent breath, and proceed."

        # Ensure we have at least 3 strengths and 2 weaknesses for recruiter completeness
        if len(strengths) < 3:
            strengths.append("Conveys strong professional enthusiasm and stable, confident vocal energy throughout.")
        if len(strengths) < 3:
            strengths.append("Exhibits excellent structure in technical thoughts with coherent keywords.")
        if len(weaknesses) < 2:
            weaknesses.append("Pitch stability fluctuates slightly under pressure, indicating slight nervousness.")
            roadmap["Voice Control Exercise"] = "Hum a steady tone for 10 seconds before your mock sessions to relax your vocal cords and stabilize pitch."

        # 2. Benchmark evaluation comparing against top 10% candidates
        benchmark_comparison = {
            "candidateScore": round(professionalism * 100, 1),
            "globalBenchmarkAverage": 78.5,
            "percentile": round(80 + (professionalism - 0.78) * 100, 1)
        }
        if benchmark_comparison["percentile"] > 99.0:
            benchmark_comparison["percentile"] = 99.0
        elif benchmark_comparison["percentile"] < 1.0:
            benchmark_comparison["percentile"] = 1.0

        # 3. Recruiter Hiring Recommendation Level
        overall_val = professionalism
        if overall_val >= 0.90:
            recommendation = "Strong Hire"
            recruiter_note = "An exceptional candidate who demonstrates strong communication, poise, and high visual engagement."
        elif overall_val >= 0.80:
            recommendation = "Hire"
            recruiter_note = "A solid professional candidate with highly balanced presentation. Fit for the role with minor communication adjustments."
        elif overall_val >= 0.70:
            recommendation = "Needs Practice"
            recruiter_note = "Candidate demonstrates good knowledge but should work on reducing filler words and anchoring camera eye contact."
        else:
            recommendation = "Strong Practice"
            recruiter_note = "Candidate requires focused practice to overcome posture slumps and excessive vocal hesitation."

        # 4. 3-Step Growth Roadmap
        step_roadmap = [
            {
                "phase": "Step 1: Pacing & Fluency",
                "exercise": roadmap.get("Pacing Exercise", "Practice speaking slowly (120-130 WPM) and substitute silent breaths for 'um'/'like' pauses."),
                "timeframe": "1-3 Days"
            },
            {
                "phase": "Step 2: Eye Contact & Gaze Anchoring",
                "exercise": roadmap.get("Focus Alignment exercise", "Anchor your gaze on the camera lens for at least 80% of your explanation. Avoid looking down."),
                "timeframe": "4-7 Days"
            },
            {
                "phase": "Step 3: Posture Calibration",
                "exercise": roadmap.get("Body Language Drill", "Calibrate camera to eye level. Keep shoulders flat and square to reduce posture slumping."),
                "timeframe": "8-10 Days"
            }
        ]

        # 5. Executive AI Summary
        summary = (
            f"The candidate completed session {session_id} with an overall professionalism score of "
            f"{round(professionalism*100, 0)}%. They showed strong alignment in "
            f"{'posture and body poise' if posture > eye_contact else 'camera eye contact'}. "
            f"Communication pacing is stable at {round(speech_rate, 1)} words per minute. "
            f"Implementing the recommended exercises will help refine technical fluency."
        )

        return {
            "sessionId": session_id,
            "overallScore": round(professionalism * 100, 1),
            "hiringRecommendation": recommendation,
            "recruiterNote": recruiter_note,
            "executiveSummary": summary,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "benchmark": benchmark_comparison,
            "roadmap": step_roadmap,
            "scoringBreakdown": {
                "postureScore": round(posture * 100, 1),
                "eyeContactScore": round(eye_contact * 100, 1),
                "engagementScore": round(engagement * 100, 1),
                "confidenceScore": round(confidence * 100, 1),
                "communicationScore": round(communication * 100, 1),
                "professionalismScore": round(professionalism * 100, 1)
            },
            "generatedAt": float(time.time()),
            "openrouterActive": False
        }
