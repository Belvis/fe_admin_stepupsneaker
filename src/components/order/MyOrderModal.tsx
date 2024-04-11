import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useTranslate, useUpdate } from "@refinedev/core";
import {
  App,
  Avatar,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import _, { debounce, isNumber } from "lodash";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FREE_SHIPPING_THRESHOLD } from "../../constants/common";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { orderToRequest } from "../../helpers/mapper";
import {
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from "../../helpers/validate";
import { IOrderDetailResponse, IOrderResponse } from "../../interfaces";
import { AddressFormThree } from "../form/AddressFormThree";
import { MyOrderModalFooter } from "./MyOrderModalFooter";
import { useModal } from "@refinedev/antd";
import { AdvancedAddModal } from "../point-of-sales/AdvancedAddModal";

const { Title } = Typography;

interface MyOrderModalProps {
  restModalProps: ModalProps;
  order: IOrderResponse;
  callBack: any;
  close: () => void;
  showCancel: () => void;
}

const MyOrderModal: React.FC<MyOrderModalProps> = ({
  restModalProps,
  order,
  callBack,
  close,
  showCancel,
}) => {
  const t = useTranslate();
  const { message } = App.useApp();

  const { mutate: update, isLoading: isLoadingUpdate } = useUpdate();

  const [form] = Form.useForm<{
    districtId: number;
    districtName: string;
    wardCode: string;
    wardName: string;
    provinceId: number;
    provinceName: string;
    line: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    orderNote: string;
  }>();

  const [viewOrder, setViewOrder] = useState<IOrderResponse>(order);

  const [shippingMoney, setShippingMoney] = useState<number>(0);

  const {
    show: advancedAddShow,
    close: advancedAddClose,
    modalProps: advancedAddModalProps,
  } = useModal();

  // Reset on open

  useEffect(() => {
    if (order && restModalProps.open) {
      setViewOrder(_.cloneDeep(order));
      form.setFieldsValue({
        districtId: Number(order.address?.districtId),
        districtName: order.address?.districtName,
        wardCode: order.address?.wardCode,
        wardName: order.address?.wardName,
        provinceId: Number(order.address?.provinceId),
        provinceName: order.address?.provinceName,
        line: order.address?.more,
        fullName: order.fullName,
        phoneNumber: order.phoneNumber,
        email: order.customer?.email,
        orderNote: order.note,
      });
    }
  }, [order, restModalProps]);

  // Update money

  useEffect(() => {
    if (viewOrder.voucher) {
      if (viewOrder.voucher !== order.voucher) {
        const newReduceMoney =
          viewOrder.voucher.type === "PERCENTAGE"
            ? (viewOrder.voucher.value * viewOrder.originMoney) / 100
            : viewOrder.voucher.value;
        const newTotalMoney =
          viewOrder.originMoney + viewOrder.shippingMoney - newReduceMoney;
        setViewOrder((prev) => ({
          ...prev,
          reduceMoney: newReduceMoney,
          totalMoney: newTotalMoney,
        }));
      }
    } else {
      const newReduceMoney = 0;
      const newTotalMoney =
        viewOrder.originMoney + viewOrder.shippingMoney - newReduceMoney;

      setViewOrder((prev) => ({
        ...prev,
        reduceMoney: newReduceMoney,
        totalMoney: newTotalMoney,
      }));
    }
  }, [viewOrder.voucher]);

  const handleUpdateOrder = () => {
    const simplifiedCartItems: { id: string; quantity: number }[] =
      viewOrder.orderDetails.map((item) => {
        return {
          id: item.id,
          productDetailId: item.productDetail.id,
          quantity: item.quantity,
        };
      });
    const orderPayload = orderToRequest(order);

    const submitData = {
      ...orderPayload,
      fullName: form.getFieldValue("fullName"),
      email: form.getFieldValue("email"),
      phoneNumber: form.getFieldValue("phoneNumber"),
      note: form.getFieldValue("orderNote"),
      addressShipping: {
        phoneNumber: form.getFieldValue("phoneNumber"),
        districtId: form.getFieldValue("districtId"),
        districtName: form.getFieldValue("districtName"),
        provinceId: form.getFieldValue("provinceId"),
        provinceName: form.getFieldValue("provinceName"),
        wardCode: form.getFieldValue("wardCode"),
        wardName: form.getFieldValue("wardName"),
        more: form.getFieldValue("line"),
      },
      cartItems: simplifiedCartItems,
      voucher: viewOrder.voucher !== null ? viewOrder.voucher?.id : null,
    };

    update(
      {
        resource: `orders`,
        values: submitData,
        id: viewOrder.id,
      },
      {
        onError: (error, variables, context) => {},
        onSuccess: (data, variables, context) => {
          callBack();
          close();
        },
      }
    );
  };
  const handleOk = () => {
    showWarningConfirmDialog({
      options: {
        accept: () => handleUpdateOrder(),
        reject: () => {},
      },
      t: t,
    });
  };

  const updateOrderDetails = (
    prev: IOrderResponse,
    record: IOrderDetailResponse,
    newQuantity: number
  ) => {
    const newTotalPrice = record.price * newQuantity;
    const originMoneyAdjustment = newTotalPrice - record.totalPrice;
    const newOriginMoney = prev.originMoney + originMoneyAdjustment;

    const isNewShippingMoneyNeeded =
      newOriginMoney < FREE_SHIPPING_THRESHOLD && shippingMoney !== 0;
    const newShippingMoney = isNewShippingMoneyNeeded
      ? shippingMoney
      : newOriginMoney >= FREE_SHIPPING_THRESHOLD
      ? 0
      : prev.shippingMoney;
    const newTotalMoney = newOriginMoney + newShippingMoney - prev.reduceMoney;

    return {
      ...prev,
      orderDetails: prev.orderDetails.map((detail) =>
        detail.id === record.id
          ? { ...detail, quantity: newQuantity, totalPrice: newTotalPrice }
          : detail
      ),
      shippingMoney: newShippingMoney,
      totalMoney: newTotalMoney,
      originMoney: newOriginMoney,
    };
  };

  const setViewOrderWithValidation = (
    prev: IOrderResponse,
    record: IOrderDetailResponse,
    value: number
  ) => {
    const currentVoucherThreshold = prev.voucher?.constraint ?? 0;
    const newQuantity = value;
    const newViewOrder = updateOrderDetails(prev, record, newQuantity);

    if (newViewOrder.originMoney < currentVoucherThreshold) {
      showWarningConfirmDialog({
        options: {
          header: t("confirmDialog.quantityChange.remove.header"),
          message: t("confirmDialog.quantityChange.remove.message"),
          accept: () => {
            setViewOrder({
              ...newViewOrder,
              voucher: undefined,
              originMoney: newViewOrder.originMoney,
              shippingMoney: newViewOrder.shippingMoney,
              totalMoney: newViewOrder.totalMoney,
            });
          },
          reject: () => prev,
        },
        t: t,
      });
      return prev;
    }

    return newViewOrder;
  };

  const handleQuantityChange = (
    value: number | null,
    record: IOrderDetailResponse
  ) => {
    if (!isNumber(value) || value <= 0) return;

    if (value > record.productDetail.quantity) {
      return message.info(t("products.messages.limitReached"));
    }

    if (value !== record.quantity) {
      setViewOrder((prev) => setViewOrderWithValidation(prev, record, value));
    }
  };

  const handleRemoveItem = (record: IOrderDetailResponse) => {
    const newCartDetails = viewOrder.orderDetails.filter(
      (detail) => detail.id !== record.id
    );

    const newOriginMoney = newCartDetails.reduce(
      (accumulator, detail) => accumulator + detail.totalPrice,
      0
    );

    const newShippingMoney =
      newOriginMoney < FREE_SHIPPING_THRESHOLD
        ? shippingMoney === 0
          ? viewOrder.shippingMoney
          : shippingMoney
        : 0;

    const newTotalMoney =
      newOriginMoney + newShippingMoney - viewOrder.reduceMoney;

    if (newCartDetails.length === 0) {
      showWarningConfirmDialog({
        options: {
          message:
            "Loại bỏ sản phẩm duy nhất tương đương với việc huỷ đơn hàng",
          accept: () => {
            close();
            showCancel();
          },
          reject: () => {},
        },
        t: t,
      });
    } else {
      showWarningConfirmDialog({
        options: {
          accept: () => {
            setViewOrder((prev) => ({
              ...prev,
              orderDetails: newCartDetails,
              originMoney: newOriginMoney,
              shippingMoney: newShippingMoney,
              totalMoney: newTotalMoney,
            }));
          },
          reject: () => {},
        },
        t: t,
      });
    }
  };

  const columns: ColumnsType<IOrderDetailResponse> = [
    {
      title: t("image.image"),
      key: "image",
      dataIndex: ["productDetail", "image"],
      align: "center",
      render: (value) => (
        <Avatar
          size={{
            xs: 60,
            lg: 108,
            xl: 132,
            xxl: 144,
          }}
          shape="square"
          src={value ?? "default_image_url"}
        />
      ),
    },
    {
      title: t("products.titles.list"),
      key: "name",
      dataIndex: ["productDetail", "product", "name"],
      align: "start",
      render(_, record) {
        return (
          <div>
            <Link
              to={"/product/" + record.productDetail.product.id}
              style={{
                color: "black",
                fontWeight: "500",
              }}
            >
              {record.productDetail.product.name}
            </Link>
            <div className="cart-item-variation">
              <span>
                {t("colors.colors")}: {record.productDetail.color.name}
              </span>
              <br />
              <span>
                {t("sizes.sizes")}: {record.productDetail.size.name}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      dataIndex: "price",
      align: "center",
      render(value) {
        return (
          <>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              currencyDisplay: "symbol",
            }).format(value)}
          </>
        );
      },
    },
    {
      title: "Số lượng",
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
      render(value, record) {
        return (
          <InputNumber
            min={1}
            value={Number(value)}
            onChange={debounce(
              (value) => handleQuantityChange(value as number, record),
              300
            )}
          />
        );
      },
    },
    {
      title: "Thành tiền",
      key: "totalPrice",
      dataIndex: "totalPrice",
      align: "center",
      width: "200px",
      render(value) {
        return (
          <>
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              currencyDisplay: "symbol",
            }).format(value)}
          </>
        );
      },
    },
    {
      title: "Hành động",
      key: "quantity",
      dataIndex: "quantity",
      align: "center",
      width: "10%",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title={t("actions.delete")}>
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space align="baseline">
          <Title level={5}>{t("orders.modal.title")}</Title>
          <Tooltip title={t("orders.modal.tooltip")}>
            <InfoCircleOutlined />
          </Tooltip>
          <Button type="primary" onClick={advancedAddShow}>
            {t("products.titles.add")}
          </Button>
        </Space>
      }
      {...restModalProps}
      open={restModalProps.open}
      width="1200px"
      centered
      okText={t("actions.submitChanges")}
      onOk={handleOk}
    >
      <div className="row">
        <div className="col-12">
          <div className="table-content table-responsive cart-table-content">
            <Table
              pagination={false}
              rowKey="id"
              columns={columns}
              dataSource={viewOrder.orderDetails}
              footer={() => (
                <MyOrderModalFooter
                  viewOrder={viewOrder}
                  order={order}
                  setViewOrder={setViewOrder}
                />
              )}
            />
          </div>
        </div>
        <div className="col-12 mt-2">
          <Title level={5}>{t("orders.titles.show")}</Title>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              districtId: Number(viewOrder.address?.districtId),
              districtName: viewOrder.address?.districtName,
              wardCode: viewOrder.address?.wardCode,
              wardName: viewOrder.address?.wardName,
              provinceId: Number(viewOrder.address?.provinceId),
              provinceName: viewOrder.address?.provinceName,
              line: viewOrder.address?.more,
              fullName: viewOrder.fullName,
              phoneNumber: viewOrder.phoneNumber,
              email: viewOrder.customer?.email,
              orderNote: viewOrder.note,
            }}
          >
            <Form.Item label={t("orders.fields.code")}>
              <Input value={viewOrder.code} disabled />
            </Form.Item>
            <Form.Item
              label={t("orders.fields.fullName")}
              name="fullName"
              rules={[
                {
                  validator: validateFullName,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="E-mail"
              name="email"
              rules={[
                {
                  validator: validateEmail,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t("orders.fields.phoneNumber")}
              name="phoneNumber"
              rules={[
                {
                  validator: validatePhoneNumber,
                },
              ]}
            >
              <Input />
            </Form.Item>
            <AddressFormThree
              form={form}
              setShippingMoney={setShippingMoney}
              order={order}
            />
            <Form.Item label={t("orders.fields.note")} name="orderNote">
              <Input />
            </Form.Item>
          </Form>
        </div>
      </div>
      {advancedAddModalProps.open && (
        <AdvancedAddModal
          type="state"
          setViewOrder={setViewOrder}
          modalProps={advancedAddModalProps}
          close={advancedAddClose}
        />
      )}
    </Modal>
  );
};

export default MyOrderModal;
