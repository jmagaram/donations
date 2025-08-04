export interface StatusBoxProps {
  header?: string;
  content: string | React.ReactNode;
  kind: "error" | "info" | "success";
  buttons?: Array<{
    caption: string;
    onClick: () => void;
  }>;
}

const StatusBox = ({ header, content, kind, buttons }: StatusBoxProps) => {
  const className = `status-box ${kind}`;

  return (
    <div className={className}>
      {header && <strong>{header}</strong>}
      <div className="content">{content}</div>
      {buttons && buttons.length > 0 && (
        <div className="buttons">
          {buttons.map((button, index) => (
            <button key={index} onClick={button.onClick}>
              {button.caption}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusBox;
