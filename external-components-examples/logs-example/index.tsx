import ReactDOM from "react-dom";
import LogViewer from "./LogViewer";

export default function createExternalRoot(container: HTMLElement) {
  return {
    render(props: {
      options: { entityId: number };
      config: {
        header_label: string;
        log_types: Array<{ name: string; label: string }>;
      };
    }) {
      ReactDOM.render(
        props.config.log_types.map((logType) => (
          <LogViewer
            entityId={props.options.entityId ?? 0}
            logType={logType.name ?? ""}
            logLabel={logType.label ?? ""}
          />
        )),
        container
      );
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
