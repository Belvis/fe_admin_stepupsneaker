import { Edit, useForm } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Col, DatePicker, Divider, Form, Input, Row, Select } from "antd";

import dayjs from "dayjs";
import { AddressForm } from "../../components/form/AddressForm";
import { FieldLabel } from "../../components/form/FieldLabel";
import ImageUpload from "../../components/form/ImageUpload";
import { LENGTH_EMAIL, LENGTH_NAME } from "../../constants/common";
import { getCustomerGenderOptions } from "../../constants/gender";
import { getCustomerStatusOptions } from "../../constants/status";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import {
  validateCommon,
  validateEmail,
  validateFullName,
} from "../../helpers/validate";
import { IAddressResponse, ICustomerResponse } from "../../interfaces";
import { useEffect } from "react";
import { disabledDate } from "./shared";

export const CustomerEdit: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<ICustomerResponse>();

  useEffect(() => {
    const addressList = formProps.form?.getFieldValue("addressList");
    const dateOfBirth = formProps.form?.getFieldValue("dateOfBirth");
    if (addressList) {
      const defaultAddress = addressList.find(
        (address: IAddressResponse) => address.isDefault === true
      );

      if (defaultAddress) {
        formProps.form?.setFieldsValue({
          phoneNumber: defaultAddress.phoneNumber,
          provinceId: Number(defaultAddress.provinceId),
          districtId: Number(defaultAddress.districtId),
          wardCode: defaultAddress.wardCode,
          more: defaultAddress.more,
        });
      }
    }
    if (dateOfBirth) {
      formProps.form?.setFieldValue("dob", dayjs(new Date(dateOfBirth)));
    }
  }, [formProps.form && formLoading]);

  const handleOnFinish = (values: any) => {
    const submitData = {
      fullName: `${values.fullName}`,
      email: `${values.email}`,
      dateOfBirth: `${values.dob.valueOf()}`,
      status: values.status,
      gender: `${values.gender}`,
      image: `${values.image}`,
      address: {
        phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
        districtId: formProps.form?.getFieldValue("districtId"),
        districtName: formProps.form?.getFieldValue("districtName"),
        provinceId: formProps.form?.getFieldValue("provinceId"),
        provinceName: formProps.form?.getFieldValue("provinceName"),
        wardCode: formProps.form?.getFieldValue("wardCode"),
        wardName: formProps.form?.getFieldValue("wardName"),
        more: formProps.form?.getFieldValue("more"),
      },
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

  return (
    <>
      <Edit isLoading={formLoading} saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical" onFinish={handleOnFinish}>
          <Row gutter={20}>
            <Col xs={24} lg={8}>
              <ImageUpload formProps={formProps} />
            </Col>
            <Col xs={24} lg={16}>
              <Row gutter={10}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={
                      <FieldLabel
                        fieldName={t("customers.fields.fullName")}
                        maxLength={LENGTH_NAME}
                        t={t}
                      />
                    }
                    required
                    name="fullName"
                    rules={[
                      {
                        validator: validateFullName,
                      },
                    ]}
                  >
                    <Input maxLength={LENGTH_NAME} showCount />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FieldLabel
                        fieldName={t("customers.fields.email")}
                        maxLength={LENGTH_EMAIL}
                        t={t}
                      />
                    }
                    required
                    name="email"
                    rules={[
                      {
                        validator: validateEmail,
                      },
                    ]}
                  >
                    <Input maxLength={LENGTH_EMAIL} showCount />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={t("customers.fields.dateOfBirth")}
                    required
                    name="dob"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "dateOfBirth"),
                      },
                    ]}
                  >
                    <DatePicker className="w-100" disabledDate={disabledDate} />
                  </Form.Item>
                  <Form.Item
                    label={t("customers.fields.gender.label")}
                    name="gender"
                    required
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "gender"),
                      },
                    ]}
                  >
                    <Select
                      placeholder={t("customers.fields.gender.placeholder")}
                      options={getCustomerGenderOptions(t)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Divider orientation="left">
                {t("customers.fields.address")}
              </Divider>
              <AddressForm formProps={formProps} />
            </Col>
          </Row>
          <Form.Item name="addressList" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="dateOfBirth" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Edit>
    </>
  );
};
