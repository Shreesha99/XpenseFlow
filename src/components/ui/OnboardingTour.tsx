import { useEffect, useMemo } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface OnboardingTourProps {
  activeView: string;
  setActiveView: (view: any) => void;
  run: boolean;
  setRun: (run: boolean) => void;
}

export default function OnboardingTour({ activeView, setActiveView, run, setRun }: OnboardingTourProps) {
  useEffect(() => {
    const tourKey = `hasSeenTour_${activeView}`;
    const hasSeenTour = localStorage.getItem(tourKey);
    if (!hasSeenTour) {
      setRun(true);
    }
  }, [activeView, setRun]);

  const allSteps: Record<string, Step[]> = useMemo(() => ({
    dashboard: [
      {
        target: 'body',
        content: 'Welcome to your Dashboard! This is your financial command center.',
        placement: 'center',
        title: 'Dashboard Overview 🚀',
      },
      {
        target: '#tour-balance',
        content: 'This is your real-time net worth across all connected bank accounts and wallets.',
        title: 'Total Liquidity',
        placement: 'bottom',
      },
      {
        target: '#tour-insights',
        content: 'Visualize your cash flow and spending patterns with these interactive charts.',
        title: 'Financial Insights',
        placement: 'top',
      },
      {
        target: '#tour-activity',
        content: 'Keep track of every rupee. Your latest transactions appear here for quick review.',
        title: 'Recent Activity',
        placement: 'top',
      },
      {
        target: '#tour-nav',
        content: 'Use the sidebar to navigate between different sections of the app.',
        title: 'Navigation',
        placement: 'right',
      },
    ],
    accounts: [
      {
        target: '#tour-banks-header',
        content: 'Manage all your bank accounts and digital wallets in one place.',
        title: 'Banks & Wallets 🏦',
        placement: 'bottom',
      },
      {
        target: '#tour-banks-refresh',
        content: 'Click here to sync your accounts and get the latest balances.',
        title: 'Sync Data',
        placement: 'bottom',
      },
      {
        target: '#tour-banks-transfer',
        content: 'Easily record transfers between your own accounts.',
        title: 'Internal Transfers',
        placement: 'bottom',
      },
      {
        target: '#tour-banks-grid',
        content: 'Your connected accounts are listed here. Click on any to see details.',
        title: 'Account List',
        placement: 'top',
      },
      {
        target: '#tour-banks-networth',
        content: 'Your absolute net worth, calculated from all your recorded financial history.',
        title: 'Net Worth Summary',
        placement: 'top',
      },
    ],
    transactions: [
      {
        target: '#tour-ledger-header',
        content: 'This is your full financial history. Every transaction is recorded here.',
        title: 'Financial Ledger 📜',
        placement: 'bottom',
      },
      {
        target: '#tour-ledger-filters',
        content: 'Filter your ledger to see only income or only expenses.',
        title: 'Quick Filters',
        placement: 'bottom',
      },
      {
        target: '#tour-ledger-table',
        content: 'Review, edit, or delete your transactions from this detailed table.',
        title: 'Transaction History',
        placement: 'top',
      },
    ],
    planning: [
      {
        target: '#tour-planning-view',
        content: 'Plan your future spending and manage recurring subscriptions here.',
        title: 'Financial Planning 📅',
        placement: 'top',
      },
    ],
    categories: [
      {
        target: '#tour-categories-header',
        content: 'Organize your spending by creating custom categories.',
        title: 'Categories 🏷️',
        placement: 'bottom',
      },
      {
        target: '#tour-categories-new',
        content: 'Add a new category to better track your specific spending habits.',
        title: 'Add Category',
        placement: 'bottom',
      },
      {
        target: '#tour-categories-grid',
        content: 'Manage your existing categories and see a quick summary of activity for each.',
        title: 'Category Management',
        placement: 'top',
      },
    ],
    settings: [
      {
        target: '#tour-settings-view',
        content: 'Customize your profile and application preferences here.',
        title: 'Settings ⚙️',
        placement: 'top',
      },
    ],
  }), []);

  const steps = allSteps[activeView] || [];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      const tourKey = `hasSeenTour_${activeView}`;
      localStorage.setItem(tourKey, 'true');
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      disableScrolling={false}
      disableOverlayClose={true}
      spotlightPadding={10}
      floaterProps={{
        disableAnimation: true,
      }}
      styles={{
        options: {
          arrowColor: 'var(--card)',
          backgroundColor: 'var(--card)',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          primaryColor: '#10b981', // emerald-500
          textColor: 'var(--foreground)',
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: '1.5rem',
          padding: '1.5rem',
          maxWidth: '350px',
          width: '90vw',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          color: '#10b981',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          marginBottom: '0.75rem',
        },
        tooltipContent: {
          padding: '0',
          fontSize: '1rem',
          lineHeight: '1.5',
        },
        buttonNext: {
          borderRadius: '0.75rem',
          fontWeight: 'bold',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#10b981',
        },
        buttonBack: {
          marginRight: 10,
          fontWeight: 'bold',
          color: 'var(--muted-foreground)',
        },
        buttonSkip: {
          fontWeight: 'bold',
          color: 'var(--muted-foreground)',
        },
      }}
    />
  );
}
