'use client';

import React from 'react';
import { PosMenuGrid } from '@/components/pos/PosMenuGrid';
import { PosCart } from '@/components/pos/PosCart';

export default function PosPage() {
  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-4">
      {/* Left Food Menu Grid */}
      <PosMenuGrid />

      {/* Right Billing Cart & Payment Settlement */}
      <PosCart />
    </div>
  );
}
