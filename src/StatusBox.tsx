export interface StatusBoxProps {
  header?: string;
  content: string;
  kind: "error" | "info" | "success";
}

const StatusBox = ({ header, content, kind }: StatusBoxProps) => {
  const className = `status-box status-box-${kind}`;
  
  return (
    <div className={className}>
      {header && <strong>{header}</strong>}
      <div>{content}</div>
    </div>
  );
};

export default StatusBox;