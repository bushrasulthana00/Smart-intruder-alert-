# Device Lock - Intruder Alert System

A web-based device lock screen that captures an intruder photo using the camera when someone enters the wrong password. The captured image is sent to the registered email address.

## Live Demo

[Open Website](https://selffinal.netlify.app)

## Features

- Email setup for receiving alerts
- Password-based lock screen
- Camera permission button
- Captures photo on wrong password attempt
- Sends intruder photo to email
- Change email and password options
- Reset saved setup
- Responsive dark UI
- Netlify serverless function for email sending

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Nodemailer
- Netlify Functions

## Project Structure

```text
SELFFINAL_NETLIFY_UPLOAD/
├── index.html
├── netlify.toml
├── package.json
└── netlify/
    └── functions/
        └── send-email.js
