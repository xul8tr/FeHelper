# Image Base64 Conversion Tool

## Introduction
The Image Base64 Conversion Tool is a practical tool provided by FeHelper for bidirectional conversion between images and Base64 encoding. This tool supports multiple image formats and provides convenient drag-and-drop, paste, and other operation methods, making image conversion simpler and more efficient.

## Main Features

### Image to Base64 Features
1. **Multiple Upload Methods**
   - Click to select image files
   - Drag images to designated area
   - Directly paste screenshots
   - Paste image URL addresses

2. **Real-time Preview**
   - Display original image preview
   - Display converted Base64 encoding
   - Display original image size and Base64 data size

3. **Smart Processing**
   - Auto-identify image format
   - Auto-process image URLs
   - Support multiple image formats (jpg, jpeg, gif, png, bmp)

### Base64 to Image Features
1. **Data Input**
   - Support direct paste of Base64 data
   - Auto-complete DataURI prefix
   - Real-time preview of conversion results

2. **Error Handling**
   - Auto-detect Base64 data format
   - Display conversion error prompts
   - Support manual data correction

## Usage Instructions

### Image to Base64
1. After opening the tool, it defaults to "Image to Base64" mode
2. Upload images through any of the following methods:
   - Click "Select Image" button to choose local image file
   - Drag image file to designated area
   - Copy image and paste directly (supports screenshots)
   - Copy image URL and paste
3. After successful upload, the right side will display:
   - Base64 encoding result
   - Original image size
   - Base64 data size

### Base64 to Image
1. Click "Switch to Base64 to Image" button in the upper right
2. Paste Base64 data in the left input box
3. The right side will display the converted image preview in real-time
4. If the data format is incorrect, an error prompt will be displayed

## Usage Tips
1. **Quick Conversion**
   - Use screenshot tool and paste directly after capturing
   - Copy image URL and paste directly
   - Drag image files to tool window

2. **Data Copying**
   - Click result text box to auto-select all content
   - Support copying complete DataURI data

3. **Format Processing**
   - Auto-process DataURI prefix
   - Auto-identify image format
   - Support manual data format correction

## Notes
1. Image size limitations
   - Recommended to convert images smaller than 5MB
   - Oversized images may affect conversion speed

2. Data format requirements
   - Base64 data needs to be valid image data
   - Support standard DataURI format

3. Browser compatibility
   - Support mainstream modern browsers
   - Chrome, Firefox, etc. browsers are recommended

## FAQ
1. **Q: Why is the converted Base64 data so large?**
   A: Base64 encoding increases data size by about 33%, which is a normal encoding conversion process.

2. **Q: Which image formats are supported?**
   A: Supports common image formats such as jpg, jpeg, gif, png, bmp.

3. **Q: How to determine if Base64 data is valid?**
   A: The tool automatically detects data format, and invalid data will display error prompts.

## Update Log
- 2024-03-21: Optimize image processing performance
- 2024-03-20: Add drag-and-drop upload function
- 2024-03-19: Support screenshot direct paste
- 2024-03-18: Initial version release

## Feedback and Suggestions
If you encounter any problems during use or have improvement suggestions, welcome to provide feedback through the following methods:
1. Submit an Issue on GitHub
2. Send email to developer
3. Click "Feedback" button on the tool page

## Related Tools
- [JSON Format Tool](../json-format.md)
- [Image Processing Tool](../image-tools.md)
- [Encoding Converter Tool](../encoding-converter.md)
