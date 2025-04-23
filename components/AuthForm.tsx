"use client"


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {Form} from "@/components/ui/form"
import FormField from "@/components/FormField"
import  Image  from "next/image"
import Link from "next/link";
import {toast} from "sonner";
import {useRouter} from "next/navigation"
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "@/firebase/client"
import {signUp,signIn} from "@/lib/actions/auth.action"



const authFormShema = (type:FormType) =>{
    return z.object({
        name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3).max(50),
    })
}

const AuthForm = ({type}:{type:FormType}) => {
    const formSchema = authFormShema(type)

    const router = useRouter();


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password : "",
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try{
            if(type === "sign-up"){
                const {name, email, password} = values;

                const userCredential = await createUserWithEmailAndPassword(auth, email, password)

                const res = await signUp({
                    uid: userCredential.user.uid,
                    name: name!,
                    email,
                    password
                })

                if(!res.success){
                    toast.error(res.message)
                    return
                }

                toast.success("Sign In Successful")
                router.push("/sign-in")
            }else{
                const {email, password} = values;

                const userCredential = await signInWithEmailAndPassword(auth, email, password);

                const idToken = await userCredential.user.getIdToken();

                if(!idToken){
                    toast.error("Invalid Credentials");
                    return;
                }

                await signIn({
                    email,idToken
                })



                toast.success("Account Signed In Successfully")
                router.push("/")
            }
        }catch (error){
            console.log(error)
            toast.error(`There was an error : ${error}`)
        }
    }

    const IsSignIn = type === "sign-in"

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image src="/logo.svg" alt="logo" height={32} width={38}/>
                    <h2 className="text-primary-100"> Train </h2>
                </div>
                <h3>Practice job interviews</h3>
                <Form {...form} >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        { !IsSignIn &&
                            (
                                <FormField
                                    control={form.control}
                                    name="name"
                                    label="Name"
                                    placeholder="Your Name" />
                            )

                        }
                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your Email"
                            type="email"
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            type="password"
                            placeholder="Your Password" />

                        <Button type="submit" className="btn">{IsSignIn ? "Sign In" : "Create an Account"}</Button>
                    </form>
                </Form>

                <p className="text-center"> {IsSignIn ? "No Account Yet?" : "Have an Account already?"}
                    <Link href={!IsSignIn ?  "/sign-in" : "/sign-up"} className="font-bold text-user-primary ml-1">
                        {!IsSignIn ? "Sign In" : "Sign Up"}
                    </Link>
                </p>
            </div>


        </div>
    )
}
export default AuthForm
