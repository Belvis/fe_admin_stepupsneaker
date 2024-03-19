import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";
import { TagProps } from "antd/lib";

type CustomerStatusProps = {
  status?: "IN_ACTIVE" | "ACTIVE" | "BLOCKED";
};

export const CustomerStatus: React.FC<CustomerStatusProps> = ({ status }) => {
  const t = useTranslate();

  let color: TagProps["color"];

  switch (status) {
    case "IN_ACTIVE":
      color = "volcano";
      break;
    case "ACTIVE":
      color = "green";
      break;
    case "BLOCKED":
      color = "red";
      break;
  }

  return <Tag color={color}>{t(`enum.customerStatuses.${status}`)}</Tag>;
};
