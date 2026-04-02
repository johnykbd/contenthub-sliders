import { FunctionComponent, useEffect, useState } from "react";

interface logViewerProps {
  entityId: number;
  logType: string;
  logLabel: string;
}

const LogViewer: FunctionComponent<logViewerProps> = ({
  entityId,
  logType,
  logLabel,
}) => {
  const [numberOfResults, setNumberOfResults] = useState<number>(0);

  useEffect(() => {
    const getAuditInfo = async (): Promise<void> => {
      const response = await fetch(
        `${document.location.origin}/api/audit/business/query?logType=reportingeventslog&fullText=${logType}%20${entityId}&skip=0&take=10&sort=timestamp&order=desc`
      );

      const logsInfo: { total_items: number } = await response.json();

      setNumberOfResults(logsInfo.total_items);
    };

    if (entityId && logType && logLabel) {
      void getAuditInfo();
    }
  }, [entityId]);

  return (
    <>
      <h3>
        {logLabel} <em>{numberOfResults}</em>
      </h3>
    </>
  );
};

export default LogViewer;
