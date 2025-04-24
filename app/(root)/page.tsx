import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import InterviewCard  from "@/components/InterviewCard"
import { getCurrentUser } from '@/lib/actions/auth.action'
import { getInterviewsByUserId,getLatestInterviews } from '@/lib/actions/general.action'


const Page = async () => {
    const user =await getCurrentUser();

    const [userInterviews,latestInterviews ] = await Promise.all([
        getInterviewsByUserId(user?.id!),
        getLatestInterviews({ userId: user?.id! }),
    ])


    const hasPastInterviews =userInterviews && userInterviews?.length > 0;
    const hasUpcomingInterviews = latestInterviews && latestInterviews?.length > 0;

    return (
        <>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg ">
                    <h2>Get ready to pass your exams with studyBuddy AI</h2>
                    <p className="text-lg">
                        practice on real exam questions, get instant feedback, and improve your performance with personalized study plans.
                    </p>

                    <Button asChild className="btn-primary max-sm:w-full">
                        <Link href="/interview"  > Start an interview </Link>
                    </Button>

                </div>
                <Image src="/robot.png" alt="robo-dude" width={400} height={400} className="max-sm:hidden" />
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Your Exams</h2>

                <div className="interview-section">
                    {
                        hasPastInterviews ? userInterviews?.map((interview) => (
                            <InterviewCard {... interview} key={interview.id}  />
                            )) : (

                        <p>You haven&apos;t taken any exam yet</p>

                        )
                    }
                </div>

            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>

                <div className="interview-section">
                    {
                        hasUpcomingInterviews ? latestInterviews?.map((interview) => (
                            <InterviewCard {... interview} key={interview.id}  />
                        )) : (

                            <p>There are no new interviews available</p>

                        )
                    }
                </div>
            </section>
        </>
    )
}
export default Page
