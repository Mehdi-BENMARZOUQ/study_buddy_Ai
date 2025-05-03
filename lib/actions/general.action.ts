"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";


export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    const originalQuestions = interviewDoc.data()?.questions || [];

    const qaPairs = [];
    let answerBuffer = "";
    let currentQIndex = 0;

    for (const item of transcript) {
        if (item.role === "candidate") {
            answerBuffer += item.content + " ";
        }
        else if (item.role === "interviewer" && answerBuffer) {

            qaPairs.push({
                question: originalQuestions[currentQIndex] || "Unknown question",
                response: answerBuffer.trim()
            });
            currentQIndex++;
            answerBuffer = "";
        }
    }


    const { object: feedback } = await generateObject({
        model: google("gemini-2.0-flash-001"),
        schema: feedbackSchema,
        prompt: `
      Analyze this interview transcript and provide HONEST feedback.
      
      **Rules:**
      - If the candidate gave poor answers, reflect that in scores.
      - If answers are wrong, mention it.
      - If responses are too short, penalize "Communication" and "Clarity".
      
      **Questions & Responses:**
      ${qaPairs.map((qa, i) => `
        Q${i + 1}: ${qa.question}
        A${i + 1}: ${qa.response}
      `).join('\n')}
    `,
        system: `
      You are a strict interviewer. Provide accurate, critical feedback.
      - Highlight incorrect answers.
      - Penalize vague responses.
      - Adjust scores based on real performance.
    `,
    });

    // 5. Save to Firestore
    const feedbackRef = feedbackId
        ? db.collection("feedback").doc(feedbackId)
        : db.collection("feedback").doc();

    await feedbackRef.set({
        interviewId,
        userId,
        transcript,
        qaPairs,
        ...feedback,
        createdAt: new Date().toISOString(),
    });

    return { success: true, feedbackId: feedbackRef.id };
}


export async function getInterviewById(id: string): Promise<Interview | null> {
    const interview = await db.collection("interviews").doc(id).get();

    return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const querySnapshot = await db
        .collection("feedback")
        .where("interviewId", "==", interviewId)
        .where("userId", "==", userId)
        .limit(1)
        .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
    params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection("interviews")
        .orderBy("createdAt", "desc")
        .where("finalized", "==", true)
        .where("userId", "!=", userId)
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}

export async function getInterviewsByUserId(
    userId: string
): Promise<Interview[] | null> {
    const interviews = await db
        .collection("interviews")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}