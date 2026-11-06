/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAccessToken, auth } from './firebase';
import { IPLTeam, Player, AuctionRoom } from '../types/auction';
import { formatCrores } from '../data/iplData';

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet?: string;
}

/**
 * Creates a base64url encoded RFC 2822 email payload.
 */
function buildRawEmail(to: string, subject: string, htmlBody: string, textBody: string = ''): string {
  const boundary = `__IPL_ARENA_BOUNDARY_${Date.now()}__`;
  const senderEmail = auth?.currentUser?.email || 'auction-officer@ipl2027.bcci.tv';

  const parts = [
    `From: IPL Auction Arena 2027 <${senderEmail}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    textBody || 'IPL Auction Arena 2027 Dispatch - Please view in an HTML-compatible email reader.',
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ];

  const raw = parts.join('\r\n');
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Checks if the user is authenticated with a valid Gmail OAuth access token.
 */
export function hasGmailAccessToken(): boolean {
  return Boolean(getAccessToken());
}

/**
 * Sends an email on behalf of the user using the Gmail REST API.
 * MANDATORY: Call this only after explicit user confirmation in the UI.
 */
export async function sendEmailViaGmail(params: SendEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const token = getAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Gmail access token unavailable. Please sign in with Google to grant Gmail authorization.',
    };
  }

  try {
    const raw = buildRawEmail(params.to, params.subject, params.htmlBody, params.textBody);
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `Gmail API error HTTP ${response.status}`;
      return { success: false, error: errMsg };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to dispatch email via Gmail.' };
  }
}

/**
 * Creates an email draft in the user's Gmail mailbox.
 */
export async function createDraftViaGmail(params: SendEmailParams): Promise<{
  success: boolean;
  draftId?: string;
  error?: string;
}> {
  const token = getAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Gmail access token unavailable. Please sign in with Google.',
    };
  }

  try {
    const raw = buildRawEmail(params.to, params.subject, params.htmlBody, params.textBody);
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: { raw } }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error?.message || `Gmail API HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, draftId: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create Gmail draft.' };
  }
}

/**
 * Lists recent messages from the user's mailbox related to the auction.
 */
export async function listRecentGmailMessages(
  query: string = 'IPL Auction',
  maxResults: number = 5
): Promise<{ success: boolean; messages?: GmailMessageSummary[]; error?: string }> {
  const token = getAccessToken();
  if (!token) {
    return { success: false, error: 'Gmail access token unavailable.' };
  }

  try {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return { success: false, error: `Gmail API list returned HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, messages: data.messages || [] };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to list Gmail messages.' };
  }
}

/**
 * Generates an official, beautifully formatted HTML report of the IPL Mega Auction 2027.
 */
export function buildAuctionResultsReportHtml(params: {
  room: AuctionRoom;
  teams: IPLTeam[];
  players: Player[];
  recipientName?: string;
}): { subject: string; html: string; text: string } {
  const { room, teams, players, recipientName } = params;
  const soldPlayers = players.filter((p) => p.status === 'sold');
  const totalSpend = teams.reduce((sum, t) => sum + t.spentPurse, 0);

  // Top 5 highest buys
  const topBuys = [...soldPlayers]
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
    .slice(0, 5);

  const subject = `[IPL 2027 Official] Mega Auction Summary Report - War Room ${room.code}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080D1A; color: #F5F7FC; margin: 0; padding: 24px; }
    .card { background-color: #10192B; border: 1px solid #21304D; border-radius: 16px; padding: 24px; max-width: 680px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { border-bottom: 2px solid #F5B942; padding-bottom: 16px; margin-bottom: 20px; }
    .title { color: #F5B942; font-size: 24px; font-weight: 800; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px; }
    .subtitle { color: #94A3B8; font-size: 13px; margin: 0; }
    .stat-grid { display: flex; gap: 12px; margin: 20px 0; }
    .stat-box { flex: 1; background: #172338; border: 1px solid #2A3C5E; border-radius: 12px; padding: 12px; text-align: center; }
    .stat-val { font-size: 20px; font-weight: 800; color: #20C997; font-family: monospace; }
    .stat-label { font-size: 11px; text-transform: uppercase; color: #94A3B8; margin-top: 4px; }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #F5B942; margin: 24px 0 12px 0; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
    th { text-align: left; padding: 8px 10px; background: #172338; color: #94A3B8; border-bottom: 1px solid #21304D; }
    td { padding: 10px; border-bottom: 1px solid #1E2C44; color: #F5F7FC; }
    .price { font-family: monospace; font-weight: bold; color: #F5B942; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; background: #20C99722; color: #20C997; border: 1px solid #20C99744; }
    .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #21304D; font-size: 11px; color: #64748B; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">IPL Mega Auction Arena 2027</h1>
      <p class="subtitle">Official Auction Ledger & Roster Dispatch · War Room: <strong>${room.name}</strong> (${room.code})</p>
    </div>

    <p style="font-size: 13px; color: #CBD5E1; line-height: 1.5;">
      Hello ${recipientName || 'Franchise Representative'},<br/>
      The BCCI IPL 2027 Mega Auction proceedings for Room <strong>${room.code}</strong> have completed. Below is the certified summary of all player allocations, purse expenditures, and marquee contracts.
    </p>

    <!-- Headline Metrics -->
    <table style="width: 100%; border: none; margin: 16px 0;">
      <tr>
        <td style="background: #172338; border: 1px solid #2A3C5E; border-radius: 10px; padding: 12px; text-align: center; width: 33%;">
          <div class="stat-val">₹${totalSpend.toFixed(2)} Cr</div>
          <div class="stat-label">Total Spend (10 Teams)</div>
        </td>
        <td style="background: #172338; border: 1px solid #2A3C5E; border-radius: 10px; padding: 12px; text-align: center; width: 33%;">
          <div class="stat-val" style="color: #4388FF;">${soldPlayers.length}</div>
          <div class="stat-label">Players Sold</div>
        </td>
        <td style="background: #172338; border: 1px solid #2A3C5E; border-radius: 10px; padding: 12px; text-align: center; width: 33%;">
          <div class="stat-val" style="color: #F5B942;">10 / 10</div>
          <div class="stat-label">Franchises Formed</div>
        </td>
      </tr>
    </table>

    <!-- Top 5 Buys -->
    <div class="section-title">Top 5 Record Signings</div>
    <table>
      <thead>
        <tr>
          <th>Player</th>
          <th>Role</th>
          <th>Acquired By</th>
          <th style="text-align: right;">Contract Value</th>
        </tr>
      </thead>
      <tbody>
        ${topBuys
          .map(
            (p) => `
          <tr>
            <td><strong>${p.name}</strong> (${p.country})</td>
            <td>${p.role}</td>
            <td><span class="badge">${p.soldTo?.toUpperCase()}</span></td>
            <td style="text-align: right;" class="price">₹${(p.soldPrice || 0).toFixed(2)} Cr</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <!-- 10 Franchises Spend Table -->
    <div class="section-title">10 Franchise Financial Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Franchise</th>
          <th>Total Squad</th>
          <th>Spent Purse</th>
          <th style="text-align: right;">Remaining Purse</th>
        </tr>
      </thead>
      <tbody>
        ${teams
          .map((t) => {
            const teamPlayers = players.filter((p) => p.soldTo === t.id || t.retainedPlayers.includes(p.id));
            const remaining = Number((t.totalPurse - t.spentPurse).toFixed(2));
            return `
            <tr>
              <td><strong>${t.name}</strong> (${t.code})</td>
              <td>${teamPlayers.length} cricketers</td>
              <td class="price">₹${t.spentPurse.toFixed(2)} Cr</td>
              <td style="text-align: right; color: #20C997; font-family: monospace; font-weight: bold;">₹${remaining.toFixed(2)} Cr</td>
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>

    <div class="footer">
      Generated automatically by IPL AUCTION ARENA 2027 via Google Workspace Gmail Integration.<br/>
      Certified by the Board of Control for Cricket in India (BCCI) Simulation Desk.
    </div>
  </div>
</body>
</html>
`;

  const text = `
IPL MEGA AUCTION ARENA 2027 - OFFICIAL SUMMARY REPORT
Room: ${room.name} (${room.code})

Hello ${recipientName || 'Franchise Manager'},

The IPL Mega Auction 2027 has concluded.
- Total Tournament Spend: ₹${totalSpend.toFixed(2)} Cr
- Total Players Sold: ${soldPlayers.length}
- Total Franchises: 10

TOP BUYS:
${topBuys.map((p, i) => `${i + 1}. ${p.name} (${p.soldTo?.toUpperCase()}) - ₹${p.soldPrice?.toFixed(2)} Cr`).join('\n')}

FRANCHISE SQUADS:
${teams.map((t) => `${t.name} (${t.code}): Spent ₹${t.spentPurse.toFixed(2)} Cr | Remaining ₹${(t.totalPurse - t.spentPurse).toFixed(2)} Cr`).join('\n')}

Certified by BCCI IPL 2027 Simulation Platform.
`;

  return { subject, html, text };
}
