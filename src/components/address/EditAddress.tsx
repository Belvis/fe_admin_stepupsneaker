import React, { useEffect } from "react";
import { Form, Modal, Grid, ModalProps, FormProps } from "antd";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { ICustomerResponse } from "../../interfaces";
import { useTranslate } from "@refinedev/core";
import { AddressForm } from "../form/AddressForm";

type EditAddressProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
  customer: ICustomerResponse;
};

export const EditAddress: React.FC<EditAddressProps> = ({
  modalProps,
  formProps,
  onFinish,
  customer,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();
  const provinceId = Form.useWatch("provinceId", formProps.form);
  const districtId = Form.useWatch("districtId", formProps.form);

  useEffect(() => {
    formProps.form?.setFieldValue("provinceId", Number(provinceId));
    formProps.form?.setFieldValue("districtId", Number(districtId));
  }, [provinceId && districtId]);

  const onFinishHandler = (values: any) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          const updatedValues = {
            ...values,
            customer: customer?.id,
            phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
            districtId: formProps.form?.getFieldValue("districtId"),
            districtName: formProps.form?.getFieldValue("districtName"),
            provinceId: formProps.form?.getFieldValue("provinceId"),
            provinceName: formProps.form?.getFieldValue("provinceName"),
            wardCode: formProps.form?.getFieldValue("wardCode"),
            wardName: formProps.form?.getFieldValue("wardName"),
            more: formProps.form?.getFieldValue("more"),
          };
          onFinish(updatedValues);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <Modal
      {...modalProps}
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1002}
    >
      <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
        <AddressForm formProps={formProps} />
      </Form>
    </Modal>
  );
};
