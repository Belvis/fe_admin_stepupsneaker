import { useSimpleList } from "@refinedev/antd";
import { HttpError, useTranslate, useUpdate } from "@refinedev/core";
import { List as AntdList, Col, Grid, Modal, Row } from "antd";
import { useContext, useEffect } from "react";
import { POSContext } from "../../contexts/point-of-sales";
import {
  ICustomerResponse,
  IOrderResponse,
  IVoucherFilterVariables,
  IVoucherResponse,
} from "../../interfaces";
import Voucher from "../voucher/Voucher";

type DiscountModalProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  customer: ICustomerResponse | undefined;
  order: IOrderResponse | undefined;
};

export const DiscountModal: React.FC<DiscountModalProps> = ({
  open,
  handleOk,
  handleCancel,
  order,
  customer,
}) => {
  const t = useTranslate();
  const { isLoading: isLoadingOrderUpdate } = useUpdate();
  const breakpoint = Grid.useBreakpoint();
  const { refetchOrder } = useContext(POSContext);

  useEffect(() => {
    if (open) refetch();
  }, [open]);

  const {
    listProps: voucherListProps,
    queryResult: { refetch },
  } = useSimpleList<IVoucherResponse, HttpError, IVoucherFilterVariables>({
    resource: "vouchers",
    filters: {
      initial: [
        {
          field: "status",
          operator: "eq",
          value: "ACTIVE",
        },
      ],
    },
    pagination: {
      pageSize: 5,
    },
    syncWithLocation: false,
  });

  return (
    <Modal
      title={t("vouchers.vouchers")}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
      onCancel={handleCancel}
      open={open}
      confirmLoading={isLoadingOrderUpdate}
      footer={<></>}
    >
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <AntdList
            {...voucherListProps}
            itemLayout="horizontal"
            bordered
            style={{ padding: "1rem" }}
            pagination={false}
            renderItem={(item) => {
              return (
                <AntdList.Item key={item.id}>
                  <Voucher
                    item={item}
                    order={order}
                    type="use"
                    callBack={refetchOrder}
                    close={handleCancel}
                  />
                </AntdList.Item>
              );
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
};
