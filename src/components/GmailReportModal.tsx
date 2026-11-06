/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import {
  sendEmailViaGmail,
  createDraftViaGmail,
  buildAuctionResultsReportHtml,
  hasGmailAccessToken,
} from '../lib/gmail';
import { requestGmailAuthorization } from '../lib/firebase';
import {
  Mail,
  Send,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface GmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
}

export const GmailReportModal: React.FC<GmailReportModalProps> = ({
  isOpen,
  onClose,
  defaultRecipient = '',
}) => {
  const { activeRoom, teams, players, user } = useAuction();

  const [recipient, setRecipient] = useState<string>(
    defaultRecipient || user.email || ''
  );
  const [subjectOverride, setSubjectOverride] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Mandatory user confirmation step before mutating user email data
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<'send' | 'draft' | null>(null);

  if (!isOpen || !activeRoom) return null;

  const report = buildAuctionResultsReportHtml({
    room: activeRoom,
    teams,
    players,
    recipientName: user.name,
  });

  const finalSubject = subjectOverride.trim() || report.subject;
  const isAuthorized = hasGmailAccessToken();

  const handleInitiateAction = (action: 'send' | 'draft') => {
    if (!recipient.trim() || !recipient.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid recipient email address.' });
      return;
    }
    setPendingAction(action);
    setIsConfirmDialogOpen(true);
  };

  const handleExecuteConfirmedAction = async () => {
    setIsConfirmDialogOpen(false);
    if (!pendingAction) return;

    if (pendingAction === 'send') {
      setIsSending(true);
      setStatusMessage(null);
      const res = await sendEmailViaGmail({
        to: recipient.trim(),
        subject: finalSubject,
        htmlBody: report.html,
        textBody: report.text,
      });
      setIsSending(false);

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Auction ledger dispatched successfully via Gmail! (Message ID: ${res.messageId})`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to send email via Gmail.',
        });
      }
    } else if (pendingAction === 'draft') {
      setIsDrafting(true);
      setStatusMessage(null);
      const res = await createDraftViaGmail({
        to: recipient.trim(),
        subject: finalSubject,
        htmlBody: report.html,
        textBody: report.text,
      });
      setIsDrafting(false);

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Draft saved directly to your Gmail mailbox! (Draft ID: ${res.draftId})`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to create Gmail draft.',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 text-[#F5F4FF]">
      <div className="relative w-full max-w-2xl bg-[#090D1B] border border-[#202944] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#202944] flex items-center justify-between bg-gradient-to-r from-[#171D35] via-[#202944] to-[#171D35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5C75]/15 border border-[#FF5C75]/30 flex items-center justify-center text-[#FF5C75]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#F5F4FF] font-heading flex items-center gap-2">
                <span>Dispatch Auction Ledger via Gmail</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF5C75]/20 text-[#FF5C75] border border-[#FF5C75]/30 uppercase">
                  Google Workspace
                </span>
              </h3>
              <p className="text-xs text-[#A5A9C3]">
                Send official certified IPL 2027 auction reports directly from your connected Gmail.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A5A9C3] hover:text-[#F5F4FF] rounded-xl hover:bg-[#202944] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Auth Status Notification */}
          {!isAuthorized ? (
            <div className="p-4 rounded-2xl bg-[#FFB84D]/10 border border-[#FFB84D]/30 flex items-start justify-between gap-3 shadow-md">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#FFB84D] shrink-0 mt-0.5" />
                <div className="text-xs text-[#F5F4FF] space-y-1">
                  <span className="font-bold text-[#FFB84D] block">
                    Gmail Authorization Required
                  </span>
                  <span className="text-[#A5A9C3]">
                    To send or draft emails directly through Google Workspace, sign in with Google to grant permission.
                  </span>
                </div>
              </div>
              <button
                onClick={async () => {
                  const res = await requestGmailAuthorization();
                  if (res.success) {
                    setStatusMessage({
                      type: 'success',
                      text: 'Gmail Workspace authorization granted successfully!',
                    });
                  } else {
                    setStatusMessage({
                      type: 'error',
                      text: res.error || 'Failed to authorize Gmail.',
                    });
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-white text-[#090D1B] font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <span>Authorize Gmail</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#20C997]/10 border border-[#20C997]/30 flex items-center gap-2.5 text-xs text-[#20C997]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Gmail Workspace connection active. Ready to send certified auction ledgers.</span>
            </div>
          )}

          {/* Form Inputs */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#A5A9C3] font-semibold mb-1.5">
                Recipient Email Address *
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="manager@franchise.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#11182B] border border-[#202944] text-[#F5F4FF] focus:outline-none focus:border-[#A78BFA] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[#A5A9C3] font-semibold mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={subjectOverride}
                onChange={(e) => setSubjectOverride(e.target.value)}
                placeholder={report.subject}
                className="w-full px-4 py-2.5 rounded-xl bg-[#11182B] border border-[#202944] text-[#F5F4FF] focus:outline-none focus:border-[#A78BFA] transition-colors"
              />
            </div>

            {/* Email Contents Preview Toggle */}
            <div className="border border-[#202944] rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setIsPreviewOpen((prev) => !prev)}
                className="w-full px-4 py-2.5 bg-[#171D35] text-[#A5A9C3] font-semibold flex items-center justify-between text-left hover:bg-[#202944] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#E8BD68]" />
                  <span className="text-[#F5F4FF]">Preview Generated Report Email</span>
                </span>
                <span className="text-[11px] text-[#A78BFA]">
                  {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
                </span>
              </button>

              {isPreviewOpen && (
                <div className="p-4 bg-[#090D1B] max-h-60 overflow-y-auto text-[#A5A9C3] text-[11px] font-mono leading-relaxed border-t border-[#202944]">
                  <pre className="whitespace-pre-wrap">{report.text}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-[#20C997]/15 border border-[#20C997]/40 text-[#20C997]'
                  : 'bg-[#FF5C75]/15 border border-[#FF5C75]/40 text-[#FF5C75]'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#11182B] border-t border-[#202944] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-[#A5A9C3]">
            Powered by Google Workspace Gmail REST API
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => handleInitiateAction('draft')}
              disabled={isDrafting || isSending || !isAuthorized}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#202944] hover:bg-[#202944]/80 disabled:opacity-50 text-[#F5F4FF] border border-[#202944] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isDrafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>Save as Draft</span>
            </button>

            <button
              onClick={() => handleInitiateAction('send')}
              disabled={isDrafting || isSending || !isAuthorized}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#FF5C75] hover:bg-[#e04860] disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-[#FF5C75]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send via Gmail</span>
            </button>
          </div>
        </div>

        {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE/MUTATING WORKSPACE ACTIONS */}
        {isConfirmDialogOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-md w-full bg-[#171D35] border border-[#FF5C75] rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FF5C75]/20 text-[#FF5C75] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-[#F5F4FF] font-heading">
                  Confirm Gmail {pendingAction === 'send' ? 'Dispatch' : 'Draft Creation'}
                </h4>
                <p className="text-xs text-[#A5A9C3] mt-2">
                  Are you sure you want to {pendingAction === 'send' ? 'send' : 'save a draft of'} the IPL Auction Arena report to <strong className="text-[#F5F4FF]">{recipient}</strong> with subject <strong className="text-[#E8BD68]">"{finalSubject}"</strong>?
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#202944] text-[#A5A9C3] hover:text-[#F5F4FF] font-bold text-xs border border-[#202944] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteConfirmedAction}
                  className="px-5 py-2.5 rounded-xl bg-[#FF5C75] text-white font-black text-xs hover:bg-[#e04860] shadow-lg shadow-[#FF5C75]/30 cursor-pointer"
                >
                  Yes, {pendingAction === 'send' ? 'Send Email' : 'Create Draft'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
