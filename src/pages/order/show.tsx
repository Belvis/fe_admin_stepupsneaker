import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { List, PageHeader, useModal } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useParsed,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { Button, Card, Skeleton, Space, Typography } from "antd";
import { Fragment, useState } from "react";

import CancelReasonModal from "../../components/customer/CancelModal";
import ReasonModal from "../../components/customer/ReasonModal";
import { EmployeeInfo } from "../../components/order/EmployeeInfo";
import MyOrderModal from "../../components/order/MyOrderModal";
import { OrderDeliverables } from "../../components/order/OrderDeliverables";
import { OrderDescription } from "../../components/order/OrderDescription";
import { OrderHistoryTimeLine } from "../../components/order/OrderHistoryTimeLine";
import { OrderSteps } from "../../components/order/OrderSteps";
import { IOrderResponse, OrderStatus } from "../../interfaces";

const { Text } = Typography;

export const OrderShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const {
    queryResult: { refetch, data, isLoading },
  } = useShow<IOrderResponse>();
  const record = data?.data;

  const { id } = useParsed();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [status, setStatus] = useState<OrderStatus>({} as OrderStatus);

  const canAcceptOrder = record?.status === "WAIT_FOR_CONFIRMATION";
  const canRejectOrder =
    record?.status === "PENDING" ||
    record?.status === "WAIT_FOR_CONFIRMATION" ||
    record?.status === "WAIT_FOR_DELIVERY" ||
    record?.status === "DELIVERING" ||
    record?.status === "CANCELED" ||
    record?.status === "EXCHANGED" ||
    record?.status === "RETURNED";
  const canRevertOrder = record?.status === "WAIT_FOR_DELIVERY";

  const {
    show,
    close,
    modalProps: { visible, ...restModalProps },
  } = useModal();

  const {
    show: showCancel,
    close: closeCancel,
    modalProps: { visible: vi, ...restProps },
  } = useModal();

  const {
    show: showReason,
    close: closeReason,
    modalProps: { visible: vi2, ...restPropsReason },
  } = useModal();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Fragment>
      <Space size={20} direction="vertical" style={{ width: "100%" }}>
        <PageHeader
          ghost={false}
          onBack={() => window.history.back()}
          title={t("orders.fields.code")}
          subTitle={`#${record?.code.toUpperCase() ?? ""}`}
          extra={[
            <Button
              disabled={!canRevertOrder}
              key="back-to-previous"
              icon={<RollbackOutlined />}
              type="primary"
              onClick={() => {
                const status = getPreviousStatus(record?.status ?? "PENDING");
                setStatus(status ?? "PENDING");
                showReason();
              }}
            >
              Trở về trạng thái trước đó
            </Button>,
            <Button
              disabled={!canRejectOrder}
              key="force-confirm"
              icon={<CheckCircleOutlined />}
              type="primary"
              onClick={() => {
                const status = getNextStatus(record?.status ?? "PENDING");
                setStatus(status ?? "PENDING");
                showReason();
              }}
            >
              {t("buttons.forceConfirm")}
            </Button>,
            <Button
              disabled={!canAcceptOrder}
              key="accept"
              icon={<CheckCircleOutlined />}
              type="primary"
              onClick={() => {
                setStatus("WAIT_FOR_DELIVERY");
                showReason();
              }}
            >
              {t("buttons.accept")}
            </Button>,
            <Button
              disabled={!canRejectOrder}
              key="reject"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => {
                showCancel();
              }}
            >
              {t("buttons.reject")}
            </Button>,
          ]}
        >
          <OrderSteps record={record} callBack={refetch} />
        </PageHeader>
        {record?.employee && (
          <Card loading={isLoading}>
            <EmployeeInfo record={record} />
          </Card>
        )}
        <List
          headerProps={{ style: { marginTop: 20 } }}
          title={
            <Text style={{ fontSize: 22, fontWeight: 800 }}>
              {t("orders.deliverables.deliverables")}
            </Text>
          }
          headerButtons={() => (
            <>
              <Button
                type="primary"
                ghost
                disabled={record && record?.status !== "WAIT_FOR_CONFIRMATION"}
                onClick={show}
              >
                Chỉnh sửa đơn hàng
              </Button>
              <Button type="primary" onClick={showModal}>
                Xem lịch sử
              </Button>
            </>
          )}
        >
          {record && (
            <OrderDeliverables record={record} isLoading={isLoading} />
          )}
        </List>
        <Skeleton loading={isLoading} active paragraph>
          {record && <OrderDescription record={record} />}
        </Skeleton>
      </Space>
      <OrderHistoryTimeLine
        id={id as string}
        open={isModalVisible}
        handleOk={handleModalOk}
        handleCancel={handleModalCancel}
      />
      {record && (
        <Fragment>
          <ReasonModal
            restModalProps={restPropsReason}
            close={closeReason}
            order={record ?? ({} as IOrderResponse)}
            callBack={refetch}
            status={status}
          />
          <CancelReasonModal
            restModalProps={restProps}
            close={closeCancel}
            order={record ?? ({} as IOrderResponse)}
            callBack={refetch}
          />
        </Fragment>
      )}
      <MyOrderModal
        restModalProps={restModalProps}
        order={record ?? ({} as IOrderResponse)}
        callBack={refetch}
        close={close}
        showCancel={showCancel}
      />
    </Fragment>
  );
};

const getPreviousStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const statusList: OrderStatus[] = [
    "PENDING",
    "WAIT_FOR_CONFIRMATION",
    "WAIT_FOR_DELIVERY",
    "DELIVERING",
    "COMPLETED",
  ];
  const currentIndex = statusList.indexOf(currentStatus);

  if (currentIndex !== -1) {
    const previousIndex = currentIndex - 1;

    if (previousIndex >= 0) {
      return statusList[previousIndex];
    }
  }

  return null;
};

const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  const statusList: OrderStatus[] = [
    "PENDING",
    "WAIT_FOR_CONFIRMATION",
    "WAIT_FOR_DELIVERY",
    "DELIVERING",
    "COMPLETED",
  ];
  const currentIndex = statusList.indexOf(currentStatus);

  if (currentIndex !== -1) {
    const nextIndex = currentIndex + 1;

    if (nextIndex < statusList.length) {
      return statusList[nextIndex];
    }
  }

  return null;
};
