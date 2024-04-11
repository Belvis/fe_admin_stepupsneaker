import { Edit, useForm } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import {
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
} from "antd";

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FieldLabel } from "../../components/form/FieldLabel";
import ImageUpload from "../../components/form/ImageUpload";
import PromotionProduct from "../../components/promotion/PromotionProduct";
import {
  LENGTH_CODE,
  LENGTH_NAME,
  LIMIT_VOUCHER_VALUE,
} from "../../constants/common";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { validateCommon } from "../../helpers/validate";
import { IPromotionResponse } from "../../interfaces";

const { RangePicker } = DatePicker;

export const PromotionEdit: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { formProps, saveButtonProps, formLoading, onFinish } =
    useForm<IPromotionResponse>({});

  const [shouldRefetch, setShouldRefetch] = useState(false);

  const startDate = Form.useWatch("startDate", formProps.form);
  const endDate = Form.useWatch("endDate", formProps.form);

  const handleOnFinish = (values: any) => {
    const data = {
      code: `${values.code}`,
      name: `${values.name}`,
      value: `${values.value}`,
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
                        fieldName={t("promotions.fields.name")}
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
                        fieldName={t("promotions.fields.code")}
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
                    label={t("promotions.fields.value")}
                    name="value"
                    required
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "value"),
                      },
                      {
                        validator(_, value) {
                          if (value > LIMIT_VOUCHER_VALUE) {
                            return Promise.reject(
                              t("validator.vouchers.exceed", {
                                length: LIMIT_VOUCHER_VALUE,
                              })
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      width={100}
                      className="w-100"
                      formatter={(value) => `${value}%`}
                      parser={(value: string | undefined) => {
                        const parsedValue = parseInt(
                          value!.replace("%", ""),
                          10
                        );
                        const newValue = isNaN(parsedValue) ? 0 : parsedValue;
                        return newValue;
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={t("promotions.fields.promotionRange")}
                    name="promotionRange"
                    required
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "promotionRange"),
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
          <Card style={{ height: "100%" }}>
            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex" }}
            >
              <PromotionProduct
                type="eligible"
                shouldRefetch={shouldRefetch}
                setShouldRefetch={setShouldRefetch}
              />
              <PromotionProduct
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
