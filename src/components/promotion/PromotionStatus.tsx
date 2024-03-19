import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";
import { TagProps } from "antd/lib";
import { PromotionStatus as IPromotionStatus } from "../../interfaces";

type PromotionStatusProps = {
  status?: IPromotionStatus;
};

export const PromotionStatus: React.FC<PromotionStatusProps> = ({ status }) => {
  const t = useTranslate();

  let color: TagProps["color"];

  switch (status) {
    case "IN_ACTIVE":
      color = "warning";
      break;
    case "ACTIVE":
      color = "success";
      break;
    case "EXPIRED":
      color = "error";
      break;
    case "CANCELLED":
      color = "magenta";
      break;
    case "UP_COMING":
      color = "processing";
      break;
  }

  return <Tag color={color}>{t(`enum.promotionsStatuses.${status}`)}</Tag>;
};
