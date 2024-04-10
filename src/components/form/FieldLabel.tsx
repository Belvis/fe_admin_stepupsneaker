import { TranslateFunction } from "../../interfaces";

interface FieldLabel {
  fieldName: string;
  maxLength: number;
  t: TranslateFunction;
}

export const FieldLabel: React.FC<FieldLabel> = ({
  fieldName,
  maxLength,
  t,
}) => {
  return (
    <div>
      <span>{fieldName}</span>
      <span className="sub-label">
        ({t("common.maxLength", { length: maxLength })})
      </span>
    </div>
  );
};
