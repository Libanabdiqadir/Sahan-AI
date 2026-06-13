import { useState, useEffect } from "react";
import { subscriptionApi } from "../services/api";

export type SubscriptionStatus = {
  plan: string;
  limit: number;
  used: number;
  remaining: number;
  reset_date: string;
};

export function useSubscription(): SubscriptionStatus | null {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    subscriptionApi.getStatus().then(setSubscription).catch(() => {});
  }, []);

  return subscription;
}
