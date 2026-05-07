# WalkIn — Kolhapur Success Stories 🚀

WalkIn is a community-driven platform designed to connect local talent in Kolhapur with professional opportunities. Whether you're a skilled electrician, a creative photographer, or a student looking for tutoring gigs, WalkIn helps you showcase your skills and find the right connections.

## 🌟 Features

- **Personalized Profiles**: Create a professional profile showcasing your education, skills, and experience.
- **Job/Service Posting**: Post services you offer or jobs you need help with, complete with pricing and categories.
- **Application Tracking**: Manage applications for your posts and track the status of jobs you've applied for.
- **Success Stories**: Explore and celebrate successful connections within the Kolhapur community.
- **Multilingual Support**: Available in English, Hindi (हिन्दी), and Marathi (मराठी).
- **Secure Authentication**: Powered by Firebase for a seamless login/signup experience.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: 
  - Node.js & Express (Local file upload server)
  - Firebase Cloud Functions (Secure image processing)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage & Local Disk (via Multer)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- A Firebase Project (for Authentication and Firestore)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Om-coder2005/WalkIn.git
   cd WalkIn
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Update the `firebaseConfig` in `home.html`, `profile.html`, and other relevant files with your Firebase project credentials.

4. **Run the Local Upload Server**:
   ```bash
   npm start
   ```
   The server will start at `http://localhost:3000`.

5. **Launch the Application**:
   Open `home.html` in your browser (using a local server like VS Code's "Live Server" is recommended for optimal performance).

## 📁 Project Structure

- `home.html`: The landing page and main entry point.
- `explore.html`: Discover success stories and available opportunities.
- `profile.html`: User profile management and activity dashboard.
- `server.js`: Express server for handling local file uploads.
- `index.js`: Firebase Cloud Function for secure image uploads.
- `uploads/`: Local directory for stored profile images and documents.

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the ISC License.

---
Built with ❤️ in Kolhapur.
