# QR Code Tool

## Introduction
The QR Code Tool is a multifunctional tool provided by FeHelper that supports QR code generation and decoding functions. This tool provides an intuitive user interface, allowing users to easily generate custom QR codes and quickly decode existing QR code images.


![popup](static/screenshot/qr-code.png)

## Main Features

### QR Code Generation Functions
1. **Content Input**
   - Support inputting any text content
   - Support URL addresses
   - Support special characters

2. **Custom Settings**
   - Adjustable QR code size
   - Customizable QR code color
   - Support adding center icon
     * Use default icon
     * Upload custom icon
     * No icon option

3. **Result Processing**
   - Real-time preview of generated QR code
   - Support copying QR code image
   - Support downloading QR code image

### QR Code Decoding Functions
1. **Image Input Methods**
   - Click to select local image
   - Drag image to designated area
   - Directly paste screenshot
   - Paste image URL address

2. **Decoding Results**
   - Real-time display of decoded content
   - Support copying decoding results
   - Auto-identify QR code type

## Usage Instructions

### Generate QR Code
1. After opening the tool, it defaults to "QR Code Generator" mode
2. Enter content to generate QR code in the left input box
3. Set QR code parameters in the middle area:
   - Adjust size (default 200px)
   - Select color (default black)
   - Choose whether to add center icon
4. Click "Generate QR Code" button
5. View generated QR code in the right preview area
6. Can use "Copy" or "Download" buttons to save QR code

### Decode QR Code
1. Click "Switch to Decode/Scan Mode" button in the upper right
2. Input QR code image through any of the following methods:
   - Click "Select Image" button to choose local image
   - Drag image to designated area
   - Copy image and paste directly
   - Copy image URL and paste
3. Decoding result will display on the right side
4. Click result text box to auto-select all content

## Usage Tips
1. **Quick Generation**
   - Directly input URL to generate QR code
   - Use default settings for quick generation
   - Copy generated QR code image

2. **Custom Beautification**
   - Adjust QR code size for different scenarios
   - Use custom colors to increase recognition
   - Add brand icons to enhance professionalism

3. **Batch Processing**
   - Quickly decode multiple QR codes
   - Batch generate QR codes with different content
   - Save commonly used settings

## Notes
1. Image Format Support
   - Support jpg, jpeg, gif, png, bmp formats
   - Recommend using clear, high-contrast images

2. QR Code Content Limitations
   - Content length affects QR code complexity
   - Special characters may need proper encoding

3. Image Size Limitations
   - Recommend using images smaller than 5MB
   - Oversized images may affect processing speed

## FAQ
1. **Q: Why can't the generated QR code be scanned?**
   A: Possible reasons include: content too long, QR code size too small, insufficient color contrast, etc.

2. **Q: Which types of QR codes are supported?**
   A: Supports standard QR codes, Data Matrix, Aztec, and other formats.

3. **Q: How to improve QR code recognition rate?**
   A: Recommend using appropriate size, maintaining sufficient white space, choosing high-contrast colors.

## Update Log
- 2024-03-21: Optimize QR code generation performance
- 2024-03-20: Add custom icon function
- 2024-03-19: Support drag-and-drop upload images
- 2024-03-18: Initial version release

## Feedback and Suggestions
If you encounter any problems during use or have improvement suggestions, welcome to provide feedback through the following methods:
1. Submit an Issue on GitHub
2. Send email to developer
3. Click "Feedback" button on the tool page

## Related Tools
- [Image Base64 Conversion Tool](../image-base64.md)
- [Image Processing Tool](../image-tools.md)
- [Encoding Converter Tool](../encoding-converter.md)
