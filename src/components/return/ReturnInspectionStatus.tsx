import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";
import { InspectionStatus } from "../../interfaces";

type OrderStatusProps = {
  status: InspectionStatus | "PENDING";
};

export const ReturnInspectionStatus: React.FC<OrderStatusProps> = ({
  status,
}) => {
  const t = useTranslate();
  let color;

  switch (status) {
    case "FAILED":
      color = "red";
      break;
    case "PASSED":
      color = "green";
      break;
    case null:
    case "PENDING":
      color = "orange";
      break;
  }

  return (
    <Tag color={color}>
      {t(`return-form-details.fields.returnInspectionStatus.${status}`)}
    </Tag>
  );
};
