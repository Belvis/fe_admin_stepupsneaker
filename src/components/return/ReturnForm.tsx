import { NumberField, useModal } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useGetIdentity,
  useTranslate,
} from "@refinedev/core";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Table,
  Typography,
} from "antd";

import { ColumnsType } from "antd/es/table";
import { useContext, useEffect, useMemo, useState } from "react";
import { AddressFormThree } from "../../components/form/AddressFormThree";
import { ReturnInspectionModal } from "../../components/return/ReturnInspectionModal";
import { LENGTH_DESCRIPTION, LENGTH_PHONE } from "../../constants/common";
import {
  getDeliveryStatusOptions,
  getRefundStatusOptions,
} from "../../constants/status";
import {
  getReturnPaymentTypeOptions,
  getReturnTypeOptions,
} from "../../constants/type";
import { ReturnFormContext } from "../../contexts/return";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { validateCommon, validatePhoneNumber } from "../../helpers/validate";
import {
  IEmployeeResponse,
  IOrderResponse,
  IReturnFormDetailRequest,
  PaymentType,
  ReturnType,
} from "../../interfaces";
import _ from "lodash";
import { ReturnInspectionStatus } from "./ReturnInspectionStatus";

const { Title, Text } = Typography;

export const ReturnForm: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const {
    formProps,
    onFinish,
    selectedOrder,
    returnFormDetails,
    setReturnFormDetails,
  } = useContext(ReturnFormContext);

  const { data } = useGetIdentity<IEmployeeResponse>();

  const type: ReturnType = Form.useWatch("type", formProps.form);
  const paymentType: PaymentType = Form.useWatch("paymentType", formProps.form);
  const defaultAddress = selectedOrder?.customer?.addressList.find(
    (address) => address.isDefault
  );

  useEffect(() => {
    const calculateTotalMoney = () => {
      if (!returnFormDetails) {
        return 0;
      }

      let calculatedTotalMoney = 0;

      returnFormDetails.forEach(({ returnQuantity, unitPrice }) => {
        calculatedTotalMoney += returnQuantity * unitPrice;
      });

      return calculatedTotalMoney;
    };

    const totalMoney = formProps.form?.getFieldValue("amountToBePaid");
    const newTotalMoney = calculateTotalMoney();

    if (newTotalMoney !== totalMoney) {
      formProps.form?.setFieldValue("amountToBePaid", newTotalMoney);
    }
  }, [returnFormDetails]);

  useEffect(() => {
    if (defaultAddress) {
      formProps.form?.setFieldsValue({
        phoneNumber: defaultAddress.phoneNumber,
        provinceId: Number(defaultAddress.provinceId),
        districtId: Number(defaultAddress.districtId),
        wardCode: defaultAddress.wardCode,
        more: defaultAddress.more,
      });
    }
  }, [defaultAddress]);

  useEffect(() => {
    if (type) {
      if (type === "OFFLINE") {
        formProps.form?.setFieldsValue({
          deliveryStatus: "RECEIVED",
          refundStatus: "COMPLETED",
        });
      } else {
        formProps.form?.setFieldsValue({
          deliveryStatus: "PENDING",
          refundStatus: "PENDING",
        });
      }
    }
  }, [type]);

  useEffect(() => {
    if (selectedOrder) {
      const customer =
        selectedOrder?.fullName ??
        selectedOrder?.customer?.fullName ??
        t("invoices.retailCustomer");

      formProps.form?.setFieldsValue({
        customer,
        code: selectedOrder.code,
      });
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (data) {
      formProps.form?.setFieldsValue({
        employee: data.fullName,
      });
    }
  }, [data]);
  const [shippingMoney, setShippingMoney] = useState<number>(0);
  const [inspectionReturnDetail, setInspectionReturnDetail] =
    useState<IReturnFormDetailRequest>();

  const {
    show: inspectionShow,
    close: inspectionClose,
    modalProps: inspectionModalProps,
  } = useModal();

  const handleOnFinish = (values: any) => {
    const returnFormDetailsPayload = convertToPayloadFormat(returnFormDetails);

    const submitData = {
      address: {
        phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
        districtId: formProps.form?.getFieldValue("districtId"),
        districtName: formProps.form?.getFieldValue("districtName"),
        provinceId: formProps.form?.getFieldValue("provinceId"),
        provinceName: formProps.form?.getFieldValue("provinceName"),
        wardCode: formProps.form?.getFieldValue("wardCode"),
        wardName: formProps.form?.getFieldValue("wardName"),
        more: formProps.form?.getFieldValue("line"),
      },
      order: selectedOrder?.id,
      paymentType: formProps.form?.getFieldValue("paymentType"),
      paymentInfo: formProps.form?.getFieldValue("paymentInfo") ?? "Cash",
      type: formProps.form?.getFieldValue("type"),
      amountToBePaid: formProps.form?.getFieldValue("amountToBePaid"),
      returnFormDetails: returnFormDetailsPayload,
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(submitData);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  const columns = useMemo<ColumnsType<IReturnFormDetailRequest>>(
    () => [
      {
        title: "#",
        key: "createdAt",
        dataIndex: "createdAt",
        align: "center",
        sorter: {},
        render: (value, record, index) => index + 1,
      },
      {
        title: t("return-form-details.fields.orderCode"),
        sorter: {},
        key: "orderCode",
        dataIndex: "orderCode",
        align: "center",
      },
      {
        title: t("return-form-details.fields.quantity"),
        sorter: {},
        key: "returnQuantity",
        dataIndex: "returnQuantity",
        align: "center",
      },
      {
        title: t("return-form-details.fields.unitPrice"),
        sorter: {},
        key: "unitPrice",
        dataIndex: "unitPrice",
        align: "center",
        render: (value) => {
          return (
            <NumberField
              className="fw-bold"
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={value}
              locale={"vi"}
            />
          );
        },
      },
      {
        title: t("return-form-details.fields.totalPrice"),
        sorter: {},
        key: "totalPrice",
        dataIndex: "totalPrice",
        align: "center",
        render: (_, { unitPrice, returnQuantity }) => {
          return (
            <NumberField
              options={{
                currency: "VND",
                style: "currency",
              }}
              value={unitPrice * returnQuantity}
              locale={"vi"}
            />
          );
        },
      },
      {
        title: t("return-form-details.fields.returnInspectionStatus.label"),
        sorter: {},
        key: "returnInspectionStatus",
        dataIndex: "returnInspectionStatus",
        align: "center",
        render: (_, record) => {
          console.log("record", record);

          const status = Object.values(record).some(
            (value) => value === "" || value === undefined
          )
            ? "PENDING"
            : record.returnInspectionStatus;

          return <ReturnInspectionStatus status={status} />;
        },
      },
      {
        title: t("table.actions"),
        dataIndex: "actions",
        key: "actions",
        width: "10%",
        align: "center",
        render: (_, record) => (
          <Button
            onClick={() => {
              setInspectionReturnDetail(record);
              inspectionShow();
            }}
          >
            {t("buttons.inspect")}
          </Button>
        ),
      },
    ],
    [t]
  );

  return (
    <>
      <Form
        {...formProps}
        style={{ marginTop: 30 }}
        layout="horizontal"
        labelCol={{ span: 8 }}
        labelAlign="left"
        onFinish={handleOnFinish}
      >
        <div className="return-form mb-3">
          <Title level={5}>{t("return-forms.titles.form")}</Title>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label={t("return-forms.fields.code")} name="code">
                <Input
                  placeholder={t("return-forms.fields.employee.placeholder")}
                  disabled
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.employee.label")}
                name="employee"
              >
                <Input
                  placeholder={t("return-forms.fields.employee.placeholder")}
                  disabled
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.customer.label")}
                name="customer"
              >
                <Input
                  placeholder={t("return-forms.fields.customer.placeholder")}
                  disabled
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.phoneNumber")}
                required
                name="phoneNumber"
                rules={[
                  {
                    validator: validatePhoneNumber,
                  },
                ]}
              >
                <Input maxLength={LENGTH_PHONE} showCount />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.amountToBePaid")}
                required
                name="amountToBePaid"
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "amountToBePaid"),
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  disabled
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value: string | undefined) => {
                    const parsedValue = parseInt(
                      value!.replace(/₫\s?|(,*)/g, ""),
                      10
                    );
                    return isNaN(parsedValue) ? 0 : parsedValue;
                  }}
                  className="w-100"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("return-forms.fields.type.label")}
                name="type"
                required
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "returnType"),
                  },
                ]}
              >
                <Select
                  placeholder={t("return-forms.fields.type.placeholder")}
                  options={getReturnTypeOptions(t)}
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.deliveryStatus.label")}
                tooltip={t("return-forms.fields.deliveryStatus.tooltip")}
                name="deliveryStatus"
                required
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "deliveryStatus"),
                  },
                ]}
              >
                <Select
                  disabled={type === "OFFLINE"}
                  placeholder={t(
                    "return-forms.fields.deliveryStatus.placeholder"
                  )}
                  options={getDeliveryStatusOptions(t)}
                />
              </Form.Item>
              <Form.Item
                required
                label={t("return-forms.fields.paymentType.label")}
                tooltip={t("return-forms.fields.paymentType.tooltip")}
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "paymentType"),
                  },
                ]}
                name="paymentType"
              >
                <Select
                  placeholder={t("return-forms.fields.paymentType.placeholder")}
                  options={getReturnPaymentTypeOptions(t)}
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.refundStatus.label")}
                name="refundStatus"
                rules={[
                  {
                    validator: (_, value) =>
                      validateCommon(_, value, t, "refundStatus"),
                  },
                ]}
              >
                <Select
                  disabled
                  placeholder={t(
                    "return-forms.fields.refundStatus.placeholder"
                  )}
                  options={getRefundStatusOptions(t)}
                />
              </Form.Item>
              <Form.Item
                label={t("return-forms.fields.paymentInfo.label")}
                name="paymentInfo"
                required={paymentType === "Transfer"}
                rules={[
                  {
                    validator: (_, value) => {
                      if (paymentType === "Transfer") {
                        return validateCommon(_, value, t, "paymentInfo");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  disabled={paymentType === "Cash"}
                  placeholder={t("return-forms.fields.paymentInfo.placeholder")}
                  maxLength={LENGTH_DESCRIPTION / 2}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div className="return-details mb-3">
          <Row gutter={24}>
            <Col span={12}>
              <Title level={5} className="mb-3">
                {t("return-forms.titles.return-details")}
              </Title>
            </Col>
          </Row>
          <Table
            pagination={false}
            rowKey="id"
            columns={columns}
            dataSource={returnFormDetails}
            summary={(pageData) => {
              let totalQuantity = 0;
              let totalMoney = 0;

              pageData.forEach(({ returnQuantity, unitPrice }) => {
                totalQuantity += returnQuantity;
                totalMoney += returnQuantity * unitPrice;
              });

              formProps.form?.setFieldValue("amountToBePaid", totalMoney);
              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} className="text-center">
                      <Text className="fw-bold">Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}></Table.Summary.Cell>
                    <Table.Summary.Cell index={2} className="text-center">
                      <Text type="danger" className="fw-bold">
                        {totalQuantity}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}></Table.Summary.Cell>
                    <Table.Summary.Cell index={4} className="text-center">
                      <NumberField
                        className="fw-bold"
                        options={{
                          currency: "VND",
                          style: "currency",
                        }}
                        value={totalMoney}
                        locale={"vi"}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5}></Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
          />
        </div>
        {formProps.form && type != "OFFLINE" && (
          <div className="return-address">
            <Title level={5} className="mb-3">
              {t("return-forms.titles.return-address")}
            </Title>
            <AddressFormThree
              form={formProps.form}
              setShippingMoney={setShippingMoney}
              order={selectedOrder ?? ({} as IOrderResponse)}
              hideChooseAddress
            />
          </div>
        )}
      </Form>
      {inspectionModalProps.open && inspectionReturnDetail && (
        <ReturnInspectionModal
          modalProps={inspectionModalProps}
          close={inspectionClose}
          returnDetail={inspectionReturnDetail}
          setReturnFormDetails={setReturnFormDetails}
        />
      )}
    </>
  );
};

const convertToPayloadFormat = (
  returnFormDetails: IReturnFormDetailRequest[] | undefined
): any[] => {
  if (!returnFormDetails) return [];

  return returnFormDetails.map((detail) => {
    return {
      orderDetail: detail.orderDetail,
      quantity: detail.returnQuantity, // Lưu ý sử dụng returnQuantity thay vì quantity
      reason: detail.reason,
      feedback: detail.feedback,
      resellable: detail.resellable, // Lưu ý chuyển đổi tên thuộc tính
      image: detail.evidence, // Sử dụng evidence thay vì image
    };
  });
};
