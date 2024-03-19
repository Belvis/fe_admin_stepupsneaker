import { CreateButton, useModalForm, useSimpleList } from "@refinedev/antd";
import { useTranslate } from "@refinedev/core";
import { List as AntdList, Col, Grid, Input, Modal, Row } from "antd";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import {
  IAddressResponse,
  ICustomerResponse,
  IOrderResponse,
} from "../../interfaces";
import AddressItem from "./AddressItem";
import { CreateAddress } from "./CreateAddress";
import { EditAddress } from "./EditAddress";

type AddressModalProps = {
  open: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  customer: ICustomerResponse;
  setAddresses?: (order: IOrderResponse) => void;
  order?: IOrderResponse;
};

export const AddressModal: React.FC<AddressModalProps> = ({
  open,
  handleOk,
  handleCancel,
  customer,
  order,
  setAddresses: setViewAddress,
}) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const [value, setValue] = useState<string>();

  const {
    listProps,
    queryResult: { refetch },
  } = useSimpleList<IAddressResponse>({
    resource: "addresses",
    filters: {
      permanent: [
        {
          field: "customer",
          operator: "eq",
          value: customer.id,
        },
        {
          field: "q",
          operator: "eq",
          value: value,
        },
      ],
    },
  });

  useEffect(() => {
    if (open) refetch();
  }, [value, open]);

  const {
    modalProps: createModalProps,
    formProps: createFormProps,
    show: createModalShow,
    onFinish: createOnFinish,
    close: createClose,
  } = useModalForm<IAddressResponse>({
    resource: "addresses",
    action: "create",
    onMutationSuccess: () => {
      createFormProps.form?.resetFields();
      refetch();
      createClose();
    },
    redirect: false,
    warnWhenUnsavedChanges: false,
  });

  const {
    modalProps: editModalProps,
    formProps: editFormProps,
    show: editModalShow,
    onFinish: editOnFinish,
    close: editClose,
  } = useModalForm<IAddressResponse>({
    resource: "addresses",
    action: "edit",
    onMutationSuccess: () => {
      editFormProps.form?.resetFields();
      refetch();
      editClose();
    },
    redirect: false,
    warnWhenUnsavedChanges: false,
  });

  function renderItem(item: IAddressResponse) {
    return (
      <AddressItem
        item={item}
        editModalShow={editModalShow}
        callBack={refetch}
        customer={customer}
        order={order}
        setViewAddress={setViewAddress}
      />
    );
  }

  const debouncedSearch = debounce((val, setValueFn) => setValueFn(val), 300);

  return (
    <Modal
      title={t("customers.fields.address")}
      width={breakpoint.sm ? "700px" : "100%"}
      zIndex={1001}
      onOk={handleOk}
      onCancel={handleCancel}
      open={open}
      footer={<></>}
    >
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <Row gutter={[16, 24]}>
            <Col span={18}>
              <Input
                placeholder={t("addresses.filters.search.placeholder")}
                onChange={(e) => {
                  debouncedSearch(e.target.value, setValue);
                }}
              />
            </Col>
            <Col span={6}>
              <CreateButton
                style={{ width: "100%" }}
                onClick={() => {
                  createFormProps.form?.resetFields();
                  createModalShow();
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <AntdList
            bordered
            {...listProps}
            pagination={false}
            itemLayout="horizontal"
            renderItem={renderItem}
          />
        </Col>
      </Row>
      <CreateAddress
        onFinish={createOnFinish}
        modalProps={createModalProps}
        formProps={createFormProps}
        customer={customer}
      />
      <EditAddress
        modalProps={editModalProps}
        formProps={editFormProps}
        onFinish={editOnFinish}
        customer={customer}
      />
    </Modal>
  );
};
