import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol = '₹'): string {
  return `${symbol}${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })}`;
}

export function formatDateTime(isoOrDateString?: string | Date): string {
  if (!isoOrDateString) return '-';
  const d = typeof isoOrDateString === 'string' ? new Date(isoOrDateString) : isoOrDateString;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateOnly(isoOrDateString?: string | Date): string {
  if (!isoOrDateString) return '-';
  const d = typeof isoOrDateString === 'string' ? new Date(isoOrDateString) : isoOrDateString;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeOnly(isoOrDateString?: string | Date): string {
  if (!isoOrDateString) return '-';
  const d = typeof isoOrDateString === 'string' ? new Date(isoOrDateString) : isoOrDateString;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Generate human-friendly sequential invoice numbers: KM-YYYYMMDD-XXXX
let lastSequence = 100;
export function generateInvoiceNumber(prefix = 'KM'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  lastSequence += 1;
  const seq = String(lastSequence % 10000).padStart(4, '0');
  return `${prefix}-${year}${month}${day}-${seq}`;
}

export function generateOrderNumber(prefix = 'ORD'): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}`;
}
