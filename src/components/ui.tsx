import { FC, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useEvoluError } from "@evolu/react";

export const Button: FC<{
  title: string;
  className?: string;
  onClick: () => void;
}> = ({ title, className, onClick }) => {
  return (
    <button
      className={twMerge(
        "px-4 py-2 rounded-md border border-blue-500 text-blue-500 cursor-pointer hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20",
        className
      )}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export const NotificationBar: FC = () => {
  const evoluError = useEvoluError();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (evoluError) setShowError(true);
  }, [evoluError]);

  if (!evoluError || !showError) return null;

  return (
    <div>
      <p>{`Error: ${JSON.stringify(evoluError)}`}</p>
      <Button
        title="Close"
        onClick={() => {
          setShowError(false);
        }}
      />
    </div>
  );
};
