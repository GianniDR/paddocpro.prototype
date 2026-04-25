import type { BaseEntity, Iso } from "./base";

export type InvoiceStatus = "draft" | "authorised" | "paid" | "voided";
export type FinancePaymentMethod = "stripe_card" | "gocardless_dd" | "bacs_manual" | "cash" | "cheque";

export interface InvoiceLine {
  description: string;
  quantity: number;
  unitPricePence: number;
  xeroItemCode: string;
  totalPence: number;
}

export interface Invoice extends BaseEntity {
  clientId: string;
  xeroInvoiceId: string;
  invoiceNumber: string;
  lines: InvoiceLine[];
  subtotalPence: number;
  vatPence: number;
  totalPence: number;
  paidAmountPence: number;
  issuedAt: Iso;
  dueAt: Iso;
  status: InvoiceStatus;
  xeroOnlineInvoiceUrl: string | null;
  idempotencyKey: string | null;
}

export interface Payment extends BaseEntity {
  invoiceId: string;
  xeroPaymentId: string;
  amountPence: number;
  paidAt: Iso;
  method: FinancePaymentMethod;
  reference: string | null;
}

export interface Charge extends BaseEntity {
  clientId: string;
  horseId: string | null;
  liveryAddOnId: string;
  description: string;
  quantity: number;
  unitPricePence: number;
  occurredAt: Iso;
  notes: string | null;
  invoiceId: string | null;
  xeroLineItemId: string | null;
  recordedById: string;
}

export interface CreditNote extends BaseEntity {
  clientId: string;
  xeroCreditNoteId: string;
  linkedInvoiceId: string | null;
  lines: InvoiceLine[];
  totalPence: number;
  reason: string;
  issuedAt: Iso;
  status: "draft" | "authorised" | "allocated";
}
