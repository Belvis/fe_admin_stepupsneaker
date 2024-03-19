import { Button, Modal, ModalProps } from "antd";
import QrScanner from "qr-scanner";
import { useEffect, useRef } from "react";

interface QRScannerModalProps {
  onScanSuccess: (result: string) => void;
  modalProps: ModalProps;
  close: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  modalProps,
  close,
  onScanSuccess,
}) => {
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoElementRef.current;

    if (video) {
      const qrScanner = new QrScanner(
        video,
        (result: { data: string }) => {
          console.log("decoded qr code:", result);
          onScanSuccess(result.data);
          close();
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      qrScanner.start();

      return () => {
        console.log("unmounted");
        qrScanner.stop();
        qrScanner.destroy();
      };
    }
  }, []);

  return (
    <Modal title="Quét mã QR" {...modalProps} zIndex={2001}>
      <div className="videoWrapper">
        <video className="qrVideo" ref={videoElementRef} />
      </div>
    </Modal>
  );
};
