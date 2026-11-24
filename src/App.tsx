/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AdminPortal } from './components/AdminPortal';
import { StudentPortal } from './components/StudentPortal';
import { INITIAL_FOUND_ITEMS, STUDENT_SSO_USER } from './data/mockItems';
import { FoundItem, PortalMode } from './types/campusMatch';

export default function App() {
  const [portalMode, setPortalMode] = useState<PortalMode>('student');
  const [items, setItems] = useState<FoundItem[]>(INITIAL_FOUND_ITEMS);

  const handleSubmitClaim = (itemId: string, proofAnswer: string): string => {
    const claimRef = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowLabel = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'pending',
              claim: {
                claimantName: STUDENT_SSO_USER.name,
                claimantEmail: STUDENT_SSO_USER.email,
                submittedAt: `Today, ${nowLabel}`,
                proofAnswer,
                claimRef,
              },
            }
          : item,
      ),
    );

    return claimRef;
  };

  const handleAddFoundItem = (
    newItem: Omit<FoundItem, 'id' | 'foundRelativeTime' | 'status'>,
  ) => {
    const nextId = `CM-${1043 + items.length}`;
    const created: FoundItem = {
      ...newItem,
      id: nextId,
      foundRelativeTime: 'Found just now',
      status: 'found',
    };
    setItems((prev) => [created, ...prev]);
  };

  const handleApproveReturn = (itemId: string, studentIdNumber: string) => {
    const nowLabel = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'returned',
              custodyLog: {
                studentIdNumber,
                returnedAt: `Today, ${nowLabel}`,
                approvedBy: 'Officer M. Rivera',
              },
            }
          : item,
      ),
    );
  };

  const handleRejectClaim = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: 'found',
              claim: undefined,
            }
          : item,
      ),
    );
  };

  if (portalMode === 'admin') {
    return (
      <AdminPortal
        items={items}
        onAddFoundItem={handleAddFoundItem}
        onApproveReturn={handleApproveReturn}
        onRejectClaim={handleRejectClaim}
        onSwitchToStudent={() => setPortalMode('student')}
      />
    );
  }

  return (
    <StudentPortal
      items={items}
      onSubmitClaim={handleSubmitClaim}
      onSwitchToAdmin={() => setPortalMode('admin')}
    />
  );
}
