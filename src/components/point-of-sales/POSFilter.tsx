import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useCheckboxGroup } from "@refinedev/antd";
import { HttpError, useList, useTranslate } from "@refinedev/core";
import {
  Button,
  Checkbox,
  Col,
  Collapse,
  CollapseProps,
  Drawer,
  Flex,
  Grid,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useContext, useEffect, useState } from "react";
import {
  DirectSalesContext,
  FilterType,
  blankFilters,
} from "../../contexts/point-of-sales/direct-sales";
import { IColorResponse, IProdAttributeResponse } from "../../interfaces";
import {
  ColorIcon,
  MaterialIcon,
  SizeIcon,
  SoleIcon,
  StyleIcon,
  TradeMarkIcon,
} from "../icons";
import _ from "lodash";
import { AnimatePresence, motion } from "framer-motion";

const { Title } = Typography;

type POSFilterProps = {
  open: boolean;
  onClose: () => void;
};

export const POSFilter: React.FC<POSFilterProps> = ({ open, onClose }) => {
  const t = useTranslate();
  const breakpoint = Grid.useBreakpoint();

  const { filters: initialFilters, setFilters } =
    useContext(DirectSalesContext);

  const [tempFilters, setTempFilters] = useState<FilterType>(blankFilters);

  useEffect(() => {
    if (initialFilters) {
      setTempFilters(_.cloneDeep(initialFilters));
    }
  }, [initialFilters, open]);

  const { checkboxGroupProps: brandCheckboxGroupProps } = useCheckboxGroup({
    resource: "brands",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { checkboxGroupProps: materialCheckboxGroupProps } = useCheckboxGroup({
    resource: "materials",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { checkboxGroupProps: soleCheckboxGroupProps } = useCheckboxGroup({
    resource: "soles",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { checkboxGroupProps: styleCheckboxGroupProps } = useCheckboxGroup({
    resource: "styles",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { checkboxGroupProps: tradeMarkCheckboxGroupProps } = useCheckboxGroup({
    resource: "trade-marks",
    optionLabel: "name",
    optionValue: "id",
    pagination: {
      pageSize: 1000,
    },
  });

  const { data: colorData } = useList<IColorResponse, HttpError>({
    resource: "colors",
    pagination: {
      pageSize: 1000,
    },
  });

  const colors = colorData?.data ?? [];

  const { data: sizeData } = useList<IProdAttributeResponse, HttpError>({
    resource: "sizes",
    pagination: {
      pageSize: 1000,
    },
  });

  const sizes = sizeData?.data ?? [];

  const handleColorChange = (color: IColorResponse, checked: boolean) => {
    setTempFilters((prevFilters) => {
      let updatedColors;
      if (checked) {
        updatedColors = [...prevFilters.colors, color.id];
      } else {
        updatedColors = prevFilters.colors.filter((cId) => cId !== color.id);
      }
      return {
        ...prevFilters,
        colors: updatedColors,
      };
    });
  };

  const handleSizeChange = (size: IProdAttributeResponse, checked: boolean) => {
    setTempFilters((prevFitlers) => {
      let updatedSizes;
      if (checked) {
        updatedSizes = [...prevFitlers.sizes, size.id];
      } else {
        updatedSizes = prevFitlers.sizes.filter((sId) => sId !== size.id);
      }

      return {
        ...prevFitlers,
        sizes: updatedSizes,
      };
    });
  };

  const handleCheckboxChange = (checkedValues: string[], property: string) => {
    setTempFilters((prevFilters) => ({
      ...prevFilters,
      [property]: checkedValues,
    }));
  };

  const handleOk = () => {
    setFilters(tempFilters);
    onClose();
  };

  const [isSuccess, setIsSuccess] = useState(false);

  const handleDeselectAll = () => {
    setTempFilters(blankFilters);

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  const items: CollapseProps["items"] = [
    {
      key: "brandFilter",
      label: (
        <span>
          <TagsOutlined /> {t("brands.brands")}
        </span>
      ),
      children: (
        <Checkbox.Group
          {...brandCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          onChange={(checkedValues) =>
            handleCheckboxChange(checkedValues, "brands")
          }
          value={tempFilters.brands}
        />
      ),
    },
    {
      key: "colorFilter",
      label: (
        <span>
          <ColorIcon /> {t("colors.colors")}
        </span>
      ),
      children: (
        <Space wrap>
          {colors.length > 0 && (
            <>
              {colors.map((color, index) => (
                <Tag.CheckableTag
                  key={index}
                  checked={tempFilters.colors.includes(color.id)}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "#" + color.code,
                    border: tempFilters.colors.includes(color.id)
                      ? "2px solid #fb5231"
                      : "2px solid transparent",
                  }}
                  onChange={(checked) => handleColorChange(color, checked)}
                />
              ))}
            </>
          )}
        </Space>
      ),
    },
    {
      key: "sizeFilter",
      label: (
        <span>
          <SizeIcon /> {t("sizes.sizes")}
        </span>
      ),
      children: (
        <Space wrap>
          {sizes.length > 0 && (
            <>
              {sizes.map((size, index) => (
                <Tag.CheckableTag
                  key={index}
                  checked={tempFilters.sizes.includes(size.id)}
                  style={{
                    border: tempFilters.sizes.includes(size.id)
                      ? "1px solid #fb5231"
                      : "1px solid #000000",
                    borderRadius: "0",
                    padding: "6px 12px",
                  }}
                  onChange={(checked) => handleSizeChange(size, checked)}
                >
                  {size.name}
                </Tag.CheckableTag>
              ))}
            </>
          )}
        </Space>
      ),
    },
    {
      key: "materialFilter",
      label: (
        <span>
          <MaterialIcon /> {t("materials.materials")}
        </span>
      ),
      children: (
        <Checkbox.Group
          {...materialCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          onChange={(checkedValues) =>
            handleCheckboxChange(checkedValues, "materials")
          }
          value={tempFilters.materials}
        />
      ),
    },
    {
      key: "soleFilter",
      label: (
        <span>
          <SoleIcon /> {t("soles.soles")}
        </span>
      ),
      children: (
        <Checkbox.Group
          {...soleCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          onChange={(checkedValues) =>
            handleCheckboxChange(checkedValues, "soles")
          }
          value={tempFilters.soles}
        />
      ),
    },
    {
      key: "styleFilter",
      label: (
        <span>
          <StyleIcon /> {t("styles.styles")}
        </span>
      ),
      children: (
        <Checkbox.Group
          {...styleCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          onChange={(checkedValues) =>
            handleCheckboxChange(checkedValues, "styles")
          }
          value={tempFilters.styles}
        />
      ),
    },
    {
      key: "tradeMarkFilter",
      label: (
        <span>
          <TradeMarkIcon /> {t("trade-marks.trade-marks")}
        </span>
      ),
      children: (
        <Checkbox.Group
          {...tradeMarkCheckboxGroupProps}
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          onChange={(checkedValues) =>
            handleCheckboxChange(checkedValues, "tradeMarks")
          }
          value={tempFilters.tradeMarks}
        />
      ),
    },
  ];

  return (
    <Drawer
      width={breakpoint.sm ? "500px" : "100%"}
      zIndex={1001}
      onClose={onClose}
      open={open}
      style={{ borderTopLeftRadius: "1rem", borderBottomLeftRadius: "1rem" }}
      closable={false}
      footer={
        <Flex align="center" justify="space-between">
          <Button
            type="primary"
            ghost
            icon={
              <AnimatePresence mode="wait">
                <motion.span
                  key={isSuccess ? "check" : "delete"}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSuccess ? <CheckOutlined /> : <DeleteOutlined />}
                </motion.span>
              </AnimatePresence>
            }
            onClick={handleDeselectAll}
          >
            {t("actions.deselectAll")}
          </Button>
          <Space>
            <Button type="default" onClick={onClose}>
              {t("actions.skip")}
            </Button>
            <Button type="primary" onClick={handleOk}>
              {t("actions.ok")}
            </Button>
          </Space>
        </Flex>
      }
    >
      <Row>
        <Col span={20}>
          <Title level={4}>{t("products.filters.attribute")}</Title>
        </Col>
        <Col span={4} style={{ textAlign: "end" }}>
          <Button type="text" onClick={onClose} icon={<CloseOutlined />} />
        </Col>
        <Col span={24}>
          <Collapse
            defaultActiveKey={["colorFilter", "sizeFilter"]}
            ghost
            items={items}
          />
        </Col>
      </Row>
    </Drawer>
  );
};
