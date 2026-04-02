import ReactDOM from "react-dom";
import IconComponent from "./IconComponent";

export default function createExternalRoot(container: HTMLElement) {
  return {
    render({
      icon,
    }: {
      icon: {
        insertContentHubIconInElement: (
          icon: string,
          htmlElement: HTMLElement
        ) => Promise<void>;
      };
    }) {
      const { insertContentHubIconInElement } = icon;

      ReactDOM.render(
        <div style={{ fontSize: "24px" }}>
          <IconComponent
            insertIconInElement={insertContentHubIconInElement}
            iconName="trash"
          />
          <IconComponent
            insertIconInElement={insertContentHubIconInElement}
            iconName="star"
          />
          <IconComponent
            insertIconInElement={insertContentHubIconInElement}
            iconName="star"
          />
        </div>,
        container
      );
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
