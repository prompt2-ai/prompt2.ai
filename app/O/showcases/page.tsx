'use client';
import React, { useState, useEffect } from 'react';
import type { Workflow, Workflows } from '@/types/workflow';

export default function Page() {
    const [workflows, setWorkflows] = useState([] as Workflows);
    return (
        <div>
            <h1>TODO Showcases, a list with workflows with pagination and search</h1>
        </div>
    );
}