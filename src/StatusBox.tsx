export interface StatusBoxProps {
  header?: string;
  content: string;
  kind: "error" | "info" | "success";
}

const StatusBox = ({ header, content, kind }: StatusBoxProps) => {
  const className = `status-box ${kind}`;

  return (
    <div className={className}>
      {header && <strong>{header}</strong>}
      <div className="content">{content}</div>
    </div>
  );
};

export default StatusBox;
