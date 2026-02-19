"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";


export default function Home() {
  const videoRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [mode, setMode] = useState(null);
  const controlsRef = useRef(null);

  const codeReader = new BrowserMultiFormatReader();

  // 📷 Camera Scan
useEffect(() => {
  // let controls;
  let controls: IScannerControls | undefined;

  if (mode === "camera") {
    const startScanner = async () => {
          // ✅ ADD THIS CHECK FIRST
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera not supported. Please open using HTTPS.");
      return;
    }
      try {
        controls = await codeReader.decodeFromVideoDevice(
          // null,
          undefined,
          videoRef.current,
          async (result, err) => {
            if (result) {
              const decodedText = result.getText();
              console.log("Scanned:", decodedText);

              try {
                const res = await fetch(decodedText);
                const data = await res.json();
                setProduct(data);
              } catch (error) {
                alert("Invalid product URL");
              }

              if (controls) controls.stop(); // ✅ safe stop
              setMode(null);
            }
          }
        );
      } catch (error) {
        console.error(error);
      }
    };

    startScanner();
  }

  return () => {
    if (controls) controls.stop();
  };
}, [mode]);


  // 🖼 Image Upload Scan
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await codeReader.decodeFromImageUrl(
        URL.createObjectURL(file)
      );

      const decodedText = result.getText();

      const res = await fetch(decodedText);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      alert("Could not read barcode.");
    }

    setMode(null);
  };

  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <h1>Barcode Scanner</h1>

      {!mode && (
        <button onClick={() => setMode("choose")}>
          Scan
        </button>
      )}

      {mode === "choose" && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => setMode("camera")}>
            📷 Use Camera
          </button>

          <label style={{ marginLeft: "10px", cursor: "pointer" }}>
            🖼 Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      )}

      {mode === "camera" && (
        <video
          ref={videoRef}
          style={{ width: "100%", maxWidth: "400px", marginTop: "20px" }}
        />
      )}

      {product && (
        <div style={{ marginTop: "20px", border: "1px solid black", padding: "10px" }}>
          <h2>Product Details</h2>
          <p><strong>ID:</strong> {product.id}</p>
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Price:</strong> ₹{product.price}</p>
        </div>
      )}
    </div>
  );
}
