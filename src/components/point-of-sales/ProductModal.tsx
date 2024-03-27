import { useCreate, useTranslate } from "@refinedev/core";
import {
  Badge,
  Button,
  Col,
  Flex,
  Grid,
  Image,
  InputNumber,
  Modal,
  ModalProps,
  Row,
  Space,
  Tag,
  Typography,
  message,
  App,
} from "antd";

import { NumberField } from "@refinedev/antd";
import { Fragment, useEffect, useState } from "react";
import { AiFillMinusCircle, AiFillPlusCircle } from "react-icons/ai";
import { initializeProductClient } from "../../helpers/mapper";
import { IProductData, IProductResponse } from "../../interfaces";
import { SaleIcon } from "../icons/icon-sale";
import { Quantity } from "./styled";
import { getDiscountPrice } from "../../helpers/money";
const { Text, Title, Paragraph } = Typography;

type ProductModalProps = {
  modalProps: ModalProps;
  close: () => void;
  orderId?: string;
  product: IProductResponse;
  callBack: () => void;
};

export const ProductModal: React.FC<ProductModalProps> = ({
  modalProps,
  close,
  orderId,
  product,
  callBack,
}) => {
  const t = useTranslate();
  const { message } = App.useApp();
  const breakpoint = Grid.useBreakpoint();

  const [qty, setQty] = useState(1);

  const decreaseQty = () => {
    if (qty <= 1) {
      message.error(t("products.messages.minReached"));
    }
    setQty(qty - 1);
  };

  const increaseQty = () => {
    if (qty >= 5) {
      message.error(t("products.messages.purchaseLimit"));
    }

    if (qty >= productStock) {
      message.error(t("products.messages.limitReached"));
    }
    setQty(qty + 1);
  };

  const [productData, setProductData] = useState<IProductData>(
    initializeProductClient(product)
  );

  const {
    productClient,
    initialSelectedColor,
    initialSelectedSize,
    initialProductStock,
  } = productData;

  const [selectedProductColor, setSelectedProductColor] =
    useState(initialSelectedColor);

  const [selectedProductSize, setSelectedProductSize] =
    useState(initialSelectedSize);

  const [selectedVariant, setSelectedVariant] = useState(
    productClient.variation[0]
  );

  const [productStock, setProductStock] = useState(initialProductStock);

  const { mutate: mutateCreate, isLoading } = useCreate();

  const handleFinish = () => {
    if (selectedVariant) {
      mutateCreate(
        {
          resource: "order-details",
          values: [
            {
              productDetail: selectedProductSize.productDetailId,
              order: orderId,
              quantity: qty,
              price: selectedProductSize.price,
              totalPrice: selectedProductSize.price * qty,
              status: "COMPLETED",
            },
          ],
          successNotification: () => {
            return false;
          },
          errorNotification: () => {
            return false;
          },
        },
        {
          onError: (error, variables, context) => {
            message.error(t("common.error") + error.message);
          },
          onSuccess: (data, variables, context) => {
            close();
            callBack();
            message.success(t("common.update.success"));
          },
        }
      );
    } else {
      message.error(t("orders.notification.product.add.notFound"));
    }
  };

  useEffect(() => {
    const selectedVariant = productClient.variation.find(
      (variation) => variation.color.id === selectedProductColor.id
    );
    if (selectedVariant) setSelectedVariant(selectedVariant);
  }, [selectedProductColor]);

  useEffect(() => {
    if (modalProps.open && product) {
      const initData = initializeProductClient(product);
      setProductData(initData);

      setSelectedProductColor(initData.initialSelectedColor);
      setSelectedProductSize(initData.initialSelectedSize);
      setProductStock(initData.initialProductStock);
    }
  }, [modalProps.open]);

  const discountedPrice = getDiscountPrice(
    selectedProductSize.price,
    selectedProductSize.discount
  );
  const finalProductPrice = +(selectedProductSize.price * 1);
  const finalDiscountedPrice = +(
    (discountedPrice ?? selectedProductSize.discount) * 1
  );

  return (
    <Modal
      {...modalProps}
      title={t("productDetails.productDetails")}
      width={breakpoint.sm ? "1000px" : "100%"}
      zIndex={1001}
      footer={<></>}
    >
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <Image src={productClient.image[0]} />
        </Col>
        <Col span={12}>
          <Flex gap="middle" vertical>
            <Col span={24}>
              <Title level={3}>
                {productClient.name} / #{productClient.code}
              </Title>
            </Col>
            <Col span={24}>
              <Title level={4} style={{ color: "red" }}>
                {discountedPrice !== null ? (
                  <Fragment>
                    <NumberField
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={finalDiscountedPrice}
                      locale={"vi"}
                    />
                    <NumberField
                      className="old"
                      options={{
                        currency: "VND",
                        style: "currency",
                      }}
                      value={finalProductPrice}
                      locale={"vi"}
                    />
                  </Fragment>
                ) : (
                  <NumberField
                    options={{
                      currency: "VND",
                      style: "currency",
                    }}
                    value={finalProductPrice}
                    locale={"vi"}
                  />
                )}
              </Title>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Text strong>Mô tả</Text>
                <Paragraph>{productClient.description}</Paragraph>
              </Space>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Space>
                  <Text strong>Màu sắc</Text>
                  <Text>{selectedProductColor.name}</Text>
                </Space>
                <Space>
                  {productClient.variation && (
                    <>
                      {productClient.variation.map((single, key) => {
                        const hasSale = single.size.some(
                          (size) =>
                            typeof size.discount === "number" &&
                            size.discount > 0
                        );

                        return (
                          <Badge
                            offset={[20, 0]}
                            key={key}
                            style={{
                              right: 0,
                            }}
                            count={
                              hasSale ? (
                                <SaleIcon
                                  style={{
                                    color: "red",
                                    fontSize: "24px",
                                    zIndex: 2,
                                  }}
                                />
                              ) : (
                                0
                              )
                            }
                          >
                            <Tag.CheckableTag
                              key={key}
                              checked={
                                selectedProductColor.id === single.color.id
                              }
                              style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                backgroundColor: "#" + single.color.code,
                                border:
                                  selectedProductColor.id === single.color.id
                                    ? "2px solid #fb5231"
                                    : "2px solid transparent",
                                boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
                              }}
                              onChange={() => {
                                setSelectedProductColor(single.color);
                                setSelectedProductSize(single.size[0]);
                                setProductStock(single.size[0].stock);
                                setQty(1);
                              }}
                            />
                          </Badge>
                        );
                      })}
                    </>
                  )}
                </Space>
              </Space>
            </Col>
            <Col span={24}>
              <Space direction="vertical">
                <Space>
                  <Text strong>Kích cỡ</Text>
                  <Text>{selectedProductSize.name}</Text>
                  <Text strong>Số lượng tồn</Text>
                  <Text style={{ color: productStock <= 0 ? "red" : "" }}>
                    {productStock}{" "}
                    {productStock <= 0 ? "Sản phẩm này đã hết hàng" : ""}
                  </Text>
                </Space>
                <Space>
                  {productClient.variation && (
                    <>
                      {productClient.variation.map((single) => {
                        return single.color.id === selectedProductColor.id
                          ? single.size.map((singleSize, key) => {
                              const hasSale = singleSize.discount > 0;
                              return (
                                <Badge
                                  count={
                                    hasSale ? (
                                      <SaleIcon
                                        style={{
                                          color: "red",
                                          fontSize: "24px",
                                          zIndex: 2,
                                        }}
                                      />
                                    ) : (
                                      0
                                    )
                                  }
                                >
                                  <Tag.CheckableTag
                                    key={key}
                                    checked={
                                      selectedProductSize.id === singleSize.id
                                    }
                                    style={{
                                      border:
                                        selectedProductSize.id === singleSize.id
                                          ? "1px solid #fb5231"
                                          : "1px solid #000000",
                                      borderRadius: "0",
                                      padding: "6px 12px",
                                    }}
                                    onChange={() => {
                                      setSelectedProductSize(singleSize);
                                      setProductStock(singleSize.stock);
                                      setQty(1);
                                    }}
                                  >
                                    {singleSize.name}
                                  </Tag.CheckableTag>
                                </Badge>
                              );
                            })
                          : "";
                      })}
                    </>
                  )}
                </Space>
              </Space>
            </Col>
            <Row align="middle">
              <Col span={12}>
                <Quantity>
                  <button onClick={decreaseQty} disabled={productStock <= 0}>
                    <AiFillMinusCircle />
                  </button>
                  <InputNumber
                    min={1}
                    value={qty}
                    disabled={productStock <= 0}
                  />
                  <button onClick={increaseQty} disabled={productStock <= 0}>
                    <AiFillPlusCircle />
                  </button>
                </Quantity>
              </Col>
              <Col span={12}>
                <Button
                  loading={isLoading}
                  type="primary"
                  onClick={handleFinish}
                  style={{ width: "100%" }}
                  disabled={productStock <= 0}
                >
                  Thêm vào giỏ
                </Button>
              </Col>
            </Row>
          </Flex>
        </Col>
      </Row>
    </Modal>
  );
};
