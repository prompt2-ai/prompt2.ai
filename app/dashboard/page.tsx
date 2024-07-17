'use client';
import React, { useState } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Page() {
  const { data: session, status } = useSession();
    return (
        <div>
            have a left side bar with the following links:
            <ul>
                <li><Link href="/dashboard/bpmn">New Workflow</Link></li>
                <li>Settings</li>
            </ul>
            and a table to display the workflows created by the user with the following columns:
            image, name, description, date created, date modified, and actions
            
            <Table>
  <h1> Welcome to your dashboard, {session?.user?.name}!</h1>            
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
        </div>
    );
}

