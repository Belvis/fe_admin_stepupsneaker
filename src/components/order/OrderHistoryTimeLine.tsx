import { useTranslate } from "@refinedev/core";
import { Card, Grid, Modal } from "antd";
import { TimeLine } from "./TimeLine";
import { useEffect, useState } from "react";

type OrderHistoryTimeLineProps = {
  id: string;
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
};

export const OrderHistoryTimeLine: React.FC<OrderHistoryTimeLineProps> = ({
  id,
  open,
  handleCancel,
  handleOk,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const [shouldRefetch, setShouldRefetch] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setShouldRefetch(true);
    }
  }, [open]);

  return (
    <Modal
      title="Lịch sử đơn hàng"
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
      onOk={handleOk}
      onCancel={handleCancel}
      open={open}
      footer={<></>}
    >
      <Card bordered={false}>
        <TimeLine
          id={id}
          shouldRefetch={shouldRefetch}
          setShouldRefetch={setShouldRefetch}
        />
      </Card>
    </Modal>
  );
};
