import { Create, useForm, useModal } from "@refinedev/antd";
import { IResourceComponentsProps, useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Select,
} from "antd";

import dayjs from "dayjs";
import { AddressForm } from "../../components/form/AddressForm";
import { FieldLabel } from "../../components/form/FieldLabel";
import ImageUpload from "../../components/form/ImageUpload";
import { QRScannerModal } from "../../components/qr-scanner/QRScannerModal";
import { LENGTH_EMAIL, LENGTH_NAME } from "../../constants/common";
import { getCustomerGenderOptions } from "../../constants/gender";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { parseQRCodeResult } from "../../helpers/qrCode";
import {
  validateCommon,
  validateEmail,
  validateFullName,
} from "../../helpers/validate";
import { ICustomerResponse } from "../../interfaces";
import { disabledDate } from "./shared";

export const CustomerCreate: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<ICustomerResponse>();

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
      dateOfBirth: dayjs(new Date(qrResult.dob)),
      more: qrResult.address,
    });
  };

  const handleOnFinish = (values: any) => {
    const submitData = {
      fullName: `${values.fullName}`,
      email: `${values.email}`,
      dateOfBirth: `${values.dateOfBirth.valueOf()}`,
      status: "ACTIVE",
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
                    label={t("customers.fields.dateOfBirth")}
                    required
                    name="dateOfBirth"
                    rules={[
                      {
                        validator: (_, value) =>
                          validateCommon(_, value, t, "dateOfBirth"),
                      },
                    ]}
                    initialValue={dayjs().subtract(10, "year")}
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
