import dayjs from "dayjs";

/**
 * Chuyển đổi timestamp thành các định dạng ngày tháng khác nhau.
 * @param {number} timestamp - Timestamp cần chuyển đổi.
 * @returns {{ dateFormat: string, timeFormat: string, dateTimeFormat: string }} - Các định dạng ngày tháng đã chuyển đổi.
 */
export function formatTimestamp(timestamp: number): {
  dateFormat: string;
  timeFormat: string;
  dateTimeFormat: string;
} {
  const formattedDateTime = dayjs(timestamp).format("DD/MM/YYYY HH:mm:ss");
  const formattedDate = dayjs(timestamp).format("DD/MM/YYYY");
  const formattedTime = dayjs(timestamp).format("HH:mm");

  return {
    dateFormat: formattedDate,
    timeFormat: formattedTime,
    dateTimeFormat: formattedDateTime,
  };
}
