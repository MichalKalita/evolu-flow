import { FC, useState } from "react";
import { useQuery } from "@evolu/react";
import { binaryTimestampToTimestamp } from "@evolu/common";
import { Button } from "./ui";
import { evolu } from "../lib/evolu-config";

const changelogQuery = evolu.createQuery((db) =>
  db
    .selectFrom("evolu_history")
    .select(["table", "column", "value", "timestamp"])
    .orderBy("timestamp", "desc")
);

export const Changelog: FC = () => {
  const changelog = useQuery(changelogQuery);
  const [opened, setOpened] = useState(false);

  const changelogWithTimestamp = changelog.map((row) => ({
    ...row,
    timestamp: new Date(binaryTimestampToTimestamp(row.timestamp).millis),
  }));

  return (
    <div>
      <h2>Changelog</h2>
      {opened ? (
        <Button title="Close Changelog" onClick={() => setOpened(false)} />
      ) : (
        <Button title="Open Changelog" onClick={() => setOpened(true)} />
      )}
      {opened && (
        <pre>{JSON.stringify(changelogWithTimestamp, null, 2)}</pre>
      )}
    </div>
  );
};
