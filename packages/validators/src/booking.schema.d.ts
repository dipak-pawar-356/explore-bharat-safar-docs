import { z } from 'zod';
export declare const ReserveSlotSchema: z.ZodObject<{
    batchId: z.ZodString;
    slots: z.ZodNumber;
    participantNames: z.ZodArray<z.ZodString, "many">;
    emergencyContact: z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
    }, {
        name: string;
        phone: string;
    }>;
}, "strip", z.ZodTypeAny, {
    batchId: string;
    slots: number;
    participantNames: string[];
    emergencyContact: {
        name: string;
        phone: string;
    };
}, {
    batchId: string;
    slots: number;
    participantNames: string[];
    emergencyContact: {
        name: string;
        phone: string;
    };
}>;
export type ReserveSlotInput = z.infer<typeof ReserveSlotSchema>;
export declare const CheckoutPaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    idempotencyKey: z.ZodString;
    paymentMethod: z.ZodEnum<["UPI", "NETBANKING", "CARD"]>;
    amountPaise: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    idempotencyKey: string;
    paymentMethod: "UPI" | "NETBANKING" | "CARD";
    amountPaise: number;
}, {
    orderId: string;
    idempotencyKey: string;
    paymentMethod: "UPI" | "NETBANKING" | "CARD";
    amountPaise: number;
}>;
export type CheckoutPaymentInput = z.infer<typeof CheckoutPaymentSchema>;
//# sourceMappingURL=booking.schema.d.ts.map