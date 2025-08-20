interface OrgNameViewProps {
  name: string;
  taxDeductible: boolean;
}

const OrgNameView = ({ name, taxDeductible }: OrgNameViewProps) => {
  return (
    <span>
      {name}
      {!taxDeductible && <span title="Not tax-deductible">†</span>}
    </span>
  );
};

export default OrgNameView;
