"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleReCaptchaProvider, GoogleReCaptcha } from "react-google-recaptcha-v3";
import type { NextPage } from "next";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Message {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

const Contact: NextPage = () => {
    const [token, setToken] = useState<string | null>(null);
    const [refreshReCaptcha, setRefreshReCaptcha] = useState(false);
    const [refreshCount, setRefreshCount] = useState(0);


    const message: Message = {
        name: "",
        email: "",
        phone: "",
        message: "",
    };

    const formSchema = z.object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        phone: z.string().optional().or(z.literal("")),
        message: z.string().min(10).max(500),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: useMemo(() => {
            return message;
        }, [message]) as z.infer<typeof formSchema>,
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...data, token }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Your message has been sent successfully.");
                form.reset();
                setRefreshReCaptcha(true); // Refresh reCAPTCHA after successful submission
            } else {
                alert("Failed to send your message. Please try again.");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
    };

    const handleVerify = useCallback((token: string) => {
        setToken(token);
        setRefreshReCaptcha(false);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshCount((prevCount) => {
                if (prevCount >= 5) {
                    clearInterval(interval);
                    return prevCount;
                }
                setRefreshReCaptcha(true);
                return prevCount + 1;
            });
        }, 2 * 60 * 1000); // Refresh token every 2 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}>
            <main className="flex flex-col items-center mt-10 gap-3">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your public display name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="Your Email" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your email address.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Phone" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your phone number. You can provide it if you would like us to call you back.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Your Message" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Please provide a detailed message.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={!token}>
                            Submit Form
                        </Button>
                    </form>
                </Form>
                <GoogleReCaptcha
                    action={"contact"}
                    onVerify={handleVerify}
                    refreshReCaptcha={refreshReCaptcha}
                />
            </main>
        </GoogleReCaptchaProvider>
    );
};

export default Contact;