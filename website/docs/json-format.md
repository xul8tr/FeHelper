# JSON Format Tool

## Introduction

The JSON Format Tool is a powerful JSON data processing tool provided by FeHelper that helps developers quickly format, beautify, compress, and validate JSON data. This tool supports various JSON processing functions including auto-formatting, manual formatting, garbled code decoding, sorting, BigInt handling, etc., making it an indispensable auxiliary tool in web development.


![popup](static/screenshot/json-format.png)

![popup](static/screenshot/json-format-auto.png)

## Main Features

### 1. Basic Formatting Functions
- **Auto-formatting**: One-click conversion of messy JSON data to formatted, readable form
- **Manual Formatting**: Manually trigger formatting operation via format button
- **Compression Function**: Compress JSON data to a single line, removing all unnecessary spaces and line breaks
- **JSON Validation**: Automatically detect JSON syntax errors and provide detailed error information

### 2. Advanced Processing Functions
- **JSONP Support**: Automatically recognize and process JSONP format data
- **Auto-decode**: Support auto-decoding of URL-encoded and Unicode-encoded JSON data
- **BigInt Support**: Correctly handle BigInt type data in JavaScript
- **Node Editing**: Support direct editing of formatted JSON nodes
- **Sorting Function**:
  - Default sorting: Maintain original order
  - Ascending sorting: Sort by key name in ascending order
  - Descending sorting: Sort by key name in descending order

### 3. Encoding Conversion Functions
- **Unicode Encoding**: Support converting special characters in JSON to Unicode encoding
- **Unicode Decoding**: Support converting Unicode encoding back to original characters
- **URL Decoding**: Support decoding URL-encoded JSON data

### 4. Interface Features
- **Dual-mode Layout**:
  - Left-right layout: Suitable for widescreen displays
  - Top-bottom layout: Suitable for narrow displays
- **Syntax Highlighting**: Uses CodeMirror to provide professional code editing experience
- **Real-time Preview**: Formatting results display in real-time
- **Error Prompts**: Clear error prompts and positioning

## Usage Instructions

### Basic Usage
1. Paste JSON data to be formatted in the input box
2. Click "Format" button to format
3. Formatted results will display on the right (left-right layout) or below (top-bottom layout)

### Advanced Feature Usage
1. **Auto-decode**:
   - Check "Auto-decode" option
   - Paste JSON data containing encoding
   - Tool will automatically decode and format

2. **JSON Sorting**:
   - Select sorting method (default/ascending/descending)
   - Click format button
   - Results will be reordered according to selected method

3. **Node Editing**:
   - Check "Node Editing" option
   - Click formatted JSON nodes
   - Can directly edit node content

4. **Encoding Conversion**:
   - Use encoding conversion button on toolbar
   - Support Unicode encoding/decoding
   - Support URL decoding

## Usage Tips

1. **Quick Formatting**:
   - Use shortcut key `Ctrl + Enter` for quick formatting
   - Support auto-detection of JSON data in page

2. **Error Handling**:
   - When JSON format is incorrect, tool displays specific error positions
   - Support automatic fixing of common JSON format issues

3. **Large Data Processing**:
   - Support processing of large JSON data
   - Provide performance-optimized processing methods

4. **JSONP Processing**:
   - Auto-recognize JSONP format
   - Support extracting JSON data from JSONP

## Notes

1. When processing large JSON data, it's recommended to use compression mode
2. Pay attention to maintaining JSON format correctness when editing JSON
3. When using auto-decode function, ensure original data is decodable
4. Pay attention to precision issues when processing BigInt data

## FAQ

1. **Q: Why does my JSON display errors after formatting?**
   A: Please check if JSON data conforms to standard format, especially note:
   - All key names must be surrounded by double quotes
   - Cannot use single quotes
   - Cannot have extra commas
   - Ensure all brackets are correctly paired

2. **Q: How to handle JSON with special characters?**
   A: You can use Unicode encoding function to convert special characters to Unicode encoding, or use auto-decode function to process already encoded data.

3. **Q: Why did my BigInt data change after formatting?**
   A: The tool automatically handles BigInt data to ensure numerical accuracy. If you find numerical changes, please check if the original data is correct.

## Update Log

### Latest Version
- Support BigInt type data processing
- Optimized processing performance for large JSON
- Improved error prompt accuracy
- Added auto-decode function
- Optimized interface layout and interaction experience

## Feedback and Suggestions

If you encounter any problems during use or have improvement suggestions, welcome to provide feedback through the following methods:
1. Submit an Issue on GitHub
2. Send email to development team
3. Leave a message on the tool market page

## Related Tools

- [JSON Comparison Tool](../json-diff.md): For comparing differences between two JSON data sets
- [Code Beautify Tool](../code-beautify.md): Supports code formatting for multiple programming languages
- [Encoding Conversion Tool](../en-decode.md): Supports conversion of multiple encoding formats
