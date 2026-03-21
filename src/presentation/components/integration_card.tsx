import { type ReactNode, useState } from "react";

interface IntegrationCardProps {
  title: string;
  description: string;
  status: "connected" | "disconnected";
  isRequired?: boolean;
  children: (editing: boolean) => ReactNode;
  onSave: () => void;
  onDisconnect?: () => void;
}

export const IntegrationCard = ({
  title,
  description,
  status,
  isRequired = false,
  children,
  onSave,
  onDisconnect,
}: IntegrationCardProps) => {
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    onSave();
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <span
          data-testid="statusBadge"
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === "connected"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          {status === "connected" ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="space-y-3">{children(editing)}</div>

      <div className="mt-4 flex gap-2">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Edit
            </button>
            {!isRequired && status === "connected" && onDisconnect && (
              <button
                onClick={onDisconnect}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Disconnect
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
