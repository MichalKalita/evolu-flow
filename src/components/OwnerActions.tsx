import { FC, useState } from "react";
import { useAppOwner } from "@evolu/react";
import { Mnemonic } from "@evolu/common";
import { Button } from "./ui";
import { useEvolu } from "../lib/evolu-config";
import { formatTypeError } from "../lib/utils";

export const OwnerActions: FC = () => {
  const evolu = useEvolu();
  const owner = useAppOwner();

  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleRestoreAppOwnerClick = () => {
    const mnemonic = window.prompt("Your Mnemonic");
    if (mnemonic == null) return; // escape or cancel
    const result = Mnemonic.from(mnemonic.trim());
    if (!result.ok) {
      alert(formatTypeError(result.error));
      return;
    }
    void evolu.restoreAppOwner(result.value);
  };

  const handleResetAppOwnerClick = () => {
    if (confirm("Are you sure? It will delete all your local data.")) {
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

  return (
    <div className="mt-6">
      <h2>Owner Actions</h2>
      <p>
        Open this page on another device and use your mnemonic to restore your
        data.
      </p>
      <div className="flex gap-1">
        <Button
          title={`${showMnemonic ? "Hide" : "Show"} Mnemonic`}
          onClick={() => {
            setShowMnemonic(!showMnemonic);
          }}
        />
        <Button title="Restore Owner" onClick={handleRestoreAppOwnerClick} />
        <Button title="Reset Owner" onClick={handleResetAppOwnerClick} />
        <Button
          title="Download Database"
          onClick={handleDownloadDatabaseClick}
        />
      </div>
      {showMnemonic && owner?.mnemonic && (
        <div>
          <textarea
            value={owner.mnemonic}
            readOnly
            rows={2}
            style={{ width: 320 }}
          />
        </div>
      )}
    </div>
  );
};
