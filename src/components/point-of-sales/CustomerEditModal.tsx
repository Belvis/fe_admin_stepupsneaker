import { useForm } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import {
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
import dayjs from "dayjs";
import { getCustomerGenderOptions } from "../../constants/gender";
import { getCustomerStatusOptions } from "../../constants/status";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import {
  validateCommon,
  validateEmail,
  validateFullName,
} from "../../helpers/validate";
import { IAddressResponse, ICustomerResponse } from "../../interfaces";
import { AddressForm } from "../form/AddressForm";
import ImageUpload from "../form/ImageUpload";
import { useEffect } from "react";
import { FieldLabel } from "../form/FieldLabel";
import { LENGTH_EMAIL, LENGTH_NAME } from "../../constants/common";

type CustomerEditModalProps = {
  modalProps: ModalProps;
  id: string;
  close: () => void;
  callBack: any;
};

export const CustomerEditModal: React.FC<CustomerEditModalProps> = ({
  modalProps,
  callBack,
  close,
  id,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<ICustomerResponse>({
      resource: "customers",
      action: "edit",
      id: id,
      redirect: false,
      onMutationSuccess: (data: any) => {
        close();
        callBack();
      },
    });

  useEffect(() => {
    formProps.form?.setFieldValue(
      "addressList",
      formProps.initialValues?.addressList
    );
    formProps.form?.setFieldValue(
      "dateOfBirth",
      formProps.initialValues?.dateOfBirth
    );
  }, [formProps.initialValues]);
  useEffect(() => {
    const addressList = formProps.form?.getFieldValue("addressList");
    const dateOfBirth = formProps.form?.getFieldValue("dateOfBirth");

    console.log("addressList", addressList);
    console.log("dateOfBirth", dateOfBirth);
    console.log("formProps", formProps.initialValues);

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
                  name="dob"
                  rules={[
                    {
                      validator: (_, value) =>
                        validateCommon(_, value, t, "dateOfBirth"),
                    },
                  ]}
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
                <Row gutter={10}>
                  <Col span={12}>
                    <Form.Item
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
                  <Col span={12}>
                    <Form.Item
                      label={t("customers.fields.status")}
                      name="status"
                      rules={[
                        {
                          validator: (_, value) =>
                            validateCommon(_, value, t, "status"),
                        },
                      ]}
                    >
                      <Select
                        placeholder={t(
                          "customers.fields.status.statusPlaceholder"
                        )}
                        options={getCustomerStatusOptions(t)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
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
    </Modal>
  );
};
