"use client"

import { useEffect, useRef } from "react"
import QRCode from "react-qr-code"
import JsBarcode from "jsbarcode"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface DesignLabelProps {
  code: string
  title: string
  series?: string
  baseUrl?: string
}

export function DesignLabel({ code, title, series, baseUrl = "https://termostick.uz" }: DesignLabelProps) {
  const barcodeRef = useRef<SVGSVGElement>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const qrUrl = `${baseUrl}/d/${code}`

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, code, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 14,
        margin: 5,
        background: "#ffffff",
      })
    }
  }, [code])

  const handlePrint = () => {
    if (!printRef.current) return

    const printContent = printRef.current.innerHTML
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Этикетка ${code}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; }
            .label {
              width: 80mm;
              padding: 5mm;
              border: 1px dashed #ccc;
              page-break-after: always;
            }
            .header {
              text-align: center;
              margin-bottom: 3mm;
            }
            .code {
              font-size: 16pt;
              font-weight: bold;
            }
            .title {
              font-size: 10pt;
              color: #333;
              margin-top: 1mm;
            }
            .series {
              font-size: 8pt;
              color: #666;
            }
            .codes-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 3mm;
              gap: 3mm;
            }
            .qr-section {
              text-align: center;
            }
            .qr-section svg {
              width: 25mm;
              height: 25mm;
            }
            .qr-label {
              font-size: 6pt;
              color: #666;
              margin-top: 1mm;
            }
            .barcode-section {
              flex: 1;
              text-align: center;
            }
            .barcode-section svg {
              width: 100%;
              max-height: 15mm;
            }
            @media print {
              .label { border: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="space-y-4">
      <div
        ref={printRef}
        className="bg-white border rounded-lg p-4 max-w-md"
      >
        <div className="label">
          <div className="header">
            <div className="code text-lg font-bold">{code}</div>
            <div className="title text-sm text-gray-700">{title}</div>
            {series && <div className="series text-xs text-gray-500">{series}</div>}
          </div>
          <div className="codes-row flex justify-between items-center mt-4 gap-4">
            <div className="qr-section text-center">
              <QRCode value={qrUrl} size={80} level="M" />
              <div className="qr-label text-xs text-gray-500 mt-1">QR: {qrUrl}</div>
            </div>
            <div className="barcode-section flex-1 text-center">
              <svg ref={barcodeRef} className="w-full" />
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handlePrint} variant="outline" className="gap-2">
        <Printer className="h-4 w-4" />
        Печать этикетки
      </Button>
    </div>
  )
}
