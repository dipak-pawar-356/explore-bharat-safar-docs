'use client';

// Explore Bharat Safar — Admin Audit Log Table Component
// Reference: EBS-DOC-13-ADMIN Section 1.1 (Complete Audit Accountability)

import * as React from 'react';
import type { AuditLogEntry } from '@ebs/types';
import { AuditOutcome } from '@ebs/types';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onFilter?: (key: string, value: string) => void;
}

function getOutcomeBadge(outcome: AuditOutcome) {
  switch (outcome) {
    case AuditOutcome.SUCCESS:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 uppercase">
          Success
        </span>
      );
    case AuditOutcome.FAILURE:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 uppercase">
          Failed
        </span>
      );
    case AuditOutcome.PARTIAL:
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 uppercase">
          Partial
        </span>
      );
    default:
      return null;
  }
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function AuditLogTable({
  logs,
  isLoading,
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  onFilter,
}: AuditLogTableProps) {
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array<null>(8)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing {logs.length} of {totalRecords.toLocaleString('en-IN')} audit entries
        </span>
        <span className="font-mono">
          Page {currentPage} / {totalPages}
        </span>
      </div>

      {/* Table */}
      {logs.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-600">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-sm font-medium">No audit log entries found</div>
          <div className="text-xs mt-1">Try adjusting your filter criteria</div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actor
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Outcome
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer transition-colors"
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    >
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                          {log.actorEmail}
                        </div>
                        <div className="text-slate-400 dark:text-slate-600">
                          {log.actorRoles.join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300">
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {log.resourceType}
                        </div>
                        {log.resourceLabel && (
                          <div className="text-slate-400 dark:text-slate-600 truncate max-w-[120px]">
                            {log.resourceLabel}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{getOutcomeBadge(log.outcome)}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-500">
                        {log.ipAddress ?? '—'}
                      </td>
                    </tr>
                    {expandedLogId === log.id && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800"
                        >
                          <div className="space-y-2">
                            {log.failureReason && (
                              <div className="text-red-600 dark:text-red-400 text-xs">
                                <span className="font-semibold">Failure Reason: </span>
                                {log.failureReason}
                              </div>
                            )}
                            {log.changes && (
                              <div className="grid grid-cols-2 gap-4">
                                {log.changes.before && (
                                  <div>
                                    <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                                      Before
                                    </div>
                                    <pre className="text-[10px] bg-red-50 dark:bg-red-950/20 p-2 rounded-lg overflow-x-auto text-red-800 dark:text-red-300">
                                      {JSON.stringify(log.changes.before, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.changes.after && (
                                  <div>
                                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                                      After
                                    </div>
                                    <pre className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg overflow-x-auto text-emerald-800 dark:text-emerald-300">
                                      {JSON.stringify(log.changes.after, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
                              Session: {log.sessionId ?? 'N/A'} • User Agent:{' '}
                              {log.userAgent ?? 'N/A'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
