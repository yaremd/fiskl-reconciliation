import { ReconciliationShell } from "@/components/reconciliation/shell";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReconciliationShell>
      <div className="flex gap-8 min-h-full">
        <SettingsSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </ReconciliationShell>
  );
}
