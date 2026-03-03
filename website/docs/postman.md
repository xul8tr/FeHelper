# Postman API Debugging Tool

## Introduction
The Postman API Debugging Tool is a powerful and easy-to-use HTTP interface debugging tool provided by FeHelper. It supports various request methods including GET, POST, PUT, DELETE, and is suitable for frontend-backend development, API integration, interface testing, and other scenarios. It supports request parameters, request headers, response preview, history records, and other functions.

## Main Features

### Request Support
1. **Multiple Request Methods**
   - Support common HTTP methods such as GET, POST, PUT, DELETE
   - Support custom request methods

2. **Parameter Settings**
   - Support URL parameters, Body parameters, Header parameters
   - Support multiple formats including form, JSON, x-www-form-urlencoded
   - Support file upload

3. **Request Header Management**
   - Support custom request headers
   - Support quick addition of common Headers

### Response Processing
1. **Response Preview**
   - Support highlighted display of multiple formats such as JSON, XML, HTML, plain text
   - Support response content folding and expanding
   - Support viewing response time, status code, Headers

2. **History Records**
   - Automatically save request history
   - Support one-click resend of historical requests
   - Support history record search and management

3. **Data Import/Export**
   - Support exporting request use cases as JSON
   - Support batch importing use cases

### Other Functions
1. **Environment Variables**
   - Support custom environment variables
   - Variables can be used in URL, Header, Body, etc.

2. **API Grouping**
   - Support API group management
   - Facilitate team collaboration

3. **Interface Interaction**
   - Responsive design, adapts to different resolutions
   - Support keyboard shortcut operations

## Usage Instructions

### Basic Usage
1. Create Request
   - Select request method (GET/POST, etc.)
   - Enter API URL
   - Set request parameters and Headers
   - Click "Send" button

2. View Response
   - Response content automatically highlighted
   - Can switch to different format previews
   - View response Headers, status code, time consumed, etc.

3. Manage History
   - History requests automatically saved
   - Can resend historical requests with one click
   - Support deleting and searching history records

### Advanced Functions
1. **Use Case Management**
   - Export request use cases as JSON
   - Batch import use cases
   - For team sharing

2. **Environment Variables**
   - Set global variables
   - Reference variables in requests
   - Convenient for multi-environment switching

3. **API Grouping**
   - Create groups to manage APIs
   - Support batch operations

## Usage Tips
1. **Efficient Debugging**
   - Use history records for quick retesting
   - Use variables to manage different environments
   - Batch import/export use cases

2. **Format Response**
   - JSON/XML response automatically highlighted
   - Support folding and copying

3. **Team Collaboration**
   - Export use cases for sharing with colleagues
   - Group management facilitates multi-person collaboration

## Notes
1. Usage Limitations
   - Single request size recommended not to exceed 10MB
   - Oversized responses may affect performance

2. Compatibility
   - Support mainstream browsers
   - Latest version of Chrome recommended

3. Security
   - Pay attention to protecting sensitive information
   - Not recommended to save sensitive use cases in public environments

## FAQ
1. **Q: Why does the request fail?**
   A: Check API address, parameters, Header settings, or whether backend service is available.

2. **Q: How to export/import use cases?**
   A: Click export/import button in use case management area and select JSON file.

3. **Q: What if response content is garbled?**
   A: Check encoding settings in response Header, or try switching preview format.

## Update Log
- 2024-03-21: Optimize response highlighting and history management
- 2024-03-20: Add use case import/export function
- 2024-03-19: Improve parameter setting experience
- 2024-03-18: Initial version release

## Feedback and Suggestions
If you encounter any problems during use or have improvement suggestions, welcome to provide feedback through the following methods:
1. Submit an Issue on GitHub
2. Send email to developer
3. Click "Feedback" button on the tool page

## Related Tools
- [WebSocket Tool](../websocket.md)
- [Encoding Conversion Tool](../en-decode.md)
- [JSON Format Tool](../json-format.md)
