import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


import {
    getFeedbackByInterviewId,
    getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async ({ params }: RouteParams) => {
    const { id } = await params;
    const user = await getCurrentUser();

    const [interview, feedback] = await Promise.all([
        getInterviewById(id),
        getFeedbackByInterviewId({ interviewId: id, userId: user?.id! })
    ]);

    // Extract questions and answers from transcript
    const qaPairs: { question: string; answer: string }[] = [];
    let currentQuestion = '';

    feedback?.transcript?.forEach((item) => {
        if (item.role === 'interviewer') {
            // Only update question if it's a new question (not a continuation)
            if (!item.content.startsWith('...')) { // Adjust this condition as needed
                currentQuestion = item.content;
            } else {
                currentQuestion += ' ' + item.content;
            }
        } else if (item.role === 'candidate' && currentQuestion) {
            // Check if this is a new answer or continuation
            const lastPair = qaPairs[qaPairs.length - 1];
            if (lastPair && lastPair.question === currentQuestion) {
                // Continue existing answer
                lastPair.answer += ' ' + item.content;
            } else {
                // New QA pair
                qaPairs.push({
                    question: currentQuestion,
                    answer: item.content
                });
            }
        }
    });

    console.log("QA Pairs:", feedback?.transcript);
    console.log("Full Feedback Object:", feedback);
    console.log("Transcript:", feedback?.transcript);
    console.log("Questions:", feedback?.questions);
    if (!interview) redirect('/');

    return (
        <section className="section-feedback">
            <div className="flex flex-row justify-center">
                <h1 className="text-4xl font-semibold">
                    Feedback on the Interview -{" "}
                    <span className="capitalize">{interview.role}</span> Interview
                </h1>
            </div>

            <div className="flex flex-row justify-center">
                <div className="flex flex-row gap-5">
                    <div className="flex flex-row gap-2 items-center">
                        <Image src="/star.svg" width={22} height={22} alt="star" />
                        <p>
                            Overall Impression:{" "}
                            <span className="text-primary-200 font-bold">
                {feedback?.totalScore}
              </span>
                            /100
                        </p>
                    </div>

                    <div className="flex flex-row gap-2">
                        <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
                        <p>
                            {feedback?.createdAt
                                ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </div>

            <hr />

            <p>{feedback?.finalAssessment}</p>

            <div className="flex flex-col gap-4">
                <h2>Breakdown of the Interview:</h2>
                {feedback?.categoryScores?.map((category, index) => (
                    <div key={index}>
                        <p className="font-bold">
                            {index + 1}. {category.name} ({category.score}/100)
                        </p>
                        <p>{category.comment}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <h3>Strengths</h3>
                <ul>
                    {feedback?.strengths?.map((strength, index) => (
                        <li key={index}>{strength}</li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-3">
                <h3>Areas for Improvement</h3>
                <ul>
                    {feedback?.areasForImprovement?.map((area, index) => (
                        <li key={index}>{area}</li>
                    ))}
                </ul>
            </div>

            <div className="buttons">
                <Button className="btn-secondary flex-1">
                    <Link href="/" className="flex w-full justify-center">
                        <p className="text-sm font-semibold text-primary-200 text-center">
                            Back to dashboard
                        </p>
                    </Link>
                </Button>

                <Button className="btn-primary flex-1">
                    <Link
                        href={`/interview/${id}`}
                        className="flex w-full justify-center"
                    >
                        <p className="text-sm font-semibold text-black text-center">
                            Retake Interview
                        </p>
                    </Link>
                </Button>
            </div>



<h1>continue</h1>
            {/* new */}
            <Tabs defaultValue="detailed" className="w-full">
                <TabsContent value="detailed" className="space-y-4">
                    {qaPairs.map((pair, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>Question {index + 1}</CardTitle>
                                <CardDescription>{pair.question}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-1">Your Actual Response</h4>
                                    <p className="text-sm text-muted-foreground">{pair.answer}</p>
                                </div>

                                {/* Still show AI-generated feedback if available */}
                                {feedback?.questions?.[index] && (
                                    <>
                                        <div>
                                            <h4 className="font-medium mb-1">Feedback</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {feedback.questions[index].feedback}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1 p-3 bg-green-50 rounded-md">
                                                <h4 className="text-sm font-medium mb-1">Strengths</h4>
                                                <ul className="text-xs space-y-1 list-disc list-inside">
                                                    {feedback.questions[index].strengths.map((s, i) => (
                                                        <li key={i}>{s}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="flex-1 p-3 bg-yellow-50 rounded-md">
                                                <h4 className="text-sm font-medium mb-1">Areas to Improve</h4>
                                                <ul className="text-xs space-y-1 list-disc list-inside">
                                                    {feedback.questions[index].areasToImprove.map((a, i) => (
                                                        <li key={i}>{a}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
                <h3>test</h3>
                {/* Full Transcript Tab */}
                <TabsContent value="transcript">
                    <Card>
                        <CardHeader>
                            <CardTitle>Full Conversation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {feedback?.transcript?.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg ${
                                            item.role === 'interviewer'
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : 'bg-gray-50 dark:bg-gray-800'
                                        }`}
                                    >
                                        <p className="font-medium">
                                            {item.role === 'interviewer' ? 'Interviewer' : 'You'}:
                                        </p>
                                        <p className="mt-1">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
<h2>Alloha</h2>
        </section>
    )
}
export default Page