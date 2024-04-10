import { useTranslate } from "@refinedev/core";
import { Tag } from "antd";
import { ReviewStatus as IReviewStatus } from "../../interfaces";

type ReviewStatusProps = {
  status: IReviewStatus;
};

export const ReviewStatus: React.FC<ReviewStatusProps> = ({ status }) => {
  const t = useTranslate();
  let color;

  switch (status) {
    case "WAITING":
      color = "magenta";
      break;
    case "ACCEPTED":
      color = "green";
      break;
    case null:
    case "REJECTED":
      color = "red";
      break;
  }

  return (
    <Tag color={color}>{t(`product/reviews.fields.status.${status}`)}</Tag>
  );
};
