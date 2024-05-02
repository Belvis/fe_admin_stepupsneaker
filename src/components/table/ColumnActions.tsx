import { DeleteOutlined } from "@ant-design/icons";
import { DeleteButton, EditButton, ShowButton } from "@refinedev/antd";
import { CanAccess, useTranslate } from "@refinedev/core";
import { Button, Space, Tooltip } from "antd";
import React, { useCallback } from "react";

interface ColumnActionsProps {
  hideShow?: boolean;
  hideEdit?: boolean;
  hideDelete?: boolean;
  onShowClick?: (id: string) => void;
  onEditClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
  record: any;
  customButtons?: React.ReactNode[];
}

const ColumnActions: React.FC<ColumnActionsProps> = ({
  hideShow = false,
  hideEdit = false,
  hideDelete = false,
  onShowClick,
  onEditClick,
  onDeleteClick,
  record,
  customButtons = [],
}) => {
  const t = useTranslate();

  const handleShowClick = useCallback(
    () => onShowClick && onShowClick(record.id),
    [onShowClick, record.id]
  );

  const handleEditClick = useCallback(
    () => onEditClick && onEditClick(record.id),
    [onEditClick, record.id]
  );

  const handleDeleteClick = useCallback(
    () => onDeleteClick && onDeleteClick(record.id),
    [onDeleteClick, record.id]
  );

  return (
    <Space size="middle">
      {!hideShow && (
        <Tooltip title={t("actions.show")}>
          <ShowButton
            size="small"
            hideText
            recordItemId={record.id}
            {...(onShowClick && { onClick: handleShowClick })}
          />
        </Tooltip>
      )}
      {!hideEdit && (
        <Tooltip title={t("actions.edit")}>
          <EditButton
            style={{ color: "#52c41a", borderColor: "#52c41a" }}
            size="small"
            hideText
            recordItemId={record.id}
            {...(onEditClick && { onClick: handleEditClick })}
          />
        </Tooltip>
      )}
      {!hideDelete && (
        <Tooltip title={t("actions.delete")}>
          <CanAccess
            resource="dashboard"
            action="list"
            key="dashboard-author"
            fallback={
              <Button danger disabled size="small" icon={<DeleteOutlined />} />
            }
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleDeleteClick}
            />
          </CanAccess>
        </Tooltip>
      )}
      {customButtons.map((button, index) => (
        <React.Fragment key={index}>{button}</React.Fragment>
      ))}
    </Space>
  );
};

export default ColumnActions;
