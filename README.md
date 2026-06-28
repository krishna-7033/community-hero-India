# Community Hero 🌍

Community Hero is a full-stack web application that empowers citizens to report community issues such as potholes, garbage, broken streetlights, water leakage, and other civic problems. The platform provides an intuitive interface for users to submit reports with images and location details, while administrators can securely manage and track reported issues through a dedicated dashboard.

---

## 🚀 Features

### Citizen Features

* Report community issues with title and description.
* Upload evidence images.
* Select issue location.
* Track submitted reports.
* Responsive and user-friendly interface.

### Admin Features

* Secure admin authentication.
* Dashboard with issue statistics.
* View all reported issues.
* Update issue status.
* Manage community reports efficiently.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide React

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* MongoDB Atlas
* Mongoose

### Deployment

* Render

---

## 📁 Project Structure

```text
community-hero/
│
├── src/                # React frontend
├── dist/               # Production build
├── server.ts           # Express server
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/your-username/community-hero.git
```

Navigate into the project:

```bash
cd community-hero
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root and add the required environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional API keys your project requires.

---

## ▶️ Running Locally

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## 🌐 Deployment

This project is deployed on **Render**.

Typical deployment configuration:

* **Environment:** Node
* **Build Command:**

```bash
npm install && npm run build
```

* **Start Command:**

```bash
npm start
```

---

## 📸 Screenshots

You can include screenshots here:

* Home Page
* Report Issue
* Admin Login
* Admin Dashboard

---

## 🔒 Security

* JWT-based authentication
* Environment variables for sensitive information
* Input validation
* Secure password handling
* Protected admin routes

---

## 👨‍💻 Author

**Krishna Nandan Jha**

---

## 📄 License

This project is developed for educational and demonstration purposes.
