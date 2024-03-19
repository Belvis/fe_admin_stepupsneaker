import { IResourceComponentsProps, useShow } from "@refinedev/core";
import { Col, Row, Spin } from "antd";
import React, { Fragment } from "react";
import { CustomerAddressList } from "../../components/customer/CustomerAddressList";
import { CustomerOrderList } from "../../components/customer/CustomerOrderList";
import CustomerCard from "../../components/customer/CustomerProfile";
import { CustomerVoucherList } from "../../components/customer/CustomerVoucherList";
import { ICustomerResponse } from "../../interfaces";

export const CustomerShow: React.FC<IResourceComponentsProps> = () => {
  const {
    queryResult: { refetch: refetchCustomer, data, isLoading },
  } = useShow<ICustomerResponse>();

  const customer = data?.data;

  return (
    <Spin spinning={isLoading}>
      <Row gutter={[16, 16]}>
        <Col xl={6} lg={24} xs={24}>
          <CustomerCard customer={customer} />
        </Col>
        <Col xl={18} xs={24}>
          {customer && (
            <Fragment>
              <CustomerOrderList id={customer.id} />
              <CustomerVoucherList id={customer.id} />
              <CustomerAddressList
                isLoading={isLoading}
                customer={customer}
                callBack={refetchCustomer}
              />
            </Fragment>
          )}
        </Col>
      </Row>
    </Spin>
  );
};
