# JSON Comparison Tool

## Introduction

The JSON Comparison Tool is a professional JSON data comparison tool provided by FeHelper. It helps developers quickly compare differences between two JSON data sets and display difference points in an intuitive way. This tool supports various JSON data formats including objects, arrays, nested structures, etc., making it a powerful assistant for API debugging, data validation, and configuration comparison.

![popup](static/screenshot/json-diff.png)

## Main Features

### 1. Basic Comparison Features
- **Real-time Comparison**: Automatically compares after inputting JSON data
- **Difference Highlighting**: Uses different colors to mark added, deleted, and modified content
- **Structure Comparison**: Supports comparison of complex JSON structures
- **Syntax Validation**: Automatically detects JSON syntax errors

### 2. Advanced Comparison Features
- **Smart Matching**: Automatically identifies similar data structures
- **Path Display**: Clearly shows specific paths of different data
- **Difference Statistics**: Shows the number of difference points
- **Formatted Display**: Automatically formats JSON data for improved readability

### 3. Sample Data
The tool includes various built-in sample data for quick start:
- **User Information**: Shows comparison of user data structures
- **Product Data**: Shows comparison of product information
- **Configuration Options**: Shows comparison of configuration files
- **API Response**: Shows comparison of API return data

### 4. Interface Features
- **Dual-column Layout**: Left and right columns display JSON data to be compared
- **Syntax Highlighting**: Uses CodeMirror to provide professional code editing experience
- **Real-time Preview**: Comparison results display in real-time
- **Error Prompts**: Clear error prompts and positioning

## Usage Instructions

### Basic Usage
1. Paste the first JSON data in the left input box
2. Paste the second JSON data in the right input box
3. The tool will automatically compare and display differences

### Advanced Feature Usage
1. **Using Sample Data**:
   - Click "Sample Data" dropdown menu
   - Select the desired sample type
   - The tool will automatically fill in sample data

2. **View Differences**:
   - Added content: Green highlighting
   - Deleted content: Red highlighting
   - Modified content: Yellow highlighting

3. **Error Handling**:
   - When JSON format is incorrect, the tool displays specific error positions
   - Supports automatic fixing of common JSON format issues

## Usage Tips

1. **Quick Comparison**:
   - Use sample data to quickly understand tool functionality
   - Support copy-paste JSON data
   - Support drag-and-drop files to input box

2. **Difference Analysis**:
   - Focus on highlighted difference sections
   - Use path information to locate specific differences
   - View difference statistics to understand overall changes

3. **Data Validation**:
   - Ensure JSON format is correct before comparison
   - Check data structure integrity
   - Verify data type correctness

## Notes

1. Ensure input JSON data format is correct
2. Large JSON data may require longer processing time
3. Pay attention to checking nested structure integrity
4. It's recommended to format JSON data before comparison

## FAQ

1. **Q: Why are my JSON comparison results inaccurate?**
   A: Please check:
   - Whether JSON data format is correct
   - Whether data structure is complete
   - Whether data types match
   - Whether there are special characters or encoding issues

2. **Q: How to handle large JSON data comparison?**
   A: Recommendations:
   - Format JSON data first
   - Compare in chunks
   - Focus on key field differences
   - Use path information for quick location

3. **Q: Why are some differences not marked?**
   A: Possible reasons:
   - Inconsistent data structure
   - Mismatched data types
   - Special character encoding issues
   - Tool configuration issues

## Update Log

### Latest Version
- Optimized processing performance for large JSON
- Improved difference display accuracy
- Added more sample data
- Optimized interface interaction experience
- Enhanced error handling capabilities

## Feedback and Suggestions

If you encounter any problems during use or have improvement suggestions, welcome to provide feedback through the following methods:
1. Submit an Issue on GitHub
2. Send email to development team
3. Leave a message on the tool market page

## Related Tools

- [JSON Format Tool](../json-format.md): For formatting JSON data
- [Code Beautify Tool](../code-beautify.md): Supports code formatting for multiple programming languages
- [Encoding Conversion Tool](../en-decode.md): Supports conversion of multiple encoding formats
