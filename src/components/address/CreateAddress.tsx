import { useTranslate } from "@refinedev/core";
import { Form, FormProps, Grid, Modal, ModalProps } from "antd";
import { ICustomerResponse } from "../../interfaces";
import { AddressForm } from "../form/AddressForm";
import { showWarningConfirmDialog } from "../../helpers/confirm";

type CreateAddressProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  onFinish: (values: any) => void;
  customer: ICustomerResponse;
};

export const CreateAddress: React.FC<CreateAddressProps> = ({
  modalProps,
  formProps,
  onFinish,
  customer,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

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
            isDefault: false,
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
