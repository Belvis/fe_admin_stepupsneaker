import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";
import { PaymentStatus as IPaymentType } from "../../interfaces";

type PaymentStatusProps = {
  status: IPaymentType;
};

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ status }) => {
  const t = useTranslate();
  let color;

  switch (status) {
    case "PENDING":
      color = "orange";
      break;
    case "COMPLETED":
      color = "blue";
      break;
  }

  return (
    <Tag color={color}>{t(`return-forms.fields.refundStatus.${status}`)}</Tag>
  );
};
