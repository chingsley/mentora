import "server-only";

export interface ChargeInput {
  /** Smallest currency unit. */
  amount: number;
  currency: string;
  customerEmail: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface ChargeResult {
  id: string;
  status: "pending" | "succeeded" | "failed";
  providerReference?: string;
}

export interface PaymentProvider {
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(chargeId: string): Promise<{ id: string; status: "succeeded" | "failed" }>;
}

/** No-op payment provider. Returns success locally without touching external APIs. */
export class NoopPaymentProvider implements PaymentProvider {
  async charge(input: ChargeInput): Promise<ChargeResult> {
    return {
      id: `noop-charge-${Date.now()}`,
      status: "succeeded",
      providerReference: `noop-ref-${input.customerEmail}`,
    };
  }

  async refund(chargeId: string) {
    return { id: chargeId, status: "succeeded" as const };
  }
}

export const paymentProvider: PaymentProvider = new NoopPaymentProvider();
