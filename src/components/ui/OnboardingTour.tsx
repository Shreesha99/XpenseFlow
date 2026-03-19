import { useEffect, useMemo } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

interface OnboardingTourProps {
  activeView: string;
  setActiveView: (view: any) => void;
  run: boolean;
  setRun: (run: boolean) => void;
  accountCount: number;
}

export default function OnboardingTour({
  activeView,
  setActiveView,
  run,
  setRun,
  accountCount,
}: OnboardingTourProps) {
  useEffect(() => {
    const tourKey = `hasSeenTour_${activeView}`;
    const hasSeenTour = localStorage.getItem(tourKey);
    if (!hasSeenTour) {
      setRun(true);
    }
  }, [activeView, setRun]);

  const allSteps: Record<string, Step[]> = useMemo(
    () => ({
      dashboard: [
        {
          target: "body",
          content:
            "Welcome to your Dashboard! This is your financial command center.",
          placement: "center",
          title: "Dashboard Overview 🚀",
        },
        {
          target: "#tour-balance",
          content:
            "This is your real-time net worth across all connected bank accounts and wallets.",
          title: "Total Liquidity",
          placement: "bottom",
        },
        {
          target: "#tour-insights",
          content:
            "Visualize your cash flow and spending patterns with these interactive charts.",
          title: "Financial Insights",
          placement: "top",
        },
        {
          target: "#tour-activity",
          content:
            "Keep track of every rupee. Your latest transactions appear here for quick review.",
          title: "Recent Activity",
          placement: "top",
        },
        {
          target: "#tour-nav",
          content:
            "Use the sidebar to navigate between different sections of the app.",
          title: "Navigation",
          placement: "right",
        },
      ],
      accounts: (() => {
        if (accountCount === 0) {
          return [
            {
              target: "#tour-banks-header",
              title: "Let’s set up your money hub 🏦",
              content:
                "Track all your bank accounts, wallets, and cash in one place.",
              placement: "bottom",
            },
            {
              target: "#tour-add-first-account",
              title: "Start here",
              content: "Add your first account. Takes less than 10 seconds.",
              placement: "top",
            },
          ];
        }

        return [
          {
            target: "#tour-banks-header",
            title: "Your money, organized 💰",
            content:
              "This is where all your accounts live. Everything updates in real time.",
            placement: "bottom",
          },
          {
            target: "#tour-banks-transfer",
            title: "Move money internally",
            content:
              "Record transfers between your own accounts without affecting income or expense.",
            placement: "bottom",
          },
          {
            target: "#tour-banks-grid",
            title: "Your accounts",
            content:
              "Click any account to drill into its activity and transactions.",
            placement: "top",
          },
          {
            target: "#tour-banks-networth",
            title: "Your true net worth",
            content:
              "This reflects your actual financial position across all accounts.",
            placement: "top",
          },
        ];
      })(),
      transactions: [
        {
          target: "#tour-ledger-header",
          title: "Your financial history 📜",
          content:
            "Every transaction you record appears here. This is your single source of truth.",
          placement: "bottom",
        },
        {
          target: "#tour-ledger-table",
          title: "Track everything",
          content:
            "Review, delete, and analyze your transactions across all accounts.",
          placement: "top",
        },
      ],
      planning: [
        {
          target: "#tour-planning-header",
          title: "Plan your future 💡",
          content:
            "This section helps you understand upcoming expenses and manage recurring subscriptions.",
          placement: "bottom",
        },
        {
          target: "#tour-planning-stats",
          title: "Your projections",
          content:
            "These cards show your projected balance, planning scope, and number of active subscriptions.",
          placement: "bottom",
        },
        {
          target: "#tour-planning-calculator",
          title: "Smart calculator",
          content:
            "Simulate your financial future based on your current income and spending patterns.",
          placement: "top",
        },
        {
          target: "#tour-add-subscription",
          title: "Add subscriptions",
          content:
            "Track recurring payments like Netflix, rent, or EMIs to improve forecasting.",
          placement: "bottom",
        },
      ],
      categories: (() => {
        return [
          {
            target: "#tour-categories-header",
            title: "Your categories",
            content:
              "Manage and organize all your financial activity with categories.",
            placement: "bottom",
          },
          {
            target: "#tour-categories-new",
            title: "Add new categories",
            content:
              "Create custom categories to better track your spending habits.",
            placement: "bottom",
          },
          {
            target: "#tour-categories-grid",
            title: "Category insights",
            content:
              "Each category shows income and expenses so you can analyze trends.",
            placement: "top",
          },
        ];
      })(),
      settings: (() => {
        if (accountCount === 0) {
          return [
            {
              target: "#tour-settings-view",
              title: "Setup your workspace ⚙️",
              content:
                "This is where you configure your financial system and manage your data.",
              placement: "top",
            },
            {
              target: "#tour-settings-add-account",
              title: "Add your first account",
              content:
                "You need at least one account to start tracking transactions.",
              placement: "top",
            },
          ];
        }

        return [
          {
            target: "#tour-settings-view",
            title: "Settings overview ⚙️",
            content:
              "Manage your accounts, preferences, imports, and security from here.",
            placement: "top",
          },
          {
            target: "#tour-settings-accounts",
            title: "Manage accounts",
            content:
              "View, organize, and delete your connected bank accounts and wallets.",
            placement: "top",
          },
          {
            target: "#tour-settings-import",
            title: "Import data",
            content:
              "Upload bank statements to quickly sync your transaction history.",
            placement: "top",
          },
          {
            target: "#tour-settings-preferences",
            title: "Preferences",
            content: "Customize how your financial workspace behaves.",
            placement: "top",
          },
          {
            target: "#tour-settings-security",
            title: "Security",
            content: "Your data is encrypted and protected at all times.",
            placement: "top",
          },
          {
            target: "#tour-settings-profile",
            title: "Account control",
            content: "Manage your profile or securely sign out from here.",
            placement: "top",
          },
        ];
      })(),
    }),
    []
  );

  const steps = allSteps[activeView] || [];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      const tourKey = `hasSeenTour_${activeView}`;
      localStorage.setItem(tourKey, "true");
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
          arrowColor: "var(--card)",
          backgroundColor: "var(--card)",
          overlayColor: "rgba(0, 0, 0, 0.7)",
          primaryColor: "#10b981", // emerald-500
          textColor: "var(--foreground)",
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: "1.5rem",
          padding: "1.5rem",
          maxWidth: "350px",
          width: "90vw",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipTitle: {
          color: "#10b981",
          fontWeight: "bold",
          fontSize: "1.2rem",
          marginBottom: "0.75rem",
        },
        tooltipContent: {
          padding: "0",
          fontSize: "1rem",
          lineHeight: "1.5",
        },
        buttonNext: {
          borderRadius: "0.75rem",
          fontWeight: "bold",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#10b981",
        },
        buttonBack: {
          marginRight: 10,
          fontWeight: "bold",
          color: "var(--muted-foreground)",
        },
        buttonSkip: {
          fontWeight: "bold",
          color: "var(--muted-foreground)",
        },
      }}
    />
  );
}
