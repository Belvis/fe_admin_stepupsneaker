import { Edit, useForm } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import {
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
} from "antd";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FieldLabel } from "../../components/form/FieldLabel";
import ImageUpload from "../../components/form/ImageUpload";
import VoucherCustomer from "../../components/voucher/VoucherCustomer";
import {
  LENGTH_CODE,
  LENGTH_NAME,
  LIMIT_VOUCHER_VALUE,
} from "../../constants/common";
import { getVoucherStatusOptions } from "../../constants/status";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { validateCommon } from "../../helpers/validate";
import { IVoucherResponse } from "../../interfaces";

const { RangePicker } = DatePicker;

export const VoucherEdit: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { formProps, saveButtonProps, onFinish, formLoading } =
    useForm<IVoucherResponse>();
  const startDate = Form.useWatch("startDate", formProps.form);
  const endDate = Form.useWatch("endDate", formProps.form);
  const type = Form.useWatch("type", formProps.form);

  const [shouldRefetch, setShouldRefetch] = useState(false);

  const handleOnFinish = (values: any) => {
    const data = {
      code: `${values.code}`,
      name: `${values.name}`,
      status: `${values.status}`,
      type: `${values.type}`,
      value: `${values.value}`,
      constraint: `${values.constraint}`,
      quantity: `${values.quantity}`,
      startDate: `${startDate}`,
      endDate: `${endDate}`,
      image: `${values.image}`,
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(data);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  useEffect(() => {
    if (startDate && endDate && formProps.form && !formLoading) {
      const voucherRange = [
        dayjs(startDate).isValid() ? dayjs(startDate) : null,
        dayjs(endDate).isValid() ? dayjs(endDate) : null,
      ];
      formProps.form.setFieldsValue({ voucherRange });
    }
  }, [startDate, endDate]);

  return (
    <>
      <Row gutter={[16, 24]}>
        <Col span={8}>
          <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
            <Form {...formProps} layout="vertical" onFinish={handleOnFinish}>
              <Row gutter={20}>
                <Col span={24}>
                  <ImageUpload formProps={formProps} />
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={
                      <FieldLabel
                        fieldName={t("vouchers.fields.name")}
                        maxLength={LENGTH_NAME}
                        t={t}
                      />
                    }
                    required
                    name="name"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "name"),
                      },
                    ]}
                  >
                    <Input maxLength={LENGTH_NAME} showCount />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FieldLabel
                        fieldName={t("vouchers.fields.code")}
                        maxLength={LENGTH_CODE}
                        t={t}
                      />
                    }
                    required
                    name="code"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "code"),
                      },
                    ]}
                  >
                    <Input maxLength={LENGTH_CODE} showCount />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.value")}
                    name="value"
                    required
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "value"),
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const typeValue = getFieldValue("type");

                          if (
                            typeValue === "PERCENTAGE" &&
                            value > LIMIT_VOUCHER_VALUE
                          ) {
                            return Promise.reject(
                              t("validator.vouchers.exceed", {
                                length: LIMIT_VOUCHER_VALUE,
                              })
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      min={1}
                      formatter={(value) =>
                        `${
                          type === "PERCENTAGE" ? value + "%" : `₫ ${value}`
                        }`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: string | undefined) => {
                        if (type === "PERCENTAGE") {
                          const parsedValue = parseInt(
                            value!.replace("%", ""),
                            10
                          );
                          const newValue = isNaN(parsedValue) ? 0 : parsedValue;
                          return newValue;
                        } else {
                          const parsedValue = parseInt(
                            value!.replace(/₫\s?|(,*)/g, ""),
                            10
                          );
                          const newValue = isNaN(parsedValue) ? 0 : parsedValue;
                          return newValue;
                        }
                      }}
                      className="w-100"
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.constraint")}
                    name="constraint"
                    required
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "constraint"),
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      width={100}
                      className="w-100"
                      formatter={(value) =>
                        `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value: string | undefined) => {
                        const parsedValue = parseInt(
                          value!.replace(/₫\s?|(,*)/g, ""),
                          10
                        );
                        const newValue = isNaN(parsedValue) ? 0 : parsedValue;
                        return newValue;
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.quantity")}
                    name="quantity"
                    required
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "quantity"),
                      },
                    ]}
                  >
                    <InputNumber min={1} width={100} className="w-100" />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.voucherRange")}
                    name="voucherRange"
                    required
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "voucherRange"),
                      },
                    ]}
                    initialValue={[dayjs(startDate), dayjs(endDate)]}
                  >
                    <RangePicker
                      showTime={{ format: "HH:mm:ss" }}
                      format="YYYY-MM-DD HH:mm"
                      className="w-100"
                      disabledDate={(current) =>
                        dayjs(current).isBefore(dayjs().startOf("day"))
                      }
                      onChange={(dates) => {
                        if (dates && dates.length === 2) {
                          const [start, end] = dates;
                          if (
                            start &&
                            end &&
                            start.isValid() &&
                            end.isValid()
                          ) {
                            formProps.form?.setFieldValue(
                              "startDate",
                              start.valueOf()
                            );
                            formProps.form?.setFieldValue(
                              "endDate",
                              end.valueOf()
                            );
                          }
                        }
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.type")}
                    name="type"
                    required
                  >
                    <Radio.Group>
                      <Radio value={"PERCENTAGE"}>
                        {t("vouchers.type.PERCENTAGE")}
                      </Radio>
                      <Radio value={"CASH"}>{t("vouchers.type.CASH")}</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    label={t("vouchers.fields.status")}
                    name="status"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "status"),
                      },
                    ]}
                  >
                    <Select options={getVoucherStatusOptions(t)} />
                  </Form.Item>
                  <Form.Item hidden name="startDate">
                    <Input />
                  </Form.Item>
                  <Form.Item hidden name="endDate">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Edit>
        </Col>
        <Col span={16}>
          <Card className="h-100">
            <Space className="d-flex" direction="vertical" size="middle">
              <VoucherCustomer
                type="eligible"
                shouldRefetch={shouldRefetch}
                setShouldRefetch={setShouldRefetch}
              />
              <VoucherCustomer
                type="ineligible"
                shouldRefetch={shouldRefetch}
                setShouldRefetch={setShouldRefetch}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </>
  );
};
