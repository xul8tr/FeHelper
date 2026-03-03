# Mock Data Generator

> Quickly generate various test data, supporting personal information, business data, technical data, and other types. Customizable fields and output formats. Modern left-right split layout with configuration operations on the left and real-time preview results on the right.

## Features

- **Modern Interface**: Adopts left-right split layout design, with configuration operation area on the left and result display area on the right
- **One-click Quick Templates**: Provides 5 preset templates, click to automatically select fields and generate data
- **Multiple Data Types**: Supports 4 major categories including personal information, business data, technical data, and custom data
- **Smart Operation Area**: Quick templates and main operation buttons at the top for improved operational efficiency
- **Multiple Output Formats**: Supports JSON, CSV, SQL, XML, and other format outputs
- **Real-time Result Preview**: Right side displays generation results in real-time, supports one-click copy and download
- **Batch Generation**: Supports generating 1-1000 data records at once
- **Chinese Data Optimization**: Specially optimized for localized data such as Chinese names, addresses, companies, etc.
- **Responsive Design**: Supports adaptive layout for different screen sizes

## Interface Layout

### Modern Top Navigation Bar
- **Brand Identity**: FeHelper Logo + Tool Name
- **Tool Market**: One-click access to more practical tools
- **Support**: Support developers to continue optimizing tools

### Left Configuration Operation Area (Fixed width 500px)
1. **Quick Template Area**: 5 preset template buttons for one-click generation of common data
2. **Main Operation Area**: Generate data, select all, clear - three main operation buttons
3. **Data Type Selection**: Four tabs for personal information, business data, technical data, and custom data
4. **Field Selection Area**: Display selectable fields based on selected tab
5. **Generation Configuration Area**: Set generation quantity and output format

### Right Result Display Area (Adaptive width)
1. **Result Title Bar**: Display generation result statistics and data size
2. **Operation Button Area**: Copy result, download file (auto-disabled when no data)
3. **Result Display Area**: Code-highlighted display of generated data, supports scrolling
4. **Empty State Prompt**: Display friendly empty state interface when no data

## Data Types

### Personal Information
- **Name**: Randomly generate Chinese names, supports single and double character names
- **Email**: Generate email addresses in valid format
- **Phone Number**: Generate phone numbers in China mainland format
- **ID Number**: Generate ID numbers in valid format
- **Gender**: Randomly generate male/female
- **Age**: Random age 18-65
- **Birthday**: Randomly generate date
- **Address**: Complete address including province, city, district, and street

### Business Data
- **Company Name**: Well-known company names + business entity suffix
- **Department**: Technology department, product department, operations department, etc.
- **Position**: Engineer, manager, specialist, etc.
- **Salary**: Random salary 5000-50000 yuan
- **Bank Card Number**: Bank card number in valid format
- **Credit Card Number**: Credit card number in valid format
- **Price**: Random price 0.01-9999.99
- **Currency**: Currency codes such as CNY, USD, EUR

### Technical Data
- **UUID**: Standard UUID format
- **IP Address**: IPv4 address format
- **MAC Address**: Network card MAC address format
- **User Agent**: Common browser UA strings
- **URL**: Complete URL format
- **Domain Name**: Random domain name
- **Password**: Random password containing numbers, letters, and special symbols
- **Token**: 32-bit random Token
- **Color Value**: Hexadecimal color code
- **Timestamp**: Unix timestamp
- **File Name**: Random file name and extension
- **MIME Type**: Common file MIME types

### Custom Data
- **String Type**: Random strings of custom length
- **Number Type**: Random numbers in the range 1-1000
- **Boolean Type**: Random true/false values
- **Date Type**: Random date time
- **Array Type**: Array containing 1-5 random strings

## Usage Methods

### Method 1: Quick Template (Recommended)
1. **Select Template**: Click any quick template button at the top left
2. **Auto-generate**: System automatically selects fields, switches tabs, and generates data
3. **View Results**: Right side immediately displays generated data results
4. **Copy/Download**: Click right-side buttons to copy or download data with one click

### Method 2: Manual Configuration
1. **Select Data Type**: Click data type tab (Personal Information/Business Data/Technical Data/Custom Data)
2. **Select Fields**: Check the checkboxes for fields to generate
3. **Configure Parameters**: Set generation quantity (1-1000) and output format
4. **Generate Data**: Click "Generate Data" button
5. **View Results**: View generated data on the right
6. **Operate Results**: Use copy or download function to save data

### Quick Operations
- **Select All**: Quickly select all fields in current tab
- **Clear**: Clear all selections and generation results
- **Real-time Preview**: Right side displays data size and count in real-time

## Quick Template Details

The system provides 5 carefully designed preset templates that generate data automatically when clicked:

### User Information Template
**Field Combination**: Name, email, phone number, gender, age, address
**Application Scenarios**: User management system, member information, personal data testing

### Employee Information Template  
**Field Combination**: Name, email, phone number, company, department, position, salary
**Application Scenarios**: HR system, employee management, organizational structure testing

### Product Information Template
**Field Combination**: Name, price, currency, UUID, timestamp
**Application Scenarios**: E-commerce system, product management, inventory system testing

### Order Information Template
**Field Combination**: UUID, name, email, phone number, address, price, timestamp
**Application Scenarios**: Order management system, transaction records, logistics system testing

### API Test Data Template
**Field Combination**: UUID, Token, IP address, User Agent, timestamp, boolean
**Application Scenarios**: Interface testing, log analysis, system integration testing

## Custom Fields

Supports adding completely custom fields:

### Configuration Steps
1. **Switch to Custom Data Tab**
2. **Enter Field Name**: Define the field name
3. **Select Data Type**: String, number, boolean, date, array
4. **Set Generation Rules**: Optional, describe field generation rules
5. **Add Field**: Click "Add Field" button
6. **Manage Fields**: View and delete in added field list

### Supported Data Types
- **String**: Random string of 5-20 characters
- **Number**: Random integer in range 1-1000
- **Boolean**: Random true/false
- **Date**: Random date time string
- **Array**: Array containing 1-5 random strings

## Output Formats

### JSON Format (Default)
```json
[
  {
    "name": "Wang Wei",
    "email": "wangwei@example.com",
    "phone": "13812345678",
    "gender": "Male",
    "age": 28,
    "address": "No. 123 Jianguo Road, Chaoyang District, Beijing"
  }
]
```

### CSV Format
```csv
name,email,phone,gender,age,address
Wang Wei,wangwei@example.com,13812345678,Male,28,No. 123 Jianguo Road, Chaoyang District, Beijing
Li Na,lina@example.com,13987654321,Female,32,No. 456 Century Avenue, Pudong New Area, Shanghai
```

### SQL INSERT Format
```sql
CREATE TABLE fake_data (
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  gender VARCHAR(255),
  age INT,
  address VARCHAR(255)
);

INSERT INTO fake_data (name, email, phone, gender, age, address) VALUES 
('Wang Wei', 'wangwei@example.com', '13812345678', 'Male', 28, 'No. 123 Jianguo Road, Chaoyang District, Beijing'),
('Li Na', 'lina@example.com', '13987654321', 'Female', 32, 'No. 456 Century Avenue, Pudong New Area, Shanghai');
```

### XML Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<data>
  <item id="1">
    <name>Wang Wei</name>
    <email>wangwei@example.com</email>
    <phone>13812345678</phone>
    <gender>Male</gender>
    <age>28</age>
    <address>No. 123 Jianguo Road, Chaoyang District, Beijing</address>
  </item>
</data>
```

## Use Cases

### Development Testing
- **Database Population**: Quickly generate large amounts of test data for development environment
- **Interface Testing**: Generate request data in valid format for API testing
- **Form Testing**: Fill frontend forms with various types of test data
- **Unit Testing**: Provide mock data for automated testing

### Demo Data
- **Product Demo**: Prepare realistic data for product demonstrations
- **User Training**: Prepare safe virtual data for training environment
- **Prototype Design**: Provide data support for design prototypes
- **System Showcase**: Generate beautiful sample data for system display

### Stress Testing
- **Performance Testing**: Generate large amounts of data for system stress testing
- **Concurrency Testing**: Simulate multi-user environment for concurrency testing
- **Capacity Testing**: Test system performance under large data volumes

### Data Analysis
- **Algorithm Testing**: Provide test datasets for data analysis algorithms
- **Chart Display**: Provide display data for data visualization components
- **Statistical Analysis**: Provide sample data for statistical functions

## Interface Features

### Responsive Design
- **Large Screen Devices** (>1024px): Complete left-right split layout
- **Tablet Devices** (768px-1024px): Top-bottom layout, maintaining full functionality
- **Mobile Devices** (<768px): Vertical layout, buttons and fields adapted for mobile

### User Experience Optimization
- **Empty State Design**: Friendly empty data prompt interface
- **Smart Button State**: Auto-disable copy/download buttons when no data
- **Real-time Data Statistics**: Dynamically display generation count and data size
- **One-click Operations**: Quick templates support one-click generation without multiple steps
- **Visual Feedback**: Button hover effects, gradient backgrounds, shadow effects

### Color Design
- **Brand Colors**: Purple-blue gradient primary colors reflecting professionalism
- **Clear Hierarchy**: Distinguish functional areas through color depth
- **Dark Mode**: Auto-adapt to system dark mode preferences

## Notes

1. **Data Security**: Generated data is for testing only, do not use in production environment
2. **Privacy Protection**: Generated personal information is virtual data, do not use for fraud or other illegal activities
3. **Format Specifications**: Generated data follows common format specifications but does not guarantee 100% real validity
4. **Quantity Limit**: Maximum 1000 records per generation to avoid browser performance issues
5. **Chinese Optimization**: Optimized for Chinese environment, especially fields like names and addresses
6. **Browser Compatibility**: Modern browsers recommended for best experience

## FAQ

**Q: What's the difference between quick templates and manual configuration?**
A: Quick templates generate common data combinations with one click, manual configuration allows free selection of any field combination. Quick templates are more suitable for rapid prototyping and common scenarios, manual configuration is more flexible.

**Q: Are the generated ID numbers real?**
A: No, generated ID numbers only conform to format specifications and are virtual data, not corresponding to real personal information.

**Q: How many data records can be generated?**
A: Maximum 1000 records per generation, more data can be generated in batches.

**Q: Which output formats are supported?**
A: Currently supports JSON, CSV, SQL INSERT, and XML formats, meeting data import needs of different systems.

**Q: How to add custom fields?**
A: Switch to "Custom Data" tab, fill in field name, select data type, optionally fill in generation rules, then click "Add Field".

**Q: Why are the copy and download buttons grayed out on the right?**
A: When no data is generated, these buttons are auto-disabled and displayed in gray. After generating data, buttons will automatically activate.

**Q: What to do if data generation fails?**
A: Please ensure at least one field is selected or custom field is added, then click "Generate Data" button again.

**Q: Does it support mobile use?**
A: Yes, the interface adopts responsive design and will automatically adjust to suitable layout on phones and tablets.
