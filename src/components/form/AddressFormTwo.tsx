import { useForm } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import { Button, Card, Form, Spin } from "antd";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { IAddressResponse } from "../../interfaces";
import { AddressForm } from "./AddressForm";

type AddressFormTwoProps = {
  callBack: any;
  address: IAddressResponse;
  loading: boolean;
};

export const AddressFormTwo: React.FC<AddressFormTwoProps> = ({
  callBack: refetch,
  address,
  loading,
}) => {
  const t = useTranslate();

  const { formProps, onFinish, formLoading } = useForm<IAddressResponse>({
    id: address.id,
    resource: "addresses",
    action: "edit",
    onMutationSuccess: () => {
      refetch();
    },
  });

  const onFinishHandler = (values: any) => {
    showWarningConfirmDialog({
      options: {
        accept: () => {
          const updatedValues = {
            ...values,
            customer: address.id,
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
    <Card>
      <Spin spinning={formLoading || loading}>
        <Form {...formProps} layout="vertical" onFinish={onFinishHandler}>
          <AddressForm formProps={formProps} />
          <Form.Item className="text-end mt-3">
            <Button
              className="w-25"
              type="primary"
              htmlType="submit"
              loading={formLoading || loading}
              block
            >
              {t("buttons.save")}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};
