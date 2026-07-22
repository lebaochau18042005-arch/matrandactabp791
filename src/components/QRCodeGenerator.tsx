import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 128,
  fgColor = '#000000',
  bgColor = '#ffffff',
}) => {
  return (
    <div className="bg-white p-2 rounded-xl inline-block shadow-lg">
      <QRCodeSVG
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level="Q"
      />
    </div>
  );
};
