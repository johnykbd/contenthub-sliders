import ReactDOM from "react-dom";

export default function createExternalRoot(container: HTMLElement) {
  return {
      render({
          api,
          options,
      }: {
          options: { entityId: number };
          api: {
              details: {
                  reloadEntity: (id: number) => Promise<void>;
              };
          };
      }) {
          ReactDOM.render(
              <button
                  onClick={async () => {
                      console.log(`Refreshing entity with id ${options.entityId}.`);

                      await api.details.reloadEntity(options.entityId);

                      console.log(`${options.entityId} is refreshed.`);
                  }}
              >
                  Sync the entity
              </button>,
              container
          );
      },
      unmount() {
          ReactDOM.unmountComponentAtNode(container);
      },
  };
}
