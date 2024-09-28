// app/pricing/PricingClient.tsx

"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Check, CircleAlert, HelpCircle, Minus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLANS } from "../helpers/stripe"; // Ensure this path is correct
import { cn } from "../helpers/utils"; // Ensure this utility function exists

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface User {
  id: string;
  role: string;
}

const PricingClient = ({ user }: { user: User | null }) => {
  const router = useRouter();
  const [loadingPlans, setLoadingPlans] = useState<Record<string, boolean>>({});

  // Define allowed plans for each role using the exact slugs from your PLANS array
  const ALLOWED_PLANS: Record<string, string[]> = {
    USER: ["comprehensive insights"],
    FACILITY: ["health tracker"],
    // Add other roles and their allowed plans as needed
  };

  const handleCheckout = async (plan: string, priceId: string) => {
    setLoadingPlans((prev) => ({ ...prev, [plan]: true }));
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      if (response.status === 401 || response.status === 403) {
        // Handle unauthorized access
        alert("You are not authorized to perform this action.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Stripe Checkout Error:", error);
      }
    } catch (error) {
      console.error("Checkout Error:", error);
    } finally {
      setLoadingPlans((prev) => ({ ...prev, [plan]: false }));
    }
  };

  const pricingItems = [
    {
      plan: "Basic Snapshot",
      tagline: "Customized Health Summary - Free of cost",
      quota: "Customized Health Summary, Tailored to you",
      features: [
        {
          text: "Upload your lab results",
          footnote:
            "Quickly upload your lab result in JPEG or PDF format to receive a customized health summary.",
        },
        {
          text: "Access to your Health Report",
          footnote:
            "Upgrade to view the comprehensive analysis of your lab results",
        },
        {
          text: "Optimal Ranges",
          footnote: "Upgrade to see the optimal ranges for your lab biomarkers",
        },
        {
          text: "Actionable Interpretations",
          footnote:
            "Upgrade to receive actionable interpretations of your results",
        },
        {
          text: "Recommendations",
          footnote:
            "Upgrade to receive Basic diet, supplement, and lifestyle recommendations",
        },
      ],
    },
    {
      plan: "Comprehensive Insights",
      tagline: "Detailed analysis of your lab results",
      quota: "Take control of your health with detailed lab report insights",
      features: [
        {
          text: "Upload your lab results",
          footnote: "One-time upload of your lab result via JPG images or PDFs",
        },
        {
          text: "Results Access",
          footnote:
            "Full access to a comprehensive report with easy-to-understand descriptions of the referenced data within your lab result",
        },
        {
          text: "Optimal Ranges",
          footnote: "See the optimal ranges for your lab biomarkers",
        },
        {
          text: "Actionable Interpretations",
          footnote: "Receive actionable interpretations of your results",
        },
        {
          text: "Recommendations",
          footnote: "Detailed diet, supplement, and lifestyle recommendations",
        },
        {
          text: "Digital Sharing",
          footnote:
            "Seamlessly share your results with your doctor via a simple click",
        },
      ],
    },
    {
      plan: "Health Tracker",
      tagline: "Created especially for Medical practitioners",
      quota: "Enhance your practice with in-depth lab report analyses",
      features: [
        {
          text: "Upload your patient lab results",
          footnote: "Process up to 50 of your patients' lab reports per month",
        },
        {
          text: "Results Access",
          footnote:
            "Full access to comprehensive reports for each upload with easy-to-understand descriptions of your patient lab tests",
        },
        {
          text: "Improved Efficiency",
          footnote:
            "Save time while improving patient outcomes, satisfaction, and loyalty",
        },
        {
          text: "Enhanced Care",
          footnote:
            "Provide your patients with the comprehensive care they deserve.",
        },
        {
          text: "Leading-Edge Technology",
          footnote: "Stay ahead with detailed insights into each lab result",
        },
        {
          text: "Digital Sharing",
          footnote:
            "Seamlessly share the Comprehensive Health Report with patients via a simple click",
        },
        {
          text: "Customer Support",
          footnote:
            "Priority customer service and technical support during standard business hours",
        },
      ],
    },
    {
      plan: "Unlimited Wellness",
      tagline:
        "Enterprise solution created especially for Labs, Hospitals, and Medical Centres",
      quota: "Empower your patients with enhanced lab report analyses",
      features: [
        {
          text: "Upload your patient lab results",
          footnote:
            "Process your patients’ lab reports per month – unlimited uploads included",
        },
        {
          text: "Results Access",
          footnote:
            "Full access to comprehensive reports for each upload with easy-to-understand descriptions of your patient’s lab tests",
        },
        {
          text: "Improved Efficiency",
          footnote:
            "Save time while improving patient outcomes, satisfaction, and loyalty",
        },
        {
          text: "Enhanced Care",
          footnote: "Offer more than just results - offer insights.",
        },
        {
          text: "Leading-Edge Technology",
          footnote: "Stand out with advanced health analysis services",
        },
        {
          text: "Digital Sharing",
          footnote:
            "Seamlessly share the Comprehensive Health Report with patients via a simple click",
        },
        {
          text: "Customer Support",
          footnote: "Priority 24/7 customer service and technical support.",
        },
      ],
    },
  ];

  return (
    <div className="pt-12 px-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10 2xl:grid-cols-4 max-w-[2500px]">
      <TooltipProvider>
        {pricingItems.map(({ plan, tagline, quota, features }) => {
          const matchedPlan = PLANS.find(
            (p) => p.name.toLowerCase() === plan.toLowerCase()
          );
          const price = matchedPlan?.price.amount;
          const priceId = matchedPlan?.price.priceId;
          const isLoading = loadingPlans[plan] || false;

          // Use the plan slug as defined in your PLANS array
          const planSlug = plan.toLowerCase();

          // Determine if the user is allowed to subscribe to this plan
          const isPlanAllowed =
            user && ALLOWED_PLANS[user.role]?.includes(planSlug);

          return (
            <div
              key={plan}
              className={cn(
                "relative rounded-2xl bg-white shadow-lg flex flex-col justify-between",
                {
                  "border border-gray-200 shadow-blue-200":
                    plan === "Comprehensive Insights" ||
                    plan === "Health Tracker",
                  "border border-gray-200":
                    plan !== "Comprehensive Insights" &&
                    plan !== "Health Tracker",
                }
              )}
            >
              {/* {(plan === "Comprehensive Insights" || plan === "Health Tracker") && (
                <div className="absolute flex items-center justify-center -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white">
                  Upgrade now
                </div>
              )} */}
              <div className="p-5">
                <h3 className="my-3 text-center font-display text-2xl font-bold">
                  {plan}
                </h3>
                <p className="text-gray-500 text-center text-sm">{tagline}</p>
                <p className="my-5 font-display text-6xl font-semibold text-center">
                  {plan !== "Unlimited Wellness" && (
                    <span className="text-4xl font-bold">${price || 0}</span>
                  )}
                </p>

                {/* Conditional text based on plan type */}
                {plan === "Health Tracker" && (
                  <p className="text-gray-500 text-center text-sm">Per month</p>
                )}

                {plan === "Comprehensive Insights" && (
                  <p className="text-gray-500 text-center text-sm">
                    (one-time payment only)
                  </p>
                )}

                {plan === "Unlimited Wellness" && (
                  <p className="text-gray-500 items-center flex flex-col text-center text-sm">
                    Book a 1:1 LIVE Demo with our team via Calendly
                    <Link
                      href={
                        user?.role === "FACILITY"
                          ? "https://calendly.com/firstresponders/clariti-live-demo"
                          : ""
                      }
                      className="text-white mt-4  bg-black border text-center border-black text-lg px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-white hover:text-black transition"
                    >
                      Calendly
                    </Link>
                  </p>
                )}
              </div>

              <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-1 px-4 text-center">
                  <p className="text-sm">{quota?.toLocaleString()}</p>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger className="cursor-default ml-1.5">
                      <CircleAlert className="h-4 w-4 text-zinc-500" />
                    </TooltipTrigger>
                    <TooltipContent className="w-80 p-2">
                      How many PDFs you can upload per month.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <ul className="my-10 space-y-5 px-8">
                {features.map(({ text, footnote, negative }) => (
                  <li key={text} className="flex space-x-5">
                    <div className="flex-shrink-0">
                      {negative ? (
                        <Minus className="h-6 w-6 text-gray-300" />
                      ) : (
                        <Check className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    {footnote ? (
                      <div className="flex items-center justify-between w-full space-x-1">
                        <p
                          className={cn("text-gray-600", {
                            "text-gray-400": negative,
                          })}
                        >
                          {text}
                        </p>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger className="cursor-default ml-1.5">
                            <CircleAlert className="h-4 w-4 text-zinc-500" />
                          </TooltipTrigger>
                          <TooltipContent className="w-80 p-2">
                            {footnote}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ) : (
                      <p
                        className={cn("text-gray-600", {
                          "text-gray-400": negative,
                        })}
                      >
                        {text}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200" />
              <div className="p-5">
                {plan === "Basic Snapshot" ? (
                  <Link
                    href={
                      user?.role === "FACILITY"
                        ? "/facility/dashboard"
                        : "/dashboard"
                    }
                    className="text-white bg-black border border-black text-lg px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-white hover:text-black transition"
                  >
                    {user ? "Go to Dashboard" : "Login"}
                  </Link>
                ) : plan === "Unlimited Wellness" ? null : (
                  <button
                    onClick={() => {
                      if (!user) {
                        router.push("/login");
                        return;
                      }
                      if (!priceId) {
                        console.error(`Price ID not found for plan: ${plan}`);
                        return;
                      }
                      if (!isPlanAllowed) {
                        alert(
                          "You are not authorized to subscribe to this plan. Sign up as a Facility user to subscribe to this plan"
                        );
                        return;
                      }
                      handleCheckout(plan, priceId);
                    }}
                    disabled={isLoading}
                    className={cn(
                      "text-white bg-black border border-black text-lg px-4 md:px-6 py-2 font-semibold rounded-lg transition disabled:bg-gray-400",
                      {
                        "hover:bg-white hover:text-black": isPlanAllowed,
                        "cursor-not-allowed": !isPlanAllowed,
                      }
                    )}
                  >
                    {isLoading
                      ? "Processing..."
                      : user
                      ? isPlanAllowed
                        ? "Upgrade now"
                        : "Not Available"
                      : "Sign up"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </TooltipProvider>
    </div>
  );
};

export default PricingClient;
