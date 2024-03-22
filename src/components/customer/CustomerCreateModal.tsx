import { useTranslate } from "@refinedev/core";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Grid,
  Input,
  Modal,
  ModalProps,
  Row,
  Select,
} from "antd";

import { useForm, useModal } from "@refinedev/antd";
import dayjs from "dayjs";

import { QrcodeOutlined } from "@ant-design/icons";
import { getCustomerGenderOptions } from "../../constants/gender";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { parseQRCodeResult } from "../../helpers/qrCode";
import {
  validateCommon,
  validateEmail,
  validateFullName,
} from "../../helpers/validate";
import { ICustomerResponse } from "../../interfaces";
import { AddressForm } from "../form/AddressForm";
import ImageUpload from "../form/ImageUpload";
import { QRScannerModal } from "../qr-scanner/QRScannerModal";
import { FieldLabel } from "../form/FieldLabel";
import { LENGTH_EMAIL, LENGTH_NAME } from "../../constants/common";

type CustomerCreateModalProps = {
  modalProps: ModalProps;
  close: () => void;
  callBack: any;
};

export const CustomerCreateModal: React.FC<CustomerCreateModalProps> = ({
  modalProps,
  callBack,
  close,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<ICustomerResponse>({
      resource: "customers",
      redirect: false,
      onMutationSuccess: (data, variables, context, isAutoSave) => {
        close();
        callBack();
      },
    });

  const {
    show: scanShow,
    close: scanClose,
    modalProps: scanModalProps,
  } = useModal();

  const handleScanSuccess = (result: string) => {
    const qrResult = parseQRCodeResult(result);
    console.log(qrResult);
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
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
      okButtonProps={saveButtonProps}
      confirmLoading={formLoading}
    >
      <Form
        {...formProps}
        style={{ marginTop: 30 }}
        layout="vertical"
        onFinish={handleOnFinish}
      >
        <Row justify="end">
          <Button
            icon={<QrcodeOutlined />}
            type="primary"
            onClick={() => {
              scanShow();
            }}
          >
            {t("buttons.scanQR")}
          </Button>
        </Row>
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
                  name="fullName"
                  rules={[
                    {
                      validator: validateFullName,
                    },
                  ]}
                  required
                >
                  <Input maxLength={LENGTH_NAME} showCount />
                </Form.Item>
                <Form.Item
                  required
                  label={
                    <FieldLabel
                      fieldName={t("customers.fields.email")}
                      maxLength={LENGTH_EMAIL}
                      t={t}
                    />
                  }
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
                  required
                  label={t("customers.fields.dateOfBirth")}
                  name="dateOfBirth"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "dateOfBirth"),
                    },
                  ]}
                  initialValue={dayjs().subtract(10, "year")}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) => {
                      const tenYearsAgo = dayjs().subtract(10, "year");
                      const hundredYearsAgo = dayjs().subtract(100, "year");

                      return (
                        current &&
                        (current > tenYearsAgo || current < hundredYearsAgo)
                      );
                    }}
                  />
                </Form.Item>
                <Form.Item
                  required
                  label={t("customers.fields.gender.label")}
                  name="gender"
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
            <Divider orientation="left" style={{ color: "#000000" }}>
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
    </Modal>
  );
};
