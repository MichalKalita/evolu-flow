import { FC, useState } from "react";
import { Mnemonic } from "@evolu/common";
import { useAppOwner } from "@evolu/react";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";
import { useEvolu } from "../lib/evolu-config";
import { formatTypeError } from "../lib/utils";

interface SettingsMenuProps {
  onClose: () => void;
  isVisible: boolean;
  position: { x: number; y: number };
}

export const SettingsMenu: FC<SettingsMenuProps> = ({ onClose, isVisible, position }) => {
  const evolu = useEvolu();
  const owner = useAppOwner();
  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleShowMnemonicClick = () => {
    setShowMnemonic(!showMnemonic);
  };

  const handleRestoreOwnerClick = () => {
    const mnemonic = window.prompt("Enter your backup code");
    if (mnemonic == null) return; // escape or cancel
    const result = Mnemonic.from(mnemonic.trim());
    if (!result.ok) {
      alert(formatTypeError(result.error));
      return;
    }
    void evolu.restoreAppOwner(result.value);
  };

  const handleResetOwnerClick = () => {
    if (confirm("Are you sure you want to clear all data? This will delete all your todos and cannot be undone.")) {
      void evolu.resetAppOwner();
    }
  };

  const handleDownloadDatabaseClick = () => {
    void evolu.exportDatabase().then((array) => {
      const blob = new Blob([array.slice()], {
        type: "application/x-sqlite3",
      });
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = window.URL.createObjectURL(blob);
      a.download = "db.sqlite3";
      a.addEventListener("click", function () {
        setTimeout(function () {
          window.URL.revokeObjectURL(a.href);
          a.remove();
        }, 1000);
      });
      a.click();
    });
  };

  const settingsItems: ContextMenuItem[] = [
    {
      label: showMnemonic ? "Hide Backup Code" : "Show Backup Code",
      onClick: handleShowMnemonicClick,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"/>
        </svg>
      ),
    },
    {
      label: "Restore from Code",
      onClick: handleRestoreOwnerClick,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
    },
    {
      label: "Download Database",
      onClick: handleDownloadDatabaseClick,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      ),
    },
    {
      label: "Clear Data",
      onClick: handleResetOwnerClick,
      className: "text-red-600 dark:text-red-400 font-medium",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          <line x1="10" y1="11" x2="10" y2="17"/>
          <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <ContextMenu
        items={settingsItems}
        position={position}
        onClose={onClose}
        isVisible={isVisible}
      />

      {/* Mnemonic Display Modal */}
      {showMnemonic && owner?.mnemonic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Your Backup Code</h3>
            <textarea
              value={owner.mnemonic}
              readOnly
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-sm font-mono"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowMnemonic(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
