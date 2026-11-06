/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { WorkflowBreadcrumbBar } from './components/WorkflowBreadcrumbBar';

// Sequential Workflow Views
import { AuthView } from './views/workflow/AuthView';
import { RoomSelectView } from './views/workflow/RoomSelectView';
import { RoomLobbyView } from './views/workflow/RoomLobbyView';
import { TeamSelectionView } from './views/workflow/TeamSelectionView';
import { HostWaitingDashboard } from './views/workflow/HostWaitingDashboard';
import { RetentionDashboardView } from './views/workflow/RetentionDashboardView';
import { RetentionConfirmationView } from './views/workflow/RetentionConfirmationView';
import { AuctionReadyView } from './views/workflow/AuctionReadyView';
import { LiveAuctionView } from './views/LiveAuctionView';
import { AuctionResultsView } from './views/workflow/AuctionResultsView';

// Reference & Squad Tabs
import { DashboardView } from './views/DashboardView';
import { TeamsView } from './views/TeamsView';
import { PlayersView } from './views/PlayersView';
import { RetentionReleaseView } from './views/RetentionReleaseView';
import { TradeCentreView } from './views/TradeCentreView';
import { RoomsView } from './views/RoomsView';
import { AuctionHistoryView } from './views/AuctionHistoryView';
import { SettingsView } from './views/SettingsView';

// Global Modals
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { SoldCelebrationModal } from './components/SoldCelebrationModal';
import { GmailReportModal } from './components/GmailReportModal';
import { ArrowRight, Sparkles } from 'lucide-react';

function AppContent() {
  const {
    workflowStep,
    setWorkflowStep,
    currentTab,
    setCurrentTab,
    startRetentionPhase,
    finalizeAllRetentions,
    startLiveMegaAuction,
    isGmailModalOpen,
    setIsGmailModalOpen,
  } = useAuction();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // STEP 1: Strict Login & Authentication Guard
  if (workflowStep === 'LOGIN') {
    return <AuthView />;
  }

  // Render the current sequential workflow stage
  const renderWorkflowStage = () => {
    switch (workflowStep) {
      case 'ROOM_SELECT':
        return <RoomSelectView />;
      case 'ROOM_LOBBY':
        return (
          <RoomLobbyView
            onNavigateToTeamSelect={() => setWorkflowStep('TEAM_SELECTION')}
          />
        );
      case 'TEAM_SELECTION':
        return (
          <TeamSelectionView
            onComplete={() => setWorkflowStep('ROOM_LOBBY')}
            onNext={() => setWorkflowStep('READY_CHECK')}
          />
        );
      case 'READY_CHECK':
        return (
          <HostWaitingDashboard
            onLaunchRetention={startRetentionPhase}
          />
        );
      case 'RETENTION_DASHBOARD':
        return (
          <RetentionDashboardView
            onProceedToConfirm={() => setWorkflowStep('RETENTION_CONFIRMATION')}
          />
        );
      case 'RETENTION_CONFIRMATION':
        return (
          <RetentionConfirmationView
            onFinalize={finalizeAllRetentions}
          />
        );
      case 'AUCTION_READY':
        return (
          <AuctionReadyView
            onStartLiveAuction={startLiveMegaAuction}
          />
        );
      case 'LIVE_AUCTION':
        return <LiveAuctionView />;
      case 'AUCTION_RESULTS':
        return <AuctionResultsView />;
      default:
        return <RoomLobbyView onNavigateToTeamSelect={() => setWorkflowStep('TEAM_SELECTION')} />;
    }
  };

  const isBrowsingReferenceTab =
    currentTab !== 'auction' &&
    currentTab !== 'landing';

  return (
    <div className="min-h-screen bg-[#F4F6FB] dark:bg-[#090D1B] text-[#0C1222] dark:text-[#F5F4FF] flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Sequential 10-Step Progress Breadcrumb Bar */}
      <WorkflowBreadcrumbBar />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Responsive Sidebar for Quick Reference (Franchises, Pool, History) */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* If inspecting an auxiliary reference tab, show quick-return banner */}
          {isBrowsingReferenceTab && (
            <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#11182B] border border-[#CBD5E1] dark:border-[#202944] shadow-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-[#4A5568] dark:text-[#A5A9C3]">
                <Sparkles className="w-4 h-4 text-[#E8BD68] shrink-0" />
                <span>
                  Viewing Reference Tab (<strong className="text-[#0C1222] dark:text-[#F5F4FF] capitalize">{currentTab}</strong>). The Mega Auction war room is running live.
                </span>
              </div>
              <button
                onClick={() => setCurrentTab('auction')}
                className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] dark:bg-[#A78BFA] hover:bg-[#6D28D9] dark:hover:bg-[#9065F7] text-white dark:text-[#090D1B] text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
              >
                <span>Return to Auction Phase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Reference Tabs vs Active Workflow Stage */}
          {currentTab === 'dashboard' ? (
            <DashboardView />
          ) : currentTab === 'teams' ? (
            <TeamsView />
          ) : currentTab === 'players' ? (
            <PlayersView />
          ) : currentTab === 'retention' ? (
            <RetentionReleaseView />
          ) : currentTab === 'trade' ? (
            <TradeCentreView />
          ) : currentTab === 'rooms' ? (
            <RoomsView />
          ) : currentTab === 'history' ? (
            <AuctionHistoryView />
          ) : currentTab === 'settings' ? (
            <SettingsView />
          ) : (
            renderWorkflowStage()
          )}
        </main>
      </div>

      {/* Global Modals */}
      <PlayerDetailModal />
      <SoldCelebrationModal />
      <GmailReportModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuctionProvider>
      <AppContent />
    </AuctionProvider>
  );
}
