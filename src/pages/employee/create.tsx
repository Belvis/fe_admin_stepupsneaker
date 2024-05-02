import { Create, useForm, useModal, useSelect } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import { Button, Col, Divider, Flex, Form, Input, Row, Select } from "antd";

import { useState } from "react";
import { FieldLabel } from "../../components/form/FieldLabel";
import ImageUpload from "../../components/form/ImageUpload";
import { QRScannerModal } from "../../components/qr-scanner/QRScannerModal";
import { getCustomerGenderOptions } from "../../constants/gender";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { parseQRCodeResult } from "../../helpers/qrCode";
import {
  validateCommon,
  validateEmail,
  validateFullName,
  validatePhoneNumber,
} from "../../helpers/validate";
import { IEmployeeResponse, IRoleResponse } from "../../interfaces";
import {
  LENGTH_DESCRIPTION,
  LENGTH_EMAIL,
  LENGTH_NAME,
  LENGTH_PHONE,
} from "../../constants/common";

const { TextArea } = Input;

export const EmployeeCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<IEmployeeResponse>();

  const { selectProps: roleSelectProps } = useSelect<IRoleResponse>({
    resource: "roles",
    optionLabel: "name",
    optionValue: "id",
  });

  const renderOptions = () => {
    if (!roleSelectProps.options) return [];

    return roleSelectProps.options.map((option) => ({
      ...option,
      label: t(`roles.${option.label}`),
    }));
  };

  const {
    show: scanShow,
    close: scanClose,
    modalProps: scanModalProps,
  } = useModal();

  const handleScanSuccess = (result: string) => {
    const qrResult = parseQRCodeResult(result);
    formProps.form?.setFieldsValue({
      fullName: qrResult.fullName,
      gender: qrResult.gender,
      address: qrResult.address,
    });
  };

  const handleOnFinish = (values: any) => {
    const submitData = {
      fullName: `${values.fullName}`,
      email: `${values.email}`,
      status: "ACTIVE",
      gender: `${values.gender}`,
      address: `${values.address}`,
      phoneNumber: `${values.phoneNumber}`,
      image: `${values.image}`,
      role: `${values.role}`,
      password: `password123`,
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
      <Create
        isLoading={formLoading}
        saveButtonProps={saveButtonProps}
        headerButtons={() => (
          <>
            <Button
              type="primary"
              onClick={() => {
                scanShow();
              }}
            >
              {t("buttons.scanQR")}
            </Button>
          </>
        )}
      >
        <Form
          {...formProps}
          style={{ marginTop: 30 }}
          layout="vertical"
          onFinish={handleOnFinish}
        >
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
                        fieldName={t("employees.fields.fullName")}
                        maxLength={LENGTH_NAME}
                        t={t}
                      />
                    }
                    name="fullName"
                    required
                    rules={[
                      {
                        validator: validateFullName,
                      },
                      {
                        whitespace: true,
                      },
                    ]}
                  >
                    <Input maxLength={LENGTH_NAME} showCount />
                  </Form.Item>
                  <Form.Item
                    label={
                      <FieldLabel
                        fieldName={t("employees.fields.email")}
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
                      {
                        whitespace: true,
                      },
                    ]}
                  >
                    <Input maxLength={LENGTH_EMAIL} showCount />
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    label={
                      <FieldLabel
                        fieldName={t("employees.fields.phoneNumber")}
                        maxLength={LENGTH_PHONE}
                        t={t}
                      />
                    }
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
                  <Flex gap="middle">
                    <Form.Item
                      className="w-100"
                      label={t("employees.fields.role")}
                      name={["role"]}
                      required
                    >
                      <Select
                        {...roleSelectProps}
                        placeholder={t("employees.fields.role")}
                        options={renderOptions()}
                      />
                    </Form.Item>
                    <Form.Item
                      className="w-100"
                      label={t("employees.fields.gender.label")}
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
                        placeholder={t("employees.fields.gender.placeholder")}
                        options={getCustomerGenderOptions(t)}
                      />
                    </Form.Item>
                  </Flex>
                </Col>
              </Row>
              <Divider orientation="left">{t("customers.addresses")}</Divider>
              <Row gutter={10}>
                <Col xs={24} lg={24}>
                  <Form.Item
                    label={
                      <FieldLabel
                        fieldName={t("employees.fields.address")}
                        maxLength={LENGTH_DESCRIPTION}
                        t={t}
                      />
                    }
                    required
                    name="address"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "address"),
                      },
                    ]}
                  >
                    <TextArea
                      rows={3}
                      maxLength={LENGTH_DESCRIPTION}
                      showCount
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
        {scanModalProps.open && (
          <QRScannerModal
            modalProps={scanModalProps}
            close={scanClose}
            onScanSuccess={handleScanSuccess}
          />
        )}
      </Create>
    </>
  );
};
