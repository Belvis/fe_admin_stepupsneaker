import { NumberField } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import {
  App,
  Button,
  Input,
  Modal,
  ModalProps,
  QRCode,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useContext, useEffect, useState } from "react";
import { DeliverySalesContext } from "../../contexts/point-of-sales/delivery-sales";
import { IOrderResponse, IPaymentResponse } from "../../interfaces";
import { calculateChange } from "../../utils/common/calculator";
import _ from "lodash";
import useOrderCalculations from "../../hooks/useOrderCalculations";
import { QRCODE_ICON_URL, QRCODE_VALUE } from "../../constants/common";
import { POSContext } from "../../contexts/point-of-sales";

const { Text } = Typography;

type PaymentComfirmModalProps = {
  modalProps: ModalProps;
  order: IOrderResponse;
  submitOrder: () => void;
  close: () => void;
};

export const PaymentComfirmModal: React.FC<PaymentComfirmModalProps> = ({
  order,
  modalProps,
  submitOrder,
  close,
}) => {
  const t = useTranslate();
  const { message } = App.useApp();

  const [copiedPayments, setCopiedPayments] = useState<IPaymentResponse[]>([]);

  const { payments, setPayments } = useContext(POSContext);
  const { discount } = useContext(DeliverySalesContext);

  useEffect(() => {
    setCopiedPayments(_.cloneDeep(payments || []));
  }, [payments]);

  const orderDetails = order?.orderDetails || [];
  const { totalPrice } = useOrderCalculations(orderDetails);

  const handleConfirm = () => {
    const hasEmptyTransactionCode = copiedPayments
      ?.filter((payment) => payment.paymentMethod.name !== "Cash")
      ?.some((payment) => !payment.transactionCode);

    if (!hasEmptyTransactionCode) {
      const change = calculateChange(
        copiedPayments ?? [],
        totalPrice,
        discount
      );
      if (change < 0) {
        message.error(t("orders.notification.tab.checkoutDrawer.error"));
        return;
      }
      setPayments(copiedPayments, () => submitOrder());
      close();
    } else {
      message.error(t("payments.modal.error.transactionCode"));
    }
  };

  const handleTransactionCodeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = event.target;

    setCopiedPayments((prevPayments) => {
      if (prevPayments === undefined) {
        return [];
      }

      const updatedPayments = [...prevPayments];
      updatedPayments[index] = {
        ...updatedPayments[index],
        transactionCode: value,
      };
      return updatedPayments;
    });
  };

  const columns: ColumnsType<IPaymentResponse> = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => {
        return (index ?? 0) + 1;
      },
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (value, { paymentMethod }) => {
        return t(`paymentMethods.options.${paymentMethod.name}`);
      },
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (value, { totalMoney }) => {
        return (
          <NumberField
            options={{
              currency: "VND",
              style: "currency",
            }}
            value={totalMoney}
            locale={"vi"}
          />
        );
      },
    },
    {
      title: "Mã giao dịch",
      dataIndex: "transactionCode",
      key: "transactionCode",
      render: (_, record, index) => (
        <Input
          disabled={record.paymentMethod.name === "Cash"}
          width={100}
          value={record.transactionCode}
          onChange={(e) => handleTransactionCodeChange(e, index)}
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  return (
    <Modal
      {...modalProps}
      title={t("payments.modal.title")}
      width={"700px"}
      styles={{
        header: {
          textAlign: "center",
        },
        footer: {
          textAlign: "center",
        },
      }}
      footer={
        <Button type="primary" onClick={handleConfirm}>
          {t("payments.modal.buttons.footer.label")}
        </Button>
      }
    >
      <QRCode
        size={400}
        errorLevel="H"
        value={QRCODE_VALUE}
        icon={QRCODE_ICON_URL}
        style={{
          margin: "0 auto",
        }}
      />
      <Table
        title={() => (
          <Text strong className="h6">
            Khách thanh toán
          </Text>
        )}
        dataSource={copiedPayments}
        columns={columns}
        pagination={false}
      />
    </Modal>
  );
};
